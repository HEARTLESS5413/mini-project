import { createBrowserClient } from '@supabase/ssr';

let supabase = null;

export function getSupabaseClient() {
    if (supabase) return supabase;

    supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    );

    return supabase;
}

export default getSupabaseClient;
