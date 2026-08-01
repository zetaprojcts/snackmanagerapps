import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const configuredEnvironment = process.env.EXPO_PUBLIC_APP_ENV;

const supportedEnvironments = ["snack-dev", "snack-pub"] as const;
type AppEnvironment = (typeof supportedEnvironments)[number];

if (
  !configuredEnvironment ||
  !supportedEnvironments.includes(configuredEnvironment as AppEnvironment)
) {
  throw new Error(
    "EXPO_PUBLIC_APP_ENV tidak valid. Gunakan snack-dev atau snack-pub.",
  );
}

export const appEnvironment = configuredEnvironment as AppEnvironment;

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

let parsedSupabaseUrl: URL;

try {
  parsedSupabaseUrl = new URL(supabaseUrl);
} catch {
  throw new Error("EXPO_PUBLIC_SUPABASE_URL bukan URL yang valid.");
}

if (
  parsedSupabaseUrl.protocol !== "https:" ||
  !parsedSupabaseUrl.hostname.endsWith(".supabase.co")
) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL harus menggunakan endpoint Supabase HTTPS.",
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
