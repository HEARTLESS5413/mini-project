'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { likePost, unlikePost, checkIfLiked, timeAgo } from '@/lib/api';
import CommentSheet from './CommentSheet';
import Link from 'next/link';

export default function PostCard({ post, currentUserId }) {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [saved, setSaved] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showHeart, setShowHeart] = useState(false);

    const profile = post.profiles || {};

    useEffect(() => {
        if (currentUserId) {
            checkIfLiked(currentUserId, post.id).then(setLiked);
        }
    }, [currentUserId, post.id]);

    const handleLike = async () => {
        if (!currentUserId) return;
        if (liked) {
            setLiked(false);
            setLikesCount(c => c - 1);
            await unlikePost(currentUserId, post.id);
        } else {
            setLiked(true);
            setLikesCount(c => c + 1);
            await likePost(currentUserId, post.id);
        }
    };

    const handleDoubleTap = async () => {
        if (!liked && currentUserId) {
            setLiked(true);
            setLikesCount(c => c + 1);
            await likePost(currentUserId, post.id);
        }
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
    };

    return (
        <>
            <article className="card-flat animate-fade-in" style={{ marginBottom: '8px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '10px' }}>
                    <Link href={`/profile/${profile.username || 'unknown'}`}>
                        <img src={profile.avatar_url || '/default-avatar.svg'} alt={profile.username} className="avatar avatar-md" />
                    </Link>
                    <div style={{ flex: 1 }}>
                        <Link href={`/profile/${profile.username || 'unknown'}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                            {profile.username || 'unknown'}
                        </Link>
                    </div>
                    <button className="btn-icon"><MoreHorizontal size={20} /></button>
                </div>

                {/* Image */}
                <div style={{ position: 'relative', cursor: 'pointer' }} onDoubleClick={handleDoubleTap}>
                    <img src={post.media_url} alt="Post" style={{ width: '100%', display: 'block' }} />
                    <div className={`like-animation ${showHeart ? 'active' : ''}`}>
                        <Heart size={80} fill="white" stroke="none" />
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '16px' }}>
                    <button onClick={handleLike} style={{ color: liked ? 'var(--accent-red)' : 'var(--text-primary)', transition: 'transform 0.2s' }}>
                        <Heart size={24} fill={liked ? 'var(--accent-red)' : 'none'} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => setShowComments(true)} style={{ color: 'var(--text-primary)' }}>
                        <MessageCircle size={24} strokeWidth={1.5} />
                    </button>
                    <button style={{ color: 'var(--text-primary)' }}><Send size={22} strokeWidth={1.5} /></button>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => setSaved(!saved)} style={{ color: 'var(--text-primary)' }}>
                        <Bookmark size={24} fill={saved ? 'var(--text-primary)' : 'none'} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Likes count */}
                <div style={{ padding: '0 16px 4px' }}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--font-size-base)' }}>{likesCount.toLocaleString()} likes</p>
                </div>

                {/* Caption */}
                {post.caption && (
                    <div style={{ padding: '0 16px 8px' }}>
                        <span style={{ fontWeight: 600, marginRight: '6px' }}>{profile.username}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{post.caption}</span>
                    </div>
                )}

                {/* View comments */}
                {post.comments_count > 0 && (
                    <button onClick={() => setShowComments(true)} style={{ padding: '0 16px 4px', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                        View all {post.comments_count} comments
                    </button>
                )}

                {/* Time */}
                <div style={{ padding: '4px 16px 12px' }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase' }}>
                        {timeAgo(post.created_at)}
                    </span>
                </div>
            </article>

            {showComments && (
                <CommentSheet postId={post.id} currentUserId={currentUserId} onClose={() => setShowComments(false)} />
            )}
        </>
    );
}
