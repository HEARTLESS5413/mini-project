'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllPosts } from '@/lib/api';
import StoryBar from '@/components/stories/StoryBar';
import PostCard from '@/components/feed/PostCard';
import { Camera } from 'lucide-react';

export default function FeedPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            const { data } = await getAllPosts();
            setPosts(data);
            setLoading(false);
        };
        loadPosts();
    }, [user]);

    return (
        <div className="feed-container">
            <StoryBar />

            {loading ? (
                <div style={{ padding: '40px 0' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ padding: '16px' }}>
                            <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '12px' }} />
                            <div className="skeleton" style={{ height: '400px', width: '100%', marginBottom: '12px' }} />
                            <div className="skeleton" style={{ height: '20px', width: '60%' }} />
                        </div>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="empty-state" style={{ paddingTop: '80px' }}>
                    <div className="empty-state-icon">
                        <Camera size={32} />
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 300 }}>No Posts Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '280px' }}>
                        Follow people or create your first post to see content here.
                    </p>
                </div>
            ) : (
                <div>
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} currentUserId={user?.id} />
                    ))}
                </div>
            )}
        </div>
    );
}
