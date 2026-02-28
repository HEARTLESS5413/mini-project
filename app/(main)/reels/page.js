'use client';

import { useState, useEffect } from 'react';
import { getReels } from '@/lib/api';
import { Heart, MessageCircle, Send, Music, MoreVertical, Film } from 'lucide-react';
import Link from 'next/link';

export default function ReelsPage() {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data } = await getReels();
            setReels(data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="reels-container" style={{ position: 'fixed', inset: 0, background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="animate-pulse" style={{ color: 'white' }}>Loading Reels...</div>
            </div>
        );
    }

    if (reels.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '16px' }}>
                <div className="empty-state-icon" style={{ width: '80px', height: '80px' }}><Film size={40} /></div>
                <h3 style={{ fontWeight: 300, fontSize: 'var(--font-size-xl)' }}>No Reels Yet</h3>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '280px' }}>
                    Create your first reel to share with the world.
                </p>
                <Link href="/create" className="btn btn-primary">Create Reel</Link>
            </div>
        );
    }

    return (
        <div className="reels-container" style={{ position: 'fixed', inset: 0, background: 'black', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}>
            {reels.map(reel => (
                <div key={reel.id} className="reel-card" style={{ height: '100vh', width: '100%', position: 'relative', scrollSnapAlign: 'start' }}>
                    <video src={reel.video_url} loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    {/* Side actions */}
                    <div className="reel-actions" style={{ position: 'absolute', right: '12px', bottom: '100px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                        <button style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <Heart size={28} strokeWidth={1.5} />
                            <span style={{ fontSize: '12px' }}>{(reel.likes_count || 0).toLocaleString()}</span>
                        </button>
                        <button style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <MessageCircle size={28} strokeWidth={1.5} />
                            <span style={{ fontSize: '12px' }}>{reel.comments_count || 0}</span>
                        </button>
                        <button style={{ color: 'white' }}><Send size={26} strokeWidth={1.5} /></button>
                        <button style={{ color: 'white' }}><MoreVertical size={24} /></button>
                    </div>

                    {/* Bottom info */}
                    <div style={{ position: 'absolute', bottom: '20px', left: '12px', right: '70px', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <img src={reel.profiles?.avatar_url || '/default-avatar.svg'} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                            <span style={{ fontWeight: 600 }}>{reel.profiles?.username}</span>
                            <button className="btn btn-sm" style={{ border: '1px solid white', color: 'white' }}>Follow</button>
                        </div>
                        {reel.caption && <p style={{ fontSize: '14px', lineHeight: 1.4 }}>{reel.caption}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}
