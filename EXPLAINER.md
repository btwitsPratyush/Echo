## Echo — Explainer

### The Tree (nested comments)

- **Model choice**: We use an **adjacency list** model: `Comment(parent=ForeignKey("self"))`.
  - **Why**: simplest + safest schema, unlimited depth, easy writes (insert is a single row).
  - **Tradeoff**: reading a full tree requires building it in memory (fine for a post-sized thread).
  - Alternatives like MPTT / closure tables can speed some reads but add complexity and write costs.

#### How we serialize the tree without killing the DB

In `PostRetrieveView.retrieve()` we fetch **all comments for the post in one query**, then build a nested structure in Python:

- **Single query**:
  - filters by `post`
  - `select_related("author", "parent")` to avoid per-comment lookups
  - `annotate(like_count=Count("likes"))` for like totals without per-comment queries
  - `annotate(liked_by_me=Exists(...))` to avoid per-comment “did I like it?” checks
- **No recursive DB calls**: `build_comment_tree()` groups children by `parent_id` in memory and the serializer reads from that map.

This avoids the N+1 problem because the “walk” of the tree happens in Python over already-fetched rows.

### The Math (last 24h leaderboard)

We store karma in an **append-only ledger**: `KarmaActivity(user, amount, created_at, target)`.
We do **not** store daily karma on `User`.

**Exact QuerySet used** (also present in code in `community/services.py`):

```python
KarmaActivity.objects.filter(created_at__gte=since)\
    .values("user_id", "user__username")\
    .annotate(karma=Sum("amount"))\
    .order_by("-karma", "user_id")[:5]
```

- **Time filter**: `created_at__gte=timezone.now() - timedelta(hours=24)`
- **Aggregation**: `GROUP BY user_id, user__username` with `SUM(amount)`
- **Ordering**: highest karma first; `user_id` as a stable tie-breaker

### The AI Audit (one concrete fix)

While building quickly, an AI-generated step mistakenly introduced an invalid dependency:
- **Bug**: Added `djangorestframework-authtoken` to `backend/requirements.txt` even though token auth is provided by DRF itself (`rest_framework.authtoken`).
- **Fix**: Removed the dependency and kept `rest_framework.authtoken` in `INSTALLED_APPS`.

Another quick correctness fix:
- **Bug**: The like endpoints originally returned a redundant `"liked": true` field (even when the request didn’t create a new like).
- **Fix**: Updated responses to `{ created, already_liked, like_count }` to make idempotency explicit.

