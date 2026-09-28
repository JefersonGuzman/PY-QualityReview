"use server";

import { revalidatePath } from "next/cache";
import { saveReview } from "@/lib/data/reviews";
import { getCurrentUser } from "@/lib/data/session";
import { listIssueTypes } from "@/lib/data/users";
import { validateReview, type ReviewFieldErrors } from "@/lib/domain/review";

export type ReviewFormState = {
  status: "idle" | "saved" | "invalid" | "error";
  errors?: ReviewFieldErrors;
  message?: string;
};

// Server-side validation and authorization; the form is never trusted.
export async function submitReview(
  responseId: string,
  _previous: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "team_lead") {
    return { status: "error", message: "Only Team Leads can review responses." };
  }

  const catalog = (await listIssueTypes()).map((issue) => issue.code);
  const validation = validateReview(
    { score: formData.get("score"), feedback: formData.get("feedback"), issueCodes: formData.getAll("issues") },
    catalog,
  );
  if (!validation.ok) return { status: "invalid", errors: validation.errors };

  const result = await saveReview(user, responseId, validation.value);
  if (!result.ok) {
    return {
      status: "error",
      message:
        result.reason === "not-author"
          ? "Only the Team Lead who wrote this review can edit it."
          : "This response is not available.",
    };
  }

  revalidatePath(`/responses/${responseId}`);
  return { status: "saved" };
}
