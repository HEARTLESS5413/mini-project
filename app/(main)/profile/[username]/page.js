'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileByUsername, getUserPosts, getFollowCounts, followUser, unfollowUser, checkIfFollowing } from '@/lib/api';
import { Settings, Grid, Film, Bookmark, MoreHorizontal, ChevronLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user, profile: myProfile } = useAuth();

    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [counts, setCounts] = useState({ posts: 0, followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [tab, setTab] = useState('posts');
    const [loading, setLoading] = useState(true);

    const isOwn = params.username === 'me' || params.username === myProfile?.username;

    useEffect(() => {
        const load = async () => {
            let prof;
            if (isOwn && myProfile) {
                prof = myProfile;
            } else {
                const { data } = await getProfileByUsername(params.username);
                prof = data;
            }
            if (!prof) { setLoading(false); return; }
            setProfileData(prof);

            const [postsRes, countsRes] = await Promise.all([
                getUserPosts(prof.id),
                getFollowCounts(prof.id),
            ]);
            setPosts(postsRes.data);
            setCounts(countsRes);

            if (user && !isOwn) {
                const following = await checkIfFollowing(user.id, prof.id);
                setIsFollowing(following);
            }
            setLoading(false);
        };
        load();
    }, [params.username, user, myProfile, isOwn]);

    const handleFollow = async () => {
        if (!user || !profileData) return;
        if (isFollowing) {
            await unfollowUser(user.id, profileData.id);
            setIsFollowing(false);
            setCounts(c => ({ ...c, followers: c.followers - 1 }));
        } else {
            await followUser(user.id, profileData.id);
            setIsFollowing(true);
            setCounts(c => ({ ...c, followers: c.followers + 1 }));
        }
    };

    if (loading) {
        return (
            <div className="profile-page" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
                    <div className="skeleton" style={{ width: '77px', height: '77px', borderRadius: '50%' }} />
                    <div>
                        <div className="skeleton" style={{ width: '150px', height: '20px', marginBottom: '12px' }} />
                        <div className="skeleton" style={{ width: '200px', height: '16px' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="profile-page empty-state" style={{ paddingTop: '80px' }}>
                <h3>User not found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>This user doesn&apos;t exist.</p>
                <button className="btn btn-primary" onClick={() => router.push('/feed')}>Go to Feed</button>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Header */}
            {!isOwn && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '12px' }}>
                    <button onClick={() => router.back()}><ChevronLeft size={28} /></button>
                    <h2 style={{ flex: 1, fontWeight: 600, fontSize: 'var(--font-size-md)' }}>{profileData.username}</h2>
                </div>
            )}

            {/* Profile info */}
            <div className="profile-header" style={{ display: 'flex', gap: '24px', padding: '16px 20px', alignItems: 'center' }}>
                <img src={profileData.avatar_url || '/default-avatar.svg'} alt={profileData.username} className="avatar avatar-xl" />
                <div className="profile-info" style={{ flex: 1 }}>
                    <div className="profile-username-row">
                        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 400 }}>{profileData.username}</h2>
                        {isOwn && (
                            <>
                                <Link href="/settings" className="btn btn-secondary btn-sm">Edit profile</Link>
                                <Link href="/settings"><Settings size={22} /></Link>
                            </>
                        )}
                    </div>
                    <div className="profile-stats">
                        <div className="profile-stat"><strong>{counts.posts}</strong><span>posts</span></div>
                        <div className="profile-stat"><strong>{counts.followers.toLocaleString()}</strong><span>followers</span></div>
                        <div className="profile-stat"><strong>{counts.following.toLocaleString()}</strong><span>following</span></div>
                    </div>
                </div>
            </div>

            {/* Bio */}
            <div className="profile-bio" style={{ padding: '0 20px 16px' }}>
                <p className="full-name">{profileData.full_name}</p>
                {profileData.bio && <p className="bio-text">{profileData.bio}</p>}
                {profileData.website && <a href={profileData.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-link)', fontSize: 'var(--font-size-base)' }}>{profileData.website}</a>}
            </div>

            {/* Action Buttons */}
            {!isOwn && (
                <div style={{ display: 'flex', gap: '8px', padding: '0 20px 16px' }}>
                    <button className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} btn-block`} onClick={handleFollow}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <Link href={`/messages`} className="btn btn-secondary btn-block" style={{ textAlign: 'center', textDecoration: 'none' }}>Message</Link>
                    <button className="btn btn-secondary"><UserPlus size={18} /></button>
                </div>
            )}

            {isOwn && (
                <div style={{ display: 'flex', gap: '8px', padding: '0 20px 16px' }}>
                    <Link href="/settings" className="btn btn-secondary btn-block" style={{ textAlign: 'center', textDecoration: 'none' }}>Edit profile</Link>
                    <button className="btn btn-secondary btn-block">Share profile</button>
                </div>
            )}

            {/* Tabs */}
            <div className="profile-tabs">
                <button className={`profile-tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
                    <Grid size={18} />
                </button>
                <button className={`profile-tab ${tab === 'reels' ? 'active' : ''}`} onClick={() => setTab('reels')}>
                    <Film size={18} />
                </button>
                <button className={`profile-tab ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>
                    <Bookmark size={18} />
                </button>
            </div>

            {/* Grid */}
            <div className="profile-grid">
                {posts.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center' }}>
                        <div className="empty-state">
                            <div className="empty-state-icon"><Grid size={32} /></div>
                            <h3 style={{ fontWeight: 300, fontSize: 'var(--font-size-xl)' }}>
                                {isOwn ? 'Share Photos' : 'No Posts Yet'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {isOwn ? 'When you share photos, they will appear on your profile.' : 'This user hasn\'t posted anything yet.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="profile-grid-item">
                            <img src={post.media_url} alt="" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
