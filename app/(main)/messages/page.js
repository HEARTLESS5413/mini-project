'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getConversations } from '@/lib/api';

export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            const { data } = await getConversations(user.id);
            setConversations(data);
            setLoading(false);
        };
        load();
    }, [user]);

    const filtered = search
        ? conversations.filter(c => c.user?.username?.includes(search.toLowerCase()))
        : conversations;

    return (
        <div className="messages-page">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Messages</h2>
                <button className="btn-icon"><Edit size={22} strokeWidth={1.5} /></button>
            </div>

            <div style={{ padding: '0 16px 12px' }}>
                <div className="search-input-wrapper">
                    <Search size={18} />
                    <input type="text" className="search-input" placeholder="Search messages" value={search}
                        onChange={(e) => setSearch(e.target.value)} id="messages-search" />
                </div>
            </div>

            <div className="conversation-list">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 16px' }}>
                            <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />
                            <div style={{ flex: 1 }}>
                                <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
                                <div className="skeleton" style={{ width: '200px', height: '12px' }} />
                            </div>
                        </div>
                    ))
                ) : filtered.length === 0 ? (
                    <div className="empty-state" style={{ paddingTop: '60px' }}>
                        <h3 style={{ fontWeight: 300, fontSize: 'var(--font-size-xl)' }}>No Messages</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {search ? 'No conversations match your search.' : 'Start a conversation by messaging someone from their profile.'}
                        </p>
                    </div>
                ) : (
                    filtered.map(conv => (
                        <Link key={conv.id} href={`/messages/${conv.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="conversation-item">
                                <div style={{ position: 'relative' }}>
                                    <img src={conv.user?.avatar_url || '/default-avatar.svg'} alt={conv.user?.username || 'User'} className="avatar avatar-lg" />
                                </div>
                                <div className="conversation-info">
                                    <div className="conv-name" style={{ fontWeight: conv.unread ? 700 : 400 }}>{conv.user?.username || 'Unknown'}</div>
                                    <div className="conv-last-msg" style={{ fontWeight: conv.unread ? 600 : 400, color: conv.unread ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                                        {conv.lastMessage || 'Start chatting'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <span className="conversation-time">{conv.time}</span>
                                    {conv.unread && <div className="badge" style={{ minWidth: '8px', height: '8px', padding: 0 }} />}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
