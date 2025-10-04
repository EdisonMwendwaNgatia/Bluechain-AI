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

// Firebase-backed community page. Persists posts, likes, messages, and follows
// under the RTDB paths: community/posts and community/follows.
export default function Community() {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [newPostPhone, setNewPostPhone] = useState("");
  const [followersList, setFollowersList] = useState([]); // list of follower uids
  const [following, setFollowing] = useState([]);
  const [followerProfiles, setFollowerProfiles] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [userProfiles, setUserProfiles] = useState({}); // uid -> { id, name }

  useEffect(() => {
    // subscribe to posts
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

  // keep a cache of user profiles (names) used by authors and message senders
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

    // fetch missing profiles
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
        // ignore fetch errors
        console.warn("Failed to fetch user profiles", err);
      }
    })();
  }, [posts, userProfiles]);

  useEffect(() => {
    // subscribe to current user's following list
    if (!user?.uid) return;
    const fRef = ref(db, `community/follows/${user.uid}/following`);
    const unsub = onValue(fRef, (snap) => {
      const val = snap.val() || {};
      setFollowing(Object.keys(val));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    // subscribe to current user's followers list so their followers count updates
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
        // already liked — do nothing (enforce one-like rule)
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
    // push message
    await push(msgsRef, {
      from: user.uid,
      text: text.trim(),
      ts: Date.now(),
    });

    // enforce max 5 messages: read ordered by ts and remove oldest if >5
    const msgsSnapshot = await get(query(msgsRef, orderByChild("ts")));
    const msgsVal = msgsSnapshot.val() || {};
    const entries = Object.entries(msgsVal);
    if (entries.length > 5) {
      // remove oldest entries until length is 5
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
    if (authorId === user.uid) return; // prevent self-follow
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
    <div className="community-page">
      <header className="community-header">
        <h2>Community</h2>
        <div className="community-stats">
          <div className="stat">
            <strong>{following.length}</strong>
            <span>Connected</span>
          </div>
          <div className="stat">
            <strong>{followersList.length}</strong>
            <button className="followers-count-btn" onClick={async () => {
              // fetch profiles for modal
              if (followersList.length === 0) {
                setFollowerProfiles([]);
                setShowFollowersModal(true);
                return;
              }
              const profiles = await Promise.all(followersList.map(async (id) => {
                try {
                  const snap = await get(ref(db, `users/${id}`));
                  const v = snap.val() || {};
                  return { id, name: v.fullName || v.email || id };
                } catch {
                  return { id, name: id };
                }
              }));
              setFollowerProfiles(profiles);
              setShowFollowersModal(true);
            }}>Followers</button>
          </div>
        </div>
      </header>

      <section className="composer">
        <h3>Post something to the community</h3>
        <textarea value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder="Share an update, ask for help, or offer something" />
        <input value={newPostPhone} onChange={(e) => setNewPostPhone(e.target.value)} placeholder="Optional phone number for WhatsApp contact" />
        <div>
          <button onClick={postNew}>Post</button>
        </div>
      </section>

      <section className="posts">
        {posts.map((p) => (
          <article key={p.id} className="post-card">
            <div className="post-header">
              <div className="author">{p.authorName}</div>
              <div className="post-actions">
                {p.authorId === user?.uid ? (
                  <>
                    <span className="you-label">You</span>
                    <button className="delete-post-btn" onClick={() => deletePost(p.id)}>Delete</button>
                  </>
                ) : (
                  following.includes(p.authorId) ? (
                    <button onClick={() => unfollowUser(p.authorId)}>Unfollow</button>
                  ) : (
                    <button onClick={() => followUser(p.authorId)}>Follow</button>
                  )
                )}
                <button onClick={() => likePost(p.id)}>Like ({p.likes || 0})</button>
                <button onClick={() => setOpenComments((s) => ({ ...s, [p.id]: !s[p.id] }))}>
                  Comment
                </button>
                {p.phone ? (
                  <a className="whatsapp-btn" target="_blank" rel="noreferrer" href={`https://wa.me/${p.phone.replace(/[^0-9+]/g, "")}?text=${encodeURIComponent("Hi " + p.authorName)}`}>
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
            <div className="post-body">{p.text}</div>

            <div className="post-messages">
              <h5>Messages</h5>
              {(p.messages || []).map((m, idx) => (
                <div key={idx} className="message">
                  <strong>{userProfiles[m.from]?.name || m.from}</strong>: <span>{m.text}</span>
                </div>
              ))}

              {openComments[p.id] ? (
                <MessageComposer onSend={(text) => sendMessage(p.id, text)} disabled={!user} />
              ) : null}
            </div>
          </article>
        ))}
      </section>

      {showFollowersModal ? (
        <div className="followers-modal" role="dialog">
          <div className="modal-content">
            <h4>Followers</h4>
            <button className="modal-close" onClick={() => setShowFollowersModal(false)}>Close</button>
            <ul>
              {followerProfiles.length === 0 ? (
                <li>No followers yet</li>
              ) : (
                followerProfiles.map((f) => (
                  <li key={f.id} className="follower-item">
                    <span className="follower-name">{f.name}</span>
                    {f.id === user?.uid ? (
                      <em className="you-label">(You)</em>
                    ) : (
                      <span className="follower-action">
                        {following.includes(f.id) ? (
                          <button onClick={() => unfollowUser(f.id)}>Following</button>
                        ) : (
                          <button onClick={() => followUser(f.id)}>Follow back</button>
                        )}
                      </span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MessageComposer({ onSend, disabled }) {
  const [text, setText] = useState("");
  return (
    <div className="message-composer">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message (max 5 per post)" />
      <button onClick={() => { onSend(text); setText(""); }} disabled={disabled}>Send</button>
    </div>
  );
}
