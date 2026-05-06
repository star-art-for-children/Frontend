'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export const useLogout = () => {
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsLoggingOut(false);
      return;
    }
    window.location.replace('/');
  };

  return { handleLogout, isLoggingOut };
};
