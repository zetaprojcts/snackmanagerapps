import { useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let disposed = false;
    let transitionId = 0;
    let committedUserId: string | null = null;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        const nextUserId = nextSession?.user.id ?? null;
        const currentTransitionId = ++transitionId;

        if (nextUserId === committedUserId) {
          setSession(nextSession);
          setLoading(false);
          return;
        }

        setLoading(true);

        void queryClient
          .cancelQueries()
          .catch((error) => {
            console.error("Gagal membatalkan query session:", error);
          })
          .finally(() => {
            if (disposed || currentTransitionId !== transitionId) {
              return;
            }

            queryClient.clear();
            committedUserId = nextUserId;
            setSession(nextSession);
            setLoading(false);
          });
      },
    );

    void supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error && !disposed) {
          console.error("Gagal memulihkan sesi login:", error.message);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!disposed) {
          console.error("Gagal memulihkan sesi login:", error);
          setLoading(false);
        }
      });

    return () => {
      disposed = true;
      transitionId += 1;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const signOut = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    } catch (error) {
      setLoading(false);
      throw new Error(
        error instanceof Error ? error.message : "Gagal keluar dari akun.",
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth harus digunakan di dalam AuthProvider.",
    );
  }

  return context;
}
