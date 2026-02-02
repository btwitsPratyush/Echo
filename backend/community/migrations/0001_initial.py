from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.db.models import Q


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Post",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("content", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                (
                    "author",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="posts", to=settings.AUTH_USER_MODEL),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Comment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("content", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                (
                    "author",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comments", to=settings.AUTH_USER_MODEL),
                ),
                (
                    "parent",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="replies",
                        to="community.comment",
                    ),
                ),
                (
                    "post",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comments", to="community.post"),
                ),
            ],
            options={
                "ordering": ["created_at"],
            },
        ),
        migrations.CreateModel(
            name="PostLike",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "post",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="likes", to="community.post"),
                ),
                (
                    "user",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="post_likes", to=settings.AUTH_USER_MODEL),
                ),
            ],
            options={
                "constraints": [
                    models.UniqueConstraint(fields=("user", "post"), name="uniq_post_like_user_post"),
                ],
            },
        ),
        migrations.CreateModel(
            name="CommentLike",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "comment",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="likes", to="community.comment"),
                ),
                (
                    "user",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comment_likes", to=settings.AUTH_USER_MODEL),
                ),
            ],
            options={
                "constraints": [
                    models.UniqueConstraint(fields=("user", "comment"), name="uniq_comment_like_user_comment"),
                ],
            },
        ),
        migrations.CreateModel(
            name="KarmaActivity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("amount", models.SmallIntegerField(help_text="Positive karma delta.")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                (
                    "comment",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="karma_events",
                        to="community.comment",
                    ),
                ),
                (
                    "post",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="karma_events",
                        to="community.post",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="User who earned this karma (recipient).",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="karma_activities",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={},
        ),
        migrations.AddIndex(
            model_name="comment",
            index=models.Index(fields=["post", "parent"], name="community_c_post_id_4e4052_idx"),
        ),
        migrations.AddIndex(
            model_name="comment",
            index=models.Index(fields=["post", "created_at"], name="community_c_post_id_3fdc34_idx"),
        ),
        migrations.AddIndex(
            model_name="karmaactivity",
            index=models.Index(fields=["created_at"], name="community_k_created__8d2ab6_idx"),
        ),
        migrations.AddIndex(
            model_name="karmaactivity",
            index=models.Index(fields=["user", "created_at"], name="community_k_user_id_23b4e1_idx"),
        ),
        migrations.AddConstraint(
            model_name="karmaactivity",
            constraint=models.CheckConstraint(check=Q(("amount__gt", 0)), name="karma_activity_amount_positive"),
        ),
        migrations.AddConstraint(
            model_name="karmaactivity",
            constraint=models.CheckConstraint(
                check=(
                    (Q(("post__isnull", False)) & Q(("comment__isnull", True)))
                    | (Q(("post__isnull", True)) & Q(("comment__isnull", False)))
                ),
                name="karma_activity_exactly_one_target",
            ),
        ),
    ]

