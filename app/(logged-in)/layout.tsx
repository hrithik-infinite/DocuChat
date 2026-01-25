import { withAuth } from "@workos-inc/authkit-nextjs";
import React from "react";

export const maxDuration = 60;

export default async function Layout({ children }: { children: React.ReactNode }) {
  // ensureSignedIn: true automatically redirects to AuthKit if user is not signed in
  await withAuth({ ensureSignedIn: true });

  return <>{children}</>;
}
