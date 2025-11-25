"use server";

import { createClient } from "@/utils/supabase/server";

interface SubmitFeedbackData {
  category: "bug" | "feature" | "content";
  message: string;
}

export async function submitFeedback(data: SubmitFeedbackData) {
  const supabase = await createClient();

  try {
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { 
        success: false, 
        error: "You must be logged in to submit feedback." 
      };
    }

    // Validate input
    if (!data.category || !["bug", "feature", "content"].includes(data.category)) {
      return { 
        success: false, 
        error: "Invalid feedback category." 
      };
    }

    if (!data.message || data.message.trim().length === 0) {
      return { 
        success: false, 
        error: "Feedback message cannot be empty." 
      };
    }

    if (data.message.trim().length > 5000) {
      return { 
        success: false, 
        error: "Feedback message is too long (max 5000 characters)." 
      };
    }

    // Insert feedback into database
    const { data: insertedData, error: insertError } = await supabase
      .from("feedback")
      .insert({
        user_id: user.id,
        category: data.category,
        message: data.message.trim(),
        status: "pending"
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Feedback insert error:", insertError);
      return { 
        success: false, 
        error: "Failed to submit feedback. Please try again." 
      };
    }

    console.log("✅ Feedback submitted:", insertedData.id);
    return { 
      success: true, 
      error: null,
      feedbackId: insertedData.id
    };

  } catch (error: any) {
    console.error("💥 Exception in submitFeedback:", error);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred." 
    };
  }
}

// Get user's feedback history
export async function getUserFeedback() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { 
        success: false, 
        error: "You must be logged in to view feedback.",
        feedback: []
      };
    }

    const { data: feedbackList, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching feedback:", error);
      return { 
        success: false, 
        error: "Failed to fetch feedback.",
        feedback: []
      };
    }

    return { 
      success: true, 
      error: null,
      feedback: feedbackList 
    };

  } catch (error: any) {
    console.error("💥 Exception in getUserFeedback:", error);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred.",
      feedback: []
    };
  }
}
