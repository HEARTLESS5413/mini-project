'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, User, Bell, Lock, Eye, HelpCircle,
    Info, LogOut, Moon, Sun, ChevronRight, Shield,
    Bookmark, Heart, Clock, Star, Users, MessageCircle
} from 'lucide-react';

export default function SettingsPage() {
    const { profile, updateProfile, uploadAvatar } = useAuth();
    const { signOut } = useClerk();
    const router = useRouter();
    const fileRef = useRef(null);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        username: profile?.username || '',
        full_name: profile?.full_name || '',
        bio: profile?.bio || '',
        website: profile?.website || '',
        is_private: profile?.is_private || false,
    });
    const [saving, setSaving] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(form);
            setMessage('Profile saved!');
            setEditing(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.message || 'Error saving');
        }
        setSaving(false);
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await uploadAvatar(file);
            setMessage('Avatar updated!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to upload avatar');
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const settingSections = [
        {
            title: 'How you use Instagram',
            items: [
                { icon: Bookmark, label: 'Saved' },
                { icon: Clock, label: 'Your activity' },
                { icon: Bell, label: 'Notifications' },
                { icon: Clock, label: 'Time management' },
            ],
        },
        {
            title: 'Who can see your content',
            items: [
                { icon: Lock, label: 'Account privacy', action: () => setEditing(true) },
                { icon: Users, label: 'Close friends' },
                { icon: Eye, label: 'Blocked' },
                { icon: MessageCircle, label: 'Messages' },
            ],
        },
        {
            title: 'Your app and media',
            items: [
                { icon: theme === 'dark' ? Sun : Moon, label: theme === 'dark' ? 'Light mode' : 'Dark mode', action: toggleTheme },
                { icon: Star, label: 'Favorites' },
            ],
        },
        {
            title: 'More info and support',
            items: [
                { icon: HelpCircle, label: 'Help' },
                { icon: Info, label: 'About' },
                { icon: Shield, label: 'Privacy & security' },
            ],
        },
    ];

    if (editing) {
        return (
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <button onClick={() => setEditing(false)}><ArrowLeft size={24} /></button>
                    <h2 style={{ flex: 1, fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Edit profile</h2>
                    <button onClick={handleSave} disabled={saving} style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: 'var(--font-size-md)' }}>
                        {saving ? 'Saving...' : 'Done'}
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <img src={profile?.avatar_url || '/default-avatar.svg'} alt="Avatar" className="avatar avatar-2xl" style={{ margin: '0 auto 12px' }} />
                    <button onClick={() => fileRef.current?.click()} style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Change profile photo</button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group"><label>Username</label><input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
                    <div className="input-group"><label>Name</label><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                    <div className="input-group"><label>Bio</label><textarea className="input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} style={{ resize: 'none' }} /></div>
                    <div className="input-group"><label>Website</label><input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" /></div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Private account</span>
                        <button onClick={() => setForm({ ...form, is_private: !form.is_private })}
                            style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.is_private ? 'var(--accent-blue)' : 'var(--bg-elevated)', border: '1px solid var(--border-color)', position: 'relative', transition: 'background 0.2s' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '1px', left: form.is_private ? '22px' : '1px', transition: 'left 0.2s' }} />
                        </button>
                    </div>
                </div>

                {message && <p style={{ textAlign: 'center', color: 'var(--accent-blue)', marginTop: '16px' }}>{message}</p>}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px' }}>
                <button onClick={() => router.back()}><ArrowLeft size={24} /></button>
                <h2 style={{ flex: 1, fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Settings and activity</h2>
            </div>

            <div onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                <img src={profile?.avatar_url || '/default-avatar.svg'} alt="" className="avatar avatar-lg" />
                <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>{profile?.username || 'Set up profile'}</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{profile?.full_name || ''}</p>
                </div>
                <ChevronRight size={20} color="var(--text-tertiary)" />
            </div>

            {settingSections.map(section => (
                <div key={section.title} style={{ marginTop: '24px' }}>
                    <p style={{ padding: '0 20px 8px', fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{section.title}</p>
                    {section.items.map(item => (
                        <button key={item.label} onClick={item.action || (() => { })}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', width: '100%', textAlign: 'left', color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--font-size-base)' }}>
                            <item.icon size={22} strokeWidth={1.5} />
                            <span style={{ flex: 1 }}>{item.label}</span>
                            <ChevronRight size={18} color="var(--text-tertiary)" />
                        </button>
                    ))}
                </div>
            ))}

            <div style={{ marginTop: '32px', padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
                <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-red)', width: '100%', textAlign: 'left', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
                    <LogOut size={22} />
                    Log out
                </button>
            </div>

            {message && <p style={{ textAlign: 'center', color: 'var(--accent-blue)', padding: '16px' }}>{message}</p>}
        </div>
    );
}
