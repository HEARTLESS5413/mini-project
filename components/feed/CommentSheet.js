'use client';

import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { getComments, addComment } from '@/lib/api';

export default function CommentSheet({ postId, currentUserId, onClose }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data } = await getComments(postId);
            setComments(data);
            setLoading(false);
        };
        load();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !currentUserId) return;
        const { data } = await addComment(currentUserId, postId, text.trim());
        if (data) setComments(prev => [...prev, data]);
        setText('');
    };

    return (
        <>
            <div className="overlay" onClick={onClose} />
            <div className="bottom-sheet" style={{ zIndex: 102 }}>
                <div className="bottom-sheet-handle" />
                <div className="modal-header">
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>Comments</h3>
                    <button onClick={onClose}><X size={22} /></button>
                </div>
                <div className="comment-sheet" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>
                    ) : comments.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            <p style={{ fontWeight: 600, fontSize: 'var(--font-size-xl)', marginBottom: '8px' }}>No comments yet</p>
                            <p>Start the conversation.</p>
                        </div>
                    ) : (
                        comments.map(c => (
                            <div key={c.id} className="comment-item">
                                <img src={c.profiles?.avatar_url || '/default-avatar.svg'} alt="" className="avatar" />
                                <div className="comment-content">
                                    <span className="username">{c.profiles?.username}</span>
                                    <span className="text">{c.text}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {currentUserId && (
                    <form className="comment-input-row" onSubmit={handleSubmit}>
                        <input type="text" placeholder="Add a comment..." value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: 'var(--font-size-base)' }} />
                        <button type="submit" disabled={!text.trim()} style={{ color: text.trim() ? 'var(--accent-blue)' : 'var(--text-tertiary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Post</button>
                    </form>
                )}
            </div>
        </>
    );
}
