'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { searchUsers, getAllPosts } from '@/lib/api';
import Link from 'next/link';

export default function ExplorePage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const load = async () => {
            const { data } = await getAllPosts();
            setPosts(data);
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        if (!query.trim()) { setResults([]); setSearching(false); return; }
        setSearching(true);
        const timeout = setTimeout(async () => {
            const { data } = await searchUsers(query);
            setResults(data);
            setSearching(false);
        }, 300);
        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Search bar */}
            <div style={{ padding: '12px 16px', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10 }}>
                <div className="search-input-wrapper">
                    <SearchIcon size={18} />
                    <input type="text" className="search-input" placeholder="Search users" value={query}
                        onChange={(e) => setQuery(e.target.value)} id="explore-search" />
                    {query && <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '12px', color: 'var(--text-tertiary)' }}><X size={18} /></button>}
                </div>
            </div>

            {/* Search results */}
            {query && (
                <div style={{ padding: '0 16px' }}>
                    {searching ? (
                        <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Searching...</p>
                    ) : results.length === 0 ? (
                        <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No users found for &ldquo;{query}&rdquo;</p>
                    ) : (
                        results.map(u => (
                            <Link key={u.id} href={`/profile/${u.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                    <img src={u.avatar_url || '/default-avatar.svg'} alt={u.username} className="avatar avatar-lg" />
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: 'var(--font-size-base)' }}>{u.username}</p>
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{u.full_name}</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {/* Explore grid */}
            {!query && (
                <div className="profile-grid" style={{ padding: '2px' }}>
                    {loading ? (
                        Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="profile-grid-item skeleton" />
                        ))
                    ) : posts.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center' }}>
                            <div className="empty-state">
                                <div className="empty-state-icon"><SearchIcon size={32} /></div>
                                <h3 style={{ fontWeight: 300, fontSize: 'var(--font-size-xl)' }}>Explore</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Posts from the community will appear here.</p>
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
            )}
        </div>
    );
}
