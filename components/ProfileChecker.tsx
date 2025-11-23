"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import CompleteProfileModal from "./CompleteProfileModal";

export default function ProfileChecker() {
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsChecking(false);
      return;
    }

    // Fetch profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("course, branch, semester, passout_year")
      .eq("id", user.id)
      .single();

    // Show modal if any required field is missing
    if (
      !profile?.course ||
      !profile?.branch ||
      !profile?.semester ||
      !profile?.passout_year
    ) {
      setShowModal(true);
    }

    setIsChecking(false);
  };

  const handleComplete = () => {
    setShowModal(false);
  };

  // Don't render anything while checking (prevents flash)
  if (isChecking) return null;

  return (
    <CompleteProfileModal isOpen={showModal} onComplete={handleComplete} />
  );
}
