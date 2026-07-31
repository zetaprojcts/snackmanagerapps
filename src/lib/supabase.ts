import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const appEnvironment =
  process.env.EXPO_PUBLIC_APP_ENV ?? "unknown";

if (!supabaseUrl) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL belum tersedia. Periksa file environment.",
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_ANON_KEY belum tersedia. Periksa file environment.",
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

if (__DEV__) {
  console.log(`Database aktif: ${appEnvironment}`);
}