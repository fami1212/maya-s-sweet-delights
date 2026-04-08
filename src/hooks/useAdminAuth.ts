import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useAdminAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) throw error;
    return !!data;
  };

  useEffect(() => {
    let isMounted = true;

    const syncSession = async (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);

      if (!nextSession?.user) {
        setIsAdmin(false);
        return;
      }

      try {
        const admin = await checkAdminRole(nextSession.user.id);
        if (isMounted) {
          setIsAdmin(admin);
        }
      } catch (error) {
        console.error("Erreur vérification admin:", error);
        if (isMounted) {
          setIsAdmin(false);
        }
      }
    };

    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        await syncSession(currentSession);
      } catch (error) {
        console.error("Erreur restauration session:", error);
        if (isMounted) {
          setSession(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      setLoading(false);

      if (!nextSession?.user) {
        setIsAdmin(false);
        return;
      }

      void checkAdminRole(nextSession.user.id)
        .then((admin) => {
          if (isMounted) {
            setIsAdmin(admin);
          }
        })
        .catch((error) => {
          console.error("Erreur changement session admin:", error);
          if (isMounted) {
            setIsAdmin(false);
          }
        });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success("Inscription réussie ! Vérifiez votre email.");
    return true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  };

  return { session, isAdmin, loading, signIn, signUp, signOut };
};
