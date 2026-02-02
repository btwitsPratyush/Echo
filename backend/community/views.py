from __future__ import annotations

from django.db.models import BooleanField, Count, Exists, OuterRef, Sum, Value
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework import serializers

from .models import Comment, CommentLike, KarmaActivity, Post, PostLike
from .serializers import (
    CommentCreateSerializer,
    LeaderboardEntrySerializer,
    PostDetailSerializer,
    PostSerializer,
    build_comment_tree,
)
from .services import leaderboard_last_24h, like_comment, like_post

User = get_user_model()


class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150)
    password = serializers.CharField(min_length=8, max_length=128, write_only=True)

    def validate_username(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Username cannot be blank.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        s = SignupSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = User.objects.create_user(
            username=s.validated_data["username"],
            password=s.validated_data["password"],
        )
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key}, status=status.HTTP_201_CREATED)


def _annotate_liked_by_me_for_posts(qs, user):
    if user.is_authenticated:
        liked_subq = PostLike.objects.filter(post_id=OuterRef("pk"), user=user)
        return qs.annotate(liked_by_me=Exists(liked_subq))
    return qs.annotate(liked_by_me=Value(False, output_field=BooleanField()))


def _annotate_liked_by_me_for_comments(qs, user):
    if user.is_authenticated:
        liked_subq = CommentLike.objects.filter(comment_id=OuterRef("pk"), user=user)
        return qs.annotate(liked_by_me=Exists(liked_subq))
    return qs.annotate(liked_by_me=Value(False, output_field=BooleanField()))


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = (
            Post.objects.select_related("author")
            .annotate(
                like_count=Count("likes", distinct=True),
                comment_count=Count("comments", distinct=True),
            )
            .order_by("-created_at")
        )
        return _annotate_liked_by_me_for_posts(qs, self.request.user)


class PostRetrieveView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Post.objects.select_related("author").annotate(
            like_count=Count("likes", distinct=True)
        )
        return _annotate_liked_by_me_for_posts(qs, self.request.user)

    def retrieve(self, request, *args, **kwargs):
        post: Post = self.get_object()

        # Efficient comment tree fetch:
        # - 1 query for ALL comments on this post
        # - select_related for author/parent
        # - annotate like_count and liked_by_me (no per-comment queries)
        comments_qs = (
            Comment.objects.filter(post=post)
            .select_related("author", "parent")
            .annotate(like_count=Count("likes", distinct=True))
            .order_by("created_at", "id")
        )
        comments_qs = _annotate_liked_by_me_for_comments(comments_qs, request.user)

        comments = list(comments_qs)
        root_comments, children_map = build_comment_tree(comments)

        serializer = PostDetailSerializer(
            post,
            context={
                "request": request,
                "root_comments": root_comments,
                "children_map": children_map,
            },
        )
        return Response(serializer.data)


class PostCommentCreateView(generics.CreateAPIView):
    serializer_class = CommentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        post = get_object_or_404(Post, pk=kwargs["post_id"])
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request, "post": post},
        )
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        # Minimal response; client can refetch post detail for updated tree.
        return Response(
            {
                "id": comment.id,
                "created_at": comment.created_at,
            },
            status=status.HTTP_201_CREATED,
        )


class PostLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id: int):
        post = get_object_or_404(Post, pk=post_id)
        created = like_post(user=request.user, post=post)
        like_count = PostLike.objects.filter(post=post).count()
        return Response(
            {"created": created, "already_liked": (not created), "like_count": like_count},
            status=status.HTTP_200_OK,
        )


class CommentLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, comment_id: int):
        comment = get_object_or_404(Comment, pk=comment_id)
        created = like_comment(user=request.user, comment=comment)
        like_count = CommentLike.objects.filter(comment=comment).count()
        return Response(
            {"created": created, "already_liked": (not created), "like_count": like_count},
            status=status.HTTP_200_OK,
        )


class LeaderboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        rows = leaderboard_last_24h(limit=5)
        data = [{"user_id": r["user_id"], "username": r["user__username"], "karma": r["karma"]} for r in rows]
        return Response(LeaderboardEntrySerializer(data, many=True).data)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        post_count = Post.objects.filter(author=user).count()
        karma_agg = KarmaActivity.objects.filter(user=user).aggregate(total=Sum("amount"))
        karma = karma_agg["total"] or 0
        return Response({
            "id": user.id,
            "username": user.get_username(),
            "post_count": post_count,
            "karma": karma,
        })


class LogoutView(APIView):
    """
    Token-auth logout for SPAs:
    - Deletes the current token so it can’t be reused.
    - Client should also clear local storage.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Delete only the current token (not all tokens for this user).
        if getattr(request, "auth", None):
            Token.objects.filter(key=request.auth.key).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

