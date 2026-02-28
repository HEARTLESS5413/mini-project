import { getSupabaseClient } from './supabase/client';

const supabase = getSupabaseClient();

// ── Profile APIs ──
export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
}

export async function getProfileByUsername(username) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
    return { data, error };
}

export async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
    return { data, error };
}

export async function searchUsers(query) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20);
    return { data: data || [], error };
}

// ── Posts APIs ──
export async function getFeedPosts(userId) {
    // Get posts from people the user follows + own posts
    const { data: followingIds } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

    const ids = (followingIds || []).map(f => f.following_id);
    ids.push(userId);

    const { data, error } = await supabase
        .from('posts')
        .select('*, profiles:user_id(*)')
        .in('user_id', ids)
        .order('created_at', { ascending: false })
        .limit(50);
    return { data: data || [], error };
}

export async function getAllPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select('*, profiles:user_id(*)')
        .order('created_at', { ascending: false })
        .limit(50);
    return { data: data || [], error };
}

export async function getUserPosts(userId) {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data: data || [], error };
}

export async function createPost(userId, mediaUrl, caption, mediaType = 'image') {
    const { data, error } = await supabase
        .from('posts')
        .insert({ user_id: userId, media_url: mediaUrl, caption, media_type: mediaType })
        .select('*, profiles:user_id(*)')
        .single();
    return { data, error };
}

export async function deletePost(postId) {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    return { error };
}

// ── Likes ──
export async function likePost(userId, postId) {
    const { error } = await supabase.from('likes').insert({ user_id: userId, post_id: postId });
    if (!error) {
        await supabase.rpc('increment_likes', { post_id_input: postId }).catch(() => {
            // fallback: manual increment
            supabase.from('posts').update({ likes_count: supabase.raw('likes_count + 1') }).eq('id', postId);
        });
    }
    return { error };
}

export async function unlikePost(userId, postId) {
    const { error } = await supabase.from('likes').delete().match({ user_id: userId, post_id: postId });
    return { error };
}

export async function checkIfLiked(userId, postId) {
    const { data } = await supabase
        .from('likes')
        .select('user_id')
        .match({ user_id: userId, post_id: postId })
        .single();
    return !!data;
}

// ── Comments ──
export async function getComments(postId) {
    const { data, error } = await supabase
        .from('comments')
        .select('*, profiles:user_id(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
    return { data: data || [], error };
}

export async function addComment(userId, postId, text) {
    const { data, error } = await supabase
        .from('comments')
        .insert({ user_id: userId, post_id: postId, text })
        .select('*, profiles:user_id(*)')
        .single();
    return { data, error };
}

// ── Stories ──
export async function getActiveStories() {
    const { data, error } = await supabase
        .from('stories')
        .select('*, profiles:user_id(*)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
    return { data: data || [], error };
}

export async function createStory(userId, mediaUrl, mediaType = 'image') {
    const { data, error } = await supabase
        .from('stories')
        .insert({ user_id: userId, media_url: mediaUrl, media_type: mediaType })
        .select()
        .single();
    return { data, error };
}

// ── Reels ──
export async function getReels() {
    const { data, error } = await supabase
        .from('reels')
        .select('*, profiles:user_id(*)')
        .order('created_at', { ascending: false })
        .limit(20);
    return { data: data || [], error };
}

export async function createReel(userId, videoUrl, caption) {
    const { data, error } = await supabase
        .from('reels')
        .insert({ user_id: userId, video_url: videoUrl, caption })
        .select()
        .single();
    return { data, error };
}

// ── Follow/Unfollow ──
export async function followUser(followerId, followingId) {
    const { error } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });
    return { error };
}

export async function unfollowUser(followerId, followingId) {
    const { error } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: followerId, following_id: followingId });
    return { error };
}

export async function checkIfFollowing(followerId, followingId) {
    const { data } = await supabase
        .from('follows')
        .select('follower_id')
        .match({ follower_id: followerId, following_id: followingId })
        .single();
    return !!data;
}

export async function getFollowers(userId) {
    const { data, error } = await supabase
        .from('follows')
        .select('follower_id, profiles:follower_id(*)')
        .eq('following_id', userId);
    return { data: data || [], error };
}

export async function getFollowing(userId) {
    const { data, error } = await supabase
        .from('follows')
        .select('following_id, profiles:following_id(*)')
        .eq('follower_id', userId);
    return { data: data || [], error };
}

export async function getFollowCounts(userId) {
    const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);
    const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);
    const { count: posts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
    return { followers: followers || 0, following: following || 0, posts: posts || 0 };
}

// ── Conversations & Messages ──
export async function getConversations(userId) {
    const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
      conversation_id,
      conversations:conversation_id(id, updated_at),
      profiles:user_id(*)
    `)
        .eq('user_id', userId);

    if (error || !data) return { data: [], error };

    // Get the other participants and last messages
    const convIds = data.map(d => d.conversation_id);
    const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, profiles:user_id(*)')
        .in('conversation_id', convIds)
        .neq('user_id', userId);

    const { data: lastMessages } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false });

    // Build conversation objects
    const conversations = convIds.map(convId => {
        const otherUser = (allParticipants || []).find(p => p.conversation_id === convId);
        const lastMsg = (lastMessages || []).find(m => m.conversation_id === convId);
        return {
            id: convId,
            user: otherUser?.profiles || {},
            lastMessage: lastMsg?.text || '',
            time: lastMsg ? timeAgo(lastMsg.created_at) : '',
            unread: lastMsg ? !lastMsg.read && lastMsg.sender_id !== userId : false,
        };
    });

    return { data: conversations, error: null };
}

export async function getOrCreateConversation(userId, otherUserId) {
    // Check if conversation exists
    const { data: myConvs } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

    const { data: theirConvs } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', otherUserId);

    const myIds = (myConvs || []).map(c => c.conversation_id);
    const theirIds = (theirConvs || []).map(c => c.conversation_id);
    const common = myIds.filter(id => theirIds.includes(id));

    if (common.length > 0) return { conversationId: common[0] };

    // Create new conversation
    const { data: conv } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

    if (conv) {
        await supabase.from('conversation_participants').insert([
            { conversation_id: conv.id, user_id: userId },
            { conversation_id: conv.id, user_id: otherUserId },
        ]);
    }

    return { conversationId: conv?.id };
}

export async function getMessages(conversationId) {
    const { data, error } = await supabase
        .from('messages')
        .select('*, profiles:sender_id(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
    return { data: data || [], error };
}

export async function sendMessage(conversationId, senderId, text) {
    const { data, error } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, sender_id: senderId, text })
        .select('*, profiles:sender_id(*)')
        .single();
    // Update conversation timestamp
    await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    return { data, error };
}

// ── File Upload ──
export async function uploadFile(bucket, filePath, file) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });
    if (error) return { url: null, error };
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { url: urlData.publicUrl, error: null };
}

// ── Utility ──
function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return `${Math.floor(diff / 604800)}w`;
}

export { timeAgo };
