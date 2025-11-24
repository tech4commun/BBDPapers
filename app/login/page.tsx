import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LoginForm from "@/components/LoginForm";

// Force dynamic rendering - prevents caching for logged-in users
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Server-side session check - redirect logged-in users
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const params = await searchParams;
  const nextUrl = params.next;

  console.log("🔵 Login Page - nextUrl from searchParams:", nextUrl); // Debug log

  // IF USER EXISTS, KICK THEM OUT to their intended destination
  if (user) {
    return redirect(nextUrl || "/explore");
  }

  return <LoginForm nextUrl={nextUrl} />;
}
