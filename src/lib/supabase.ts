import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// TODO: Ganti dengan URL dan ANON KEY dari dashboard Supabase Anda (Settings -> API)
const supabaseUrl = "https://ezotuwmvpzoulmyvyaqg.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6b3R1d212cHpvdWxteXZ5YXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjI1MjMsImV4cCI6MjA5Njk5ODUyM30.gGQwOs6_xDmBHEWLnZlgixw4vURMhnOxZws1uUWeVrA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
