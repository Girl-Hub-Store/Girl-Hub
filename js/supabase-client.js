// Supabase browser client for Girl Hub. Never put a service_role key in this file.
(function(){
  const ready = !!(window.supabase && window.GH_SUPABASE_URL && window.GH_SUPABASE_ANON_KEY);
  window.GH_SUPABASE_READY = ready;
  window.GH_SB = ready ? window.supabase.createClient(window.GH_SUPABASE_URL, window.GH_SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;
})();
