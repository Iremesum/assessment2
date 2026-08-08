"use client";

import { useEffect, useState } from "react";

const APIURL = "http://100.56.100.252:4080";

interface Post {
  id: number;
  title: string;
  author: string;
  content: string;
  summary: string;
  imageUrl: string | null;
  link: string | null;
  status: "published" | "draft";
  createdAt: string;
}

export default function RSSClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${APIURL}/api/feed`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        setError("");
      } else {
        setError("Failed to load feed from server.");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Could not connect to the RSS Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>RSS Client</h1>
      <p>Feed pulled live from the RSS Server</p>

      <button onClick={fetchPosts} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>
        Refresh Feed
      </button>

      {loading && <p>Loading feed...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && posts.length === 0 && <p>No posts available yet.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}
          >
            <h2>{post.title}</h2>
            <p style={{ fontSize: "0.85rem", color: "#666" }}>
              By {post.author} · {new Date(post.createdAt).toLocaleDateString()} ·{" "}
              <strong>{post.status}</strong>
            </p>
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                style={{ width: "100%", maxWidth: "300px", borderRadius: "4px" }}
              />
            )}
            <p>{post.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}