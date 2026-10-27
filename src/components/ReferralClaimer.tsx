import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { claimReferral } from "@/lib/referrals.functions";
import { REF_STORAGE_KEY } from "@/lib/referrals";

// Once the visitor who arrived via an affiliate link is signed in, attribute them to that affiliate.
export function ReferralClaimer() {
  useEffect(() => {
    const tryClaim = async () => {
      const code = localStorage.getItem(REF_STORAGE_KEY);
      if (!code) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      try { await claimReferral({ data: { code } }); } catch { /* ignore */ }
      localStorage.removeItem(REF_STORAGE_KEY);
    };
    void tryClaim();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => { if (event === "SIGNED_IN") void tryClaim(); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return null;
}
