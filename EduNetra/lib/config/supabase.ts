// import { createClient } from '@supabase/supabase-js';

// /**
//  * Supabase Client Configuration
//  * 
//  * Two clients are created for different use cases:
//  * 
//  * 1. supabaseBrowser - Uses anon key
//  *    - For client-side operations
//  *    - Respects Row Level Security (RLS) policies
//  *    - Safe to use in browser environment
//  * 
//  * 2. supabaseServer - Uses service role key
//  *    - For server-side admin operations
//  *    - Bypasses Row Level Security (RLS)
//  *    - Should ONLY be used in server-side code (API routes, server components)
//  *    - Has full access to all database operations
//  */

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl) {
//   throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file.');
// }

// if (!supabaseAnonKey) {
//   throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.');
// }

// if (!supabaseServiceRoleKey) {
//   throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please check your .env.local file.');
// }

// // Browser client - uses anon key for client-side operations with RLS
// export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);

// // Server client - uses service role key for admin operations (bypasses RLS)
// export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
//   auth: {
//     autoRefreshToken: false,
//     persistSession: false,
//   },
// });

// // Storage bucket name for videos
// export const VIDEO_BUCKET = 'shikshanetra';
