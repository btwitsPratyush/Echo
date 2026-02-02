from __future__ import annotations

from datetime import timedelta

from django.db import IntegrityError, transaction
from django.db.models import Sum
from django.utils import timezone

from .models import Comment, CommentLike, KarmaActivity, Post, PostLike


POST_LIKE_KARMA = 5
COMMENT_LIKE_KARMA = 1


def like_post(*, user, post: Post) -> bool:
    """
    Concurrency-safe "like post" operation.

    Returns:
      True if a new like was created (and karma ledger written),
      False if the user already liked it.

    Why this is race-safe:
    - DB UNIQUE constraint prevents duplicates
    - transaction.atomic ensures the like + ledger write happen together
    - IntegrityError is handled as "already liked"
    """
    with transaction.atomic():
        try:
            _, created = PostLike.objects.get_or_create(user=user, post=post)
        except IntegrityError:
            # A concurrent request inserted the like first.
            created = False

        if not created:
            return False

        KarmaActivity.objects.create(
            user=post.author,
            post=post,
            amount=POST_LIKE_KARMA,
        )
        return True


def like_comment(*, user, comment: Comment) -> bool:
    """
    Concurrency-safe "like comment" operation. See like_post() for reasoning.
    """
    with transaction.atomic():
        try:
            _, created = CommentLike.objects.get_or_create(user=user, comment=comment)
        except IntegrityError:
            created = False

        if not created:
            return False

        KarmaActivity.objects.create(
            user=comment.author,
            comment=comment,
            amount=COMMENT_LIKE_KARMA,
        )
        return True


def leaderboard_last_24h(*, limit: int = 5) -> list[dict]:
    """
    Return top users by karma earned in the last 24 hours.

    This is intentionally derived from the ledger (KarmaActivity) each time to
    guarantee correctness and avoid stale "daily karma" counters.
    """
    since = timezone.now() - timedelta(hours=24)
    return list(
        KarmaActivity.objects.filter(created_at__gte=since)
        .values("user_id", "user__username")
        .annotate(karma=Sum("amount"))
        .order_by("-karma", "user_id")[:limit]
    )

