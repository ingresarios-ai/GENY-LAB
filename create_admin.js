import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function create() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin2@ingresarios.com',
    password: 'password123'
  });
  console.log("Result:", data, error);
}

create();
