'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { getSupabaseClient } from '@/lib/supabase/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const supabase = getSupabaseClient();

    const fetchProfile = useCallback(async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (!error && data) {
            setProfile(data);
            return data;
        }
        return null;
    }, [supabase]);

    const createProfile = useCallback(async (clerkUser) => {
        const userId = clerkUser.id;
        const username = clerkUser.username ||
            (clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || '').replace(/[^a-z0-9_]/gi, '') + '_' + userId.slice(-4);
        const fullName = clerkUser.fullName || '';
        const avatarUrl = clerkUser.imageUrl || '';

        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                username: username.toLowerCase(),
                full_name: fullName,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })
            .select()
            .single();

        if (!error && data) {
            setProfile(data);
            return data;
        }
        return null;
    }, [supabase]);

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            setProfile(null);
            setLoading(false);
            return;
        }

        const init = async () => {
            // Try to fetch existing profile
            const existing = await fetchProfile(clerkUser.id);
            if (!existing) {
                // Create profile if doesn't exist
                await createProfile(clerkUser);
            }
            setLoading(false);
        };
        init();
    }, [isLoaded, isSignedIn, clerkUser, fetchProfile, createProfile]);

    const updateProfile = async (updates) => {
        if (!clerkUser) return;
        const { error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', clerkUser.id);
        if (error) throw error;
        setProfile(prev => ({ ...prev, ...updates }));
    };

    const uploadAvatar = async (file) => {
        if (!clerkUser) return null;
        const ext = file.name.split('.').pop();
        const filePath = `${clerkUser.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        await updateProfile({ avatar_url: data.publicUrl });
        return data.publicUrl;
    };

    return (
        <AuthContext.Provider value={{
            user: clerkUser ? { id: clerkUser.id, email: clerkUser.primaryEmailAddress?.emailAddress } : null,
            profile,
            loading: loading || !isLoaded,
            updateProfile,
            uploadAvatar,
            fetchProfile,
            isSignedIn,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
