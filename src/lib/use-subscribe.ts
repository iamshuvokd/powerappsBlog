import { useState } from "react";
import { toast } from "sonner";
import { subscribe } from "@/lib/api";

/**
 * Shared newsletter sign-up logic for the footer + newsletter section forms.
 * Handles validation, the API call, toast feedback and a loading flag.
 * Returns true on success so the caller can clear its input.
 */
export function useSubscribe() {
  const [loading, setLoading] = useState(false);

  const submit = async (email: string): Promise<boolean> => {
    const value = email.trim();
    if (!value) {
      toast.error("Please enter your email.");
      return false;
    }
    setLoading(true);
    try {
      const res = await subscribe(value);
      toast.success(
        res.alreadySubscribed ? "You're already subscribed." : "Subscribed — thanks for joining!",
      );
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Subscription failed. Try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
}
