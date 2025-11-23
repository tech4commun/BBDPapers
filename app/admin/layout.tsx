/**
 * Admin Layout
 * Server component that verifies admin access and delegates to client wrapper
 */

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getPendingContent } from "./actions";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify admin access (middleware should catch this, but double-check)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/explore");
  }

  // Fetch pending content count for sidebar badge
  const result = await getPendingContent();
  const pendingCount = result.data?.length || 0;

  return (
    <AdminLayoutWrapper pendingCount={pendingCount}>
      {children}
    </AdminLayoutWrapper>
  );
}
