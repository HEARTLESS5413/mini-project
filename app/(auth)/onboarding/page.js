'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const { updateProfile } = useAuth();
    const fileInputRef = useRef(null);

    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onload = (ev) => setAvatarPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username) return;
        setLoading(true);
        try {
            await updateProfile({
                username,
                full_name: fullName,
                bio,
                avatar_url: avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            });
            router.push('/feed');
        } catch (err) {
            console.error('Profile update failed:', err);
            router.push('/feed');
        }
        setLoading(false);
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">
                <h2>Set Up Your Profile</h2>
                <p>Tell the world who you are</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Avatar Upload */}
                    <div className="avatar-upload">
                        <div
                            className="avatar-upload-circle"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" />
                            ) : (
                                <Camera size={32} color="var(--text-tertiary)" />
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            className="text-blue font-semibold"
                            onClick={() => fileInputRef.current?.click()}
                            style={{ fontSize: 'var(--font-size-sm)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            Add Profile Photo
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="input"
                            placeholder="Choose a unique username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="fullname">Full Name</label>
                        <input
                            id="fullname"
                            type="text"
                            className="input"
                            placeholder="Your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            className="input"
                            placeholder="Tell people about yourself..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            maxLength={150}
                            style={{ resize: 'none' }}
                        />
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                            {bio.length}/150
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        disabled={!username || loading}
                        style={{ marginTop: '8px' }}
                        id="complete-profile-btn"
                    >
                        {loading ? 'Setting up...' : 'Complete Profile'}
                        {!loading && <ArrowRight size={18} />}
                    </button>

                    <button
                        type="button"
                        className="btn btn-ghost btn-block"
                        onClick={() => router.push('/feed')}
                    >
                        Skip for now
                    </button>
                </form>
            </div>
        </div>
    );
}
