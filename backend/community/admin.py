from django.contrib import admin

from .models import Comment, CommentLike, KarmaActivity, Post, PostLike


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "created_at")
    search_fields = ("content", "author__username")
    list_select_related = ("author",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "author", "parent", "created_at")
    search_fields = ("content", "author__username")
    list_select_related = ("post", "author", "parent")


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "created_at")
    list_select_related = ("user", "post")


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "comment", "created_at")
    list_select_related = ("user", "comment")


@admin.register(KarmaActivity)
class KarmaActivityAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "comment", "amount", "created_at")
    list_select_related = ("user", "post", "comment")

