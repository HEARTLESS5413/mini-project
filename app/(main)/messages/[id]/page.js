'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Video, Info, Send, Smile, ImagePlus, Mic } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMessages, sendMessage } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase/client';
import CallScreen from '@/components/call/CallScreen';

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const { user, profile } = useAuth();
    const messagesEndRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [callType, setCallType] = useState(null);
    const [loading, setLoading] = useState(true);

    const supabase = getSupabaseClient();

    useEffect(() => {
        const load = async () => {
            if (!user) return;

            // Load messages
            const { data: msgs } = await getMessages(params.id);
            setMessages(msgs);

            // Find the other participant
            const { data: participants } = await supabase
                .from('conversation_participants')
                .select('profiles:user_id(*)')
                .eq('conversation_id', params.id)
                .neq('user_id', user.id);

            if (participants?.[0]?.profiles) {
                setOtherUser(participants[0].profiles);
            }

            setLoading(false);
        };
        load();
    }, [params.id, user, supabase]);

    // Real-time message subscription
    useEffect(() => {
        const channel = supabase
            .channel(`messages:${params.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${params.id}`,
            }, (payload) => {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.find(m => m.id === payload.new.id)) return prev;
                    return [...prev, payload.new];
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [params.id, supabase]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const text = newMessage.trim();
        setNewMessage('');

        // Optimistic update
        const optimisticMsg = {
            id: `temp-${Date.now()}`,
            sender_id: user.id,
            text,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMsg]);

        // Send to Supabase
        const { data } = await sendMessage(params.id, user.id, text);
        if (data) {
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
        }
    };

    if (callType) {
        return (
            <CallScreen
                user={otherUser || { username: 'User', avatar_url: '/default-avatar.svg' }}
                callType={callType}
                onEnd={() => setCallType(null)}
                conversationId={params.id}
            />
        );
    }

    return (
        <div className="chat-view">
            {/* Header */}
            <div className="chat-header">
                <button onClick={() => router.push('/messages')} style={{ color: 'var(--text-primary)' }}>
                    <ArrowLeft size={24} />
                </button>
                <img src={otherUser?.avatar_url || '/default-avatar.svg'} alt="" className="avatar avatar-md" />
                <div className="chat-header-info">
                    <h3>{otherUser?.username || 'Loading...'}</h3>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Active</span>
                </div>
                <div className="chat-header-actions">
                    <button onClick={() => setCallType('audio')} className="btn-icon" aria-label="Audio call">
                        <Phone size={22} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => setCallType('video')} className="btn-icon" aria-label="Video call">
                        <Video size={22} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {otherUser && (
                    <div style={{ textAlign: 'center', padding: '20px 0 30px' }}>
                        <img src={otherUser.avatar_url || '/default-avatar.svg'} alt="" className="avatar" style={{ width: '64px', height: '64px', margin: '0 auto 8px' }} />
                        <p style={{ fontWeight: 600 }}>{otherUser.full_name || otherUser.username}</p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{otherUser.username} · Instagram</p>
                    </div>
                )}

                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <p>No messages yet. Say hi!</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id}>
                            <div className={`message-bubble ${msg.sender_id === user?.id ? 'sent' : 'received'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chat-input-bar" onSubmit={handleSend}>
                <button type="button" className="btn-icon" style={{ color: 'var(--text-secondary)' }}><Smile size={24} /></button>
                <input type="text" className="chat-input" placeholder="Message..." value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)} id="chat-message-input" />
                {newMessage.trim() ? (
                    <button type="submit" className="btn-icon" style={{ color: 'var(--accent-blue)' }}><Send size={22} /></button>
                ) : (
                    <>
                        <button type="button" className="btn-icon" style={{ color: 'var(--text-secondary)' }}><Mic size={22} /></button>
                        <button type="button" className="btn-icon" style={{ color: 'var(--text-secondary)' }}><ImagePlus size={22} /></button>
                    </>
                )}
            </form>
        </div>
    );
}
