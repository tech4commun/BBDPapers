import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LoginForm from "@/components/LoginForm";

// Force dynamic rendering - prevents caching for logged-in users
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  // Server-side session check - redirect logged-in users
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // IF USER EXISTS, KICK THEM OUT (return ensures immediate execution)
  if (user) {
    return redirect("/explore");
  }

  const nextUrl = searchParams.next;

  return <LoginForm nextUrl={nextUrl} />;
}
