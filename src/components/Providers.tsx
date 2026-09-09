"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // refetchInterval подтягивает свежую роль пользователя (например, после того как
    // супер-админ назначил его администратором) без необходимости выходить и заходить снова.
    <SessionProvider refetchInterval={60} refetchOnWindowFocus>
      {children}
    </SessionProvider>
  );
}
