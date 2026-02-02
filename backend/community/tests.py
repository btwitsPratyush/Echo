from __future__ import annotations

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from .models import KarmaActivity, Post
from .services import leaderboard_last_24h

User = get_user_model()


class LeaderboardLast24hTests(TestCase):
    def test_leaderboard_counts_only_last_24_hours(self):
        u1 = User.objects.create_user(username="u1", password="pw")
        u2 = User.objects.create_user(username="u2", password="pw")

        post = Post.objects.create(author=u1, content="hello")

        # Create two ledger entries for u1: one inside window, one outside.
        a_recent = KarmaActivity.objects.create(user=u1, post=post, amount=5)
        a_old = KarmaActivity.objects.create(user=u1, post=post, amount=5)

        # Create one inside-window entry for u2 with higher total.
        b_recent = KarmaActivity.objects.create(user=u2, post=post, amount=11)

        now = timezone.now()
        KarmaActivity.objects.filter(id=a_recent.id).update(created_at=now - timedelta(hours=1))
        KarmaActivity.objects.filter(id=a_old.id).update(created_at=now - timedelta(hours=30))
        KarmaActivity.objects.filter(id=b_recent.id).update(created_at=now - timedelta(hours=2))

        rows = leaderboard_last_24h(limit=5)

        # Should rank u2 first with 11, then u1 with only the recent 5.
        self.assertEqual(rows[0]["user_id"], u2.id)
        self.assertEqual(rows[0]["karma"], 11)
        self.assertEqual(rows[1]["user_id"], u1.id)
        self.assertEqual(rows[1]["karma"], 5)

