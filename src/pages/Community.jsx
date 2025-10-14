import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebase";
import {
  ref,
  push,
  onValue,
  set,
  runTransaction,
  get,
  query,
  orderByChild,
  remove,
} from "firebase/database";

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [newPostPhone, setNewPostPhone] = useState("");
  const [followersList, setFollowersList] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followerProfiles, setFollowerProfiles] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [userProfiles, setUserProfiles] = useState({});
  const [currentBgImage, setCurrentBgImage] = useState(0);

  // Background images for community connection theme
  const communityImages = [
    "/assets/images/community1.jpg",
    "/assets/images/community2.jpg",
    "/assets/images/community3.jpg",
    "/assets/images/community4.jpg"
  ];

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgImage((prev) => (prev + 1) % communityImages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [communityImages.length]);

  useEffect(() => {
    const postsRef = ref(db, "community/posts");
    const unsub = onValue(postsRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.entries(val)
        .map(([key, v]) => ({
          id: key,
          authorId: v.authorId,
          authorName: v.authorName,
          phone: v.phone || "",
          text: v.text,
          likes: v.likes || 0,
          likesBy: v.likesBy || {},
          messages: v.messages ? Object.values(v.messages) : [],
        }))
        .sort((a, b) => (b.id > a.id ? -1 : 1));
      setPosts(list);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const ids = new Set();
    posts.forEach((p) => {
      if (p.authorId) ids.add(p.authorId);
      (p.messages || []).forEach((m) => {
        if (m.from) ids.add(m.from);
      });
    });

    const missing = Array.from(ids).filter((id) => id && !userProfiles[id]);
    if (missing.length === 0) return;

    (async () => {
      try {
        const fetched = {};
        await Promise.all(
          missing.map(async (id) => {
            try {
              const snap = await get(ref(db, `users/${id}`));
              const v = snap.val() || {};
              fetched[id] = { id, name: v.fullName || v.displayName || v.email || id };
            } catch {
              fetched[id] = { id, name: id };
            }
          })
        );
        setUserProfiles((prev) => ({ ...prev, ...fetched }));
      } catch (err) {
        console.warn("Failed to fetch user profiles", err);
      }
    })();
  }, [posts, userProfiles]);

  useEffect(() => {
    if (!user?.uid) return;
    const fRef = ref(db, `community/follows/${user.uid}/following`);
    const unsub = onValue(fRef, (snap) => {
      const val = snap.val() || {};
      setFollowing(Object.keys(val));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;
    const fRef = ref(db, `community/follows/${user.uid}/followers`);
    const unsub = onValue(fRef, (snap) => {
      const val = snap.val() || {};
      const ids = Object.keys(val);
      setFollowersList(ids);
    });
    return () => unsub();
  }, [user]);

  const postNew = async () => {
    if (!newPostText.trim() || !user) return;
    const postsRef = ref(db, "community/posts");
    const p = {
      authorId: user.uid,
      authorName: user.fullName || user.email || "User",
      phone: newPostPhone || "",
      text: newPostText.trim(),
      likes: 0,
      createdAt: Date.now(),
    };
    await push(postsRef, p);
    setNewPostText("");
    setNewPostPhone("");
  };

  const likePost = async (postId) => {
    if (!user) return;
    const postRef = ref(db, `community/posts/${postId}`);
    await runTransaction(postRef, (current) => {
      if (current === null) return current;
      current.likes = current.likes || 0;
      current.likesBy = current.likesBy || {};
      if (current.likesBy[user.uid]) {
        return current;
      }
      current.likes = current.likes + 1;
      current.likesBy[user.uid] = true;
      return current;
    });
  };

  const sendMessage = async (postId, text) => {
    if (!user || !text.trim()) return;
    const msgsRef = ref(db, `community/posts/${postId}/messages`);
    await push(msgsRef, {
      from: user.uid,
      text: text.trim(),
      ts: Date.now(),
    });

    const msgsSnapshot = await get(query(msgsRef, orderByChild("ts")));
    const msgsVal = msgsSnapshot.val() || {};
    const entries = Object.entries(msgsVal);
    if (entries.length > 5) {
      const sorted = entries.sort((a, b) => a[1].ts - b[1].ts);
      const removeCount = entries.length - 5;
      for (let i = 0; i < removeCount; i++) {
        const keyToRemove = sorted[i][0];
        await remove(ref(db, `community/posts/${postId}/messages/${keyToRemove}`));
      }
    }
  };

  const followUser = async (authorId) => {
    if (!user) return;
    if (authorId === user.uid) return;
    await set(ref(db, `community/follows/${user.uid}/following/${authorId}`), true);
    await set(ref(db, `community/follows/${authorId}/followers/${user.uid}`), true);
  };

  const unfollowUser = async (authorId) => {
    if (!user) return;
    await set(ref(db, `community/follows/${user.uid}/following/${authorId}`), null);
    await set(ref(db, `community/follows/${authorId}/followers/${user.uid}`), null);
  };

  const deletePost = async (postId) => {
    if (!user) return;
    const ok = window.confirm("Delete this post? This action cannot be undone.");
    if (!ok) return;
    try {
      await remove(ref(db, `community/posts/${postId}`));
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Failed to delete post. See console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background with Community Images */}
      <div className="fixed inset-0 z-0">
        {communityImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              currentBgImage === idx ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img}
              alt={`Community ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/80 to-cyan-900/85"></div>
          </div>
        ))}
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/5 border border-cyan-400/10"
            style={{
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              bottom: "-100px",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <span className="text-3xl">👥</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Coastal Community
                  </h1>
                  <p className="text-gray-400 text-sm">Connect, Share, and Grow Together</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-blue-500/30">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {following.length}
                  </div>
                  <div className="text-gray-400 text-sm">Connected</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-cyan-500/30">
                  <button
                    onClick={async () => {
                      if (followersList.length === 0) {
                        setFollowerProfiles([]);
                        setShowFollowersModal(true);
                        return;
                      }
                      const profiles = await Promise.all(
                        followersList.map(async (id) => {
                          try {
                            const snap = await get(ref(db, `users/${id}`));
                            const v = snap.val() || {};
                            return { id, name: v.fullName || v.email || id };
                          } catch {
                            return { id, name: id };
                          }
                        })
                      );
                      setFollowerProfiles(profiles);
                      setShowFollowersModal(true);
                    }}
                    className="text-left hover:scale-105 transition-transform duration-300"
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      {followersList.length}
                    </div>
                    <div className="text-gray-400 text-sm">Followers</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Post Composer */}
        <section className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">✍️</span>
              <h2 className="text-2xl font-bold text-white">Share with Community</h2>
            </div>

            <div className="space-y-4">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share an update, ask for help, or offer something to the community..."
                className="w-full bg-gray-900/50 border border-gray-600 text-white px-6 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500 min-h-[120px] resize-none"
              />

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">📱</span>
                </div>
                <input
                  type="tel"
                  value={newPostPhone}
                  onChange={(e) => setNewPostPhone(e.target.value)}
                  placeholder="Optional: WhatsApp number for direct contact"
                  className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                />
              </div>

              <button
                onClick={postNew}
                disabled={!newPostText.trim()}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center group"
              >
                <span>Share Post</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </div>
          </div>
        </section>

        {/* Posts Feed */}
        <section className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-12 text-center">
              <div className="text-6xl mb-4">🌊</div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No posts yet</h3>
              <p className="text-gray-500">Be the first to share something with the community!</p>
            </div>
          ) : (
            posts.map((p) => (
              <article
                key={p.id}
                className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden hover:border-cyan-500/50 transition-all duration-300"
              >
                {/* Post Header */}
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-gray-700 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {p.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{p.authorName}</h3>
                        {p.authorId === user?.uid && (
                          <span className="inline-flex items-center px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.authorId === user?.uid ? (
                        <button
                          onClick={() => deletePost(p.id)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            following.includes(p.authorId)
                              ? unfollowUser(p.authorId)
                              : followUser(p.authorId)
                          }
                          className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                            following.includes(p.authorId)
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                              : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30"
                          }`}
                        >
                          {following.includes(p.authorId) ? "Following" : "Follow"}
                        </button>
                      )}

                      <button
                        onClick={() => likePost(p.id)}
                        className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg border border-pink-500/30 transition-colors text-sm font-medium flex items-center space-x-2"
                      >
                        <span>❤️</span>
                        <span>{p.likes || 0}</span>
                      </button>

                      {p.phone && (
                        <a
                          href={`https://wa.me/${p.phone.replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(
                            "Hi " + p.authorName
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg border border-green-500/30 transition-colors text-sm font-medium flex items-center space-x-2"
                        >
                          <span>💬</span>
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Body */}
                <div className="p-6">
                  <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                    {p.text}
                  </p>
                </div>

                {/* Comments Section */}
                <div className="bg-gray-900/30 border-t border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      Comments ({p.messages?.length || 0}/5)
                    </h4>
                    <button
                      onClick={() =>
                        setOpenComments((s) => ({ ...s, [p.id]: !s[p.id] }))
                      }
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg border border-blue-500/30 transition-colors text-sm font-medium"
                    >
                      {openComments[p.id] ? "Hide" : "Add Comment"}
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3 mb-4">
                    {(p.messages || []).map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {(userProfiles[m.from]?.name || m.from).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-cyan-400 text-sm mb-1">
                              {userProfiles[m.from]?.name || m.from}
                            </div>
                            <p className="text-gray-300 text-sm">{m.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input */}
                  {openComments[p.id] && (
                    <MessageComposer
                      onSend={(text) => sendMessage(p.id, text)}
                      disabled={!user}
                    />
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-gray-700 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Your Followers</h3>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {followerProfiles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">👥</div>
                  <p className="text-gray-400">No followers yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Share great content to attract followers!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followerProfiles.map((f) => (
                    <div
                      key={f.id}
                      className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {f.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{f.name}</div>
                          {f.id === user?.uid && (
                            <span className="text-cyan-400 text-xs">(You)</span>
                          )}
                        </div>
                      </div>

                      {f.id !== user?.uid && (
                        <button
                          onClick={() =>
                            following.includes(f.id)
                              ? unfollowUser(f.id)
                              : followUser(f.id)
                          }
                          className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                            following.includes(f.id)
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                              : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30"
                          }`}
                        >
                          {following.includes(f.id) ? "Following" : "Follow Back"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function MessageComposer({ onSend, disabled }) {
  const [text, setText] = useState("");
  return (
    <div className="flex gap-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment (max 5 per post)..."
        disabled={disabled}
        className="flex-1 bg-gray-900/50 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
      />
      <button
        onClick={() => {
          if (text.trim()) {
            onSend(text);
            setText("");
          }
        }}
        disabled={disabled || !text.trim()}
        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  );
}