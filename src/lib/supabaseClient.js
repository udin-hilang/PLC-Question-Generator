import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rutblvearbgbkulhwvqs.supabase.co';
const supabaseAnonKey = 'sb_publishable_3iLu6NEWHiANy1j7Nzfb7Q_3FjZuzI6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
