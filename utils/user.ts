import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserUploadCount } from "@/lib/summaries";
import { plans } from "./contants";

export async function getPriceId(email: string) {
  const [user] = await db
    .select({ priceId: users.priceId })
    .from(users)
    .where(and(eq(users.email, email), eq(users.status, "active")));
  return user?.priceId || null;
}

export async function hasReachedUploadLimit(userId: string) {
  const uploadCount = await getUserUploadCount(userId);
  const priceId = await getPriceId(userId);
  const isPro = plans.find((val) => val.priceId === priceId)?.id === "pro";
  const uploadLimit = isPro ? 100 : 5;
  return {
    hasReachedLimit: uploadCount >= uploadLimit,
    uploadLimit
  };
}
