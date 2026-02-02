from __future__ import annotations

from collections import defaultdict
from typing import Any, DefaultDict, Iterable

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Comment, KarmaActivity, Post

User = get_user_model()


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class PostSerializer(serializers.ModelSerializer):
    author = UserBriefSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    liked_by_me = serializers.BooleanField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Post
        fields = ["id", "author", "content", "created_at", "like_count", "liked_by_me", "comment_count"]

    def create(self, validated_data: dict[str, Any]) -> Post:
        request = self.context["request"]
        return Post.objects.create(author=request.user, **validated_data)


class CommentTreeSerializer(serializers.ModelSerializer):
    author = UserBriefSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    liked_by_me = serializers.BooleanField(read_only=True)
    children = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "author",
            "parent",
            "content",
            "created_at",
            "like_count",
            "liked_by_me",
            "children",
        ]

    def get_children(self, obj: Comment) -> list[dict[str, Any]]:
        children_map: dict[int, list[Comment]] = self.context.get("children_map", {})
        children = children_map.get(obj.id, [])
        return CommentTreeSerializer(children, many=True, context=self.context).data


def build_comment_tree(comments: Iterable[Comment]) -> tuple[list[Comment], dict[int, list[Comment]]]:
    """
    Turn a flat list of comments into:
    - root comments (parent is null)
    - children_map: parent_id -> [child comments]

    Key property for performance:
    - This uses only in-memory operations; it must be paired with a single optimized
      queryset that fetched ALL comments for the post (no recursive DB queries).
    """
    children_map: DefaultDict[int, list[Comment]] = defaultdict(list)
    roots: list[Comment] = []
    for c in comments:
        if c.parent_id:
            children_map[c.parent_id].append(c)
        else:
            roots.append(c)
    return roots, dict(children_map)


class PostDetailSerializer(serializers.ModelSerializer):
    author = UserBriefSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    liked_by_me = serializers.BooleanField(read_only=True)
    comments = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "author", "content", "created_at", "like_count", "liked_by_me", "comments"]

    def get_comments(self, obj: Post) -> list[dict[str, Any]]:
        root_comments: list[Comment] = self.context.get("root_comments", [])
        children_map: dict[int, list[Comment]] = self.context.get("children_map", {})
        return CommentTreeSerializer(
            root_comments,
            many=True,
            context={**self.context, "children_map": children_map},
        ).data


class CommentCreateSerializer(serializers.ModelSerializer):
    parent_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = Comment
        fields = ["id", "content", "parent_id", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        parent_id = attrs.get("parent_id")
        post: Post = self.context["post"]
        if parent_id is None:
            return attrs

        try:
            parent = Comment.objects.only("id", "post_id").get(id=parent_id)
        except Comment.DoesNotExist:
            raise serializers.ValidationError({"parent_id": "Parent comment does not exist."})

        if parent.post_id != post.id:
            raise serializers.ValidationError({"parent_id": "Parent comment must belong to the same post."})

        attrs["parent"] = parent
        return attrs

    def create(self, validated_data: dict[str, Any]) -> Comment:
        request = self.context["request"]
        post: Post = self.context["post"]
        validated_data.pop("parent_id", None)
        return Comment.objects.create(
            post=post,
            author=request.user,
            **validated_data,
        )


class LeaderboardEntrySerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    karma = serializers.IntegerField()


class KarmaActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = KarmaActivity
        fields = ["id", "user", "post", "comment", "amount", "created_at"]

