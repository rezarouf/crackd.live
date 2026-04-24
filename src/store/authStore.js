import { create } from 'zustand';
import { supabase } from '../lib/supabase.js';

export const useAuthStore = create((set, get) => ({
  user:    null,
  profile: null,
  loading: true,
  error:   null,

  init: async () => {
    set({ loading: true });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await get().loadProfile(session.user);
      set({ user: session.user, loading: false });
    } else {
      set({ user: null, loading: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await get().loadProfile(session.user);
        set({ user: session.user });
      } else {
        set({ user: null, profile: null });
      }
    });
  },

  loadProfile: async (user) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) set({ profile: data });
  },

  signUp: async (email, password, username) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username } },
    });
    if (error) { set({ error: error.message }); return { error }; }
    return { data };
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { set({ error: error.message }); return { error }; }
    return { data };
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) set({ error: error.message });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  clearError: () => set({ error: null }),
}));
