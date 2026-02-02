from django.urls import path

from .views import (
    CommentLikeView,
    LeaderboardView,
    SignupView,
    LogoutView,
    MeView,
    PostCommentCreateView,
    PostLikeView,
    PostListCreateView,
    PostRetrieveView,
)


urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("auth/signup/", SignupView.as_view(), name="auth-signup"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("posts/", PostListCreateView.as_view(), name="post-list-create"),
    path("posts/<int:pk>/", PostRetrieveView.as_view(), name="post-detail"),
    path("posts/<int:post_id>/comments/", PostCommentCreateView.as_view(), name="post-comment-create"),
    path("posts/<int:post_id>/like/", PostLikeView.as_view(), name="post-like"),
    path("comments/<int:comment_id>/like/", CommentLikeView.as_view(), name="comment-like"),
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
]

