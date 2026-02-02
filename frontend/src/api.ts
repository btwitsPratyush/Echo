export type UserBrief = { id: number; username: string };

export type Post = {
  id: number;
  author: UserBrief;
  content: string;
  created_at: string;
  like_count: number;
  liked_by_me: boolean;
  comment_count: number;
};

export type CommentNode = {
  id: number;
  post: number;
  author: UserBrief;
  parent: number | null;
  content: string;
  created_at: string;
  like_count: number;
  liked_by_me: boolean;
  children: CommentNode[];
};

export type PostDetail = {
  id: number;
  author: UserBrief;
  content: string;
  created_at: string;
  like_count: number;
  liked_by_me: boolean;
  comments: CommentNode[];
};

export type LeaderboardEntry = { user_id: number; username: string; karma: number };

const API_BASE = "http://127.0.0.1:8000/api";

function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Token ${token}` } : {};
}

async function apiFetch<T>(path: string, opts: RequestInit = {}, token: string | null = null): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...authHeaders(token)
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

export const api = {
  login: (username: string, password: string) =>
    apiFetch<{ token: string }>("/auth/token/", { method: "POST", body: JSON.stringify({ username, password }) }),
  signup: (username: string, password: string) =>
    apiFetch<{ token: string }>(
      "/auth/signup/",
      { method: "POST", body: JSON.stringify({ username, password }) }
    ),
  me: (token: string) => apiFetch<UserBrief>("/me/", {}, token),
  logout: (token: string) => apiFetch<void>("/auth/logout/", { method: "POST" }, token),
  listPosts: (token: string | null) => apiFetch<Post[]>("/posts/", {}, token),
  createPost: (content: string, token: string) =>
    apiFetch<Post>("/posts/", { method: "POST", body: JSON.stringify({ content }) }, token),
  getPost: (id: number, token: string | null) => apiFetch<PostDetail>(`/posts/${id}/`, {}, token),
  createComment: (postId: number, content: string, parentId: number | null, token: string) =>
    apiFetch<{ id: number; created_at: string }>(
      `/posts/${postId}/comments/`,
      { method: "POST", body: JSON.stringify({ content, parent_id: parentId }) },
      token
    ),
  likePost: (postId: number, token: string) =>
    apiFetch<{ created: boolean; already_liked: boolean; like_count: number }>(
      `/posts/${postId}/like/`,
      { method: "POST" },
      token
    ),
  likeComment: (commentId: number, token: string) =>
    apiFetch<{ created: boolean; already_liked: boolean; like_count: number }>(
      `/comments/${commentId}/like/`,
      { method: "POST" },
      token
    ),
  leaderboard: () => apiFetch<LeaderboardEntry[]>("/leaderboard/")
};

