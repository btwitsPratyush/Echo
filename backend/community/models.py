from __future__ import annotations

from django.conf import settings
from django.db import models
from django.db.models import Q


class Post(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover
        return f"Post({self.id}) by {self.author_id}"


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments"
    )
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="replies",
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["post", "parent"]),
            models.Index(fields=["post", "created_at"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Comment({self.id}) on Post({self.post_id})"


class PostLike(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="post_likes"
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "post"], name="uniq_post_like_user_post"
            )
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"PostLike(user={self.user_id}, post={self.post_id})"


class CommentLike(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comment_likes"
    )
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "comment"], name="uniq_comment_like_user_comment"
            )
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"CommentLike(user={self.user_id}, comment={self.comment_id})"


class KarmaActivity(models.Model):
    """
    Append-only ledger of karma earned.

    IMPORTANT: We intentionally do not store "total karma" on User.
    Totals (and leaderboards) are derived via aggregation queries over this table.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="karma_activities",
        help_text="User who earned this karma (recipient).",
    )
    # Exactly one target must be set (post OR comment). Enforced via CheckConstraint.
    post = models.ForeignKey(
        Post, null=True, blank=True, on_delete=models.CASCADE, related_name="karma_events"
    )
    comment = models.ForeignKey(
        Comment,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="karma_events",
    )
    amount = models.SmallIntegerField(help_text="Positive karma delta.")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["user", "created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(amount__gt=0),
                name="karma_activity_amount_positive",
            ),
            models.CheckConstraint(
                check=(
                    (Q(post__isnull=False) & Q(comment__isnull=True))
                    | (Q(post__isnull=True) & Q(comment__isnull=False))
                ),
                name="karma_activity_exactly_one_target",
            ),
        ]

    def __str__(self) -> str:  # pragma: no cover
        target = f"post={self.post_id}" if self.post_id else f"comment={self.comment_id}"
        return f"KarmaActivity(user={self.user_id}, {target}, amount={self.amount})"

