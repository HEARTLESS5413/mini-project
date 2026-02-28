'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveStories } from '@/lib/api';
import StoryViewer from './StoryViewer';

export default function StoryBar() {
    const { profile } = useAuth();
    const [stories, setStories] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [activeUserIndex, setActiveUserIndex] = useState(0);

    useEffect(() => {
        const load = async () => {
            const { data } = await getActiveStories();
            // Group stories by user
            const grouped = {};
            (data || []).forEach(s => {
                if (!grouped[s.user_id]) {
                    grouped[s.user_id] = {
                        user: s.profiles,
                        stories: [],
                    };
                }
                grouped[s.user_id].stories.push(s);
            });
            setStories(Object.values(grouped));
        };
        load();
    }, []);

    const openViewer = (index) => {
        setActiveUserIndex(index);
        setViewerOpen(true);
    };

    return (
        <>
            <div className="story-bar" style={{ display: 'flex', gap: '16px', padding: '16px', overflowX: 'auto' }}>
                {/* Your story */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            src={profile?.avatar_url || '/default-avatar.svg'}
                            alt="Your story"
                            className="avatar avatar-xl"
                        />
                        <div style={{
                            position: 'absolute', bottom: -2, right: -2,
                            width: '22px', height: '22px', borderRadius: '50%',
                            background: 'var(--accent-blue)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            border: '2px solid var(--bg-primary)',
                        }}>
                            <Plus size={14} color="white" strokeWidth={3} />
                        </div>
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', maxWidth: '66px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Your story</span>
                </div>

                {/* Other stories */}
                {stories.map((item, i) => (
                    <div key={item.user.id} onClick={() => openViewer(i)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
                        <div className="avatar-ring">
                            <img src={item.user.avatar_url || '/default-avatar.svg'} alt={item.user.username} className="avatar avatar-xl" />
                        </div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', maxWidth: '66px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.user.username}
                        </span>
                    </div>
                ))}

                {stories.length === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)', padding: '0 16px', whiteSpace: 'nowrap' }}>
                        No stories from anyone yet
                    </div>
                )}
            </div>

            {viewerOpen && stories.length > 0 && (
                <StoryViewer
                    stories={stories[activeUserIndex]?.stories || []}
                    user={stories[activeUserIndex]?.user}
                    onClose={() => setViewerOpen(false)}
                    onNext={() => {
                        if (activeUserIndex < stories.length - 1) setActiveUserIndex(i => i + 1);
                        else setViewerOpen(false);
                    }}
                />
            )}
        </>
    );
}
