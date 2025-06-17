import { plans } from "@/utils/contants";
import { getPriceId } from "@/utils/user";
import { currentUser } from "@clerk/nextjs/server";
import { Badge } from "../ui/badge";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function PlanBadge() {
  const user = await currentUser();
  if (!user?.id) return null;
  const email = user?.emailAddresses?.[0]?.emailAddress;
  let priceId: string | null = null;
  if (email) {
    priceId = await getPriceId(email);
  }
  let planName = "Buy a plan";
  const plan = plans.find((plan) => plan.priceId === priceId);
  if (plan) {
    planName = plan.name;
  }

  return (
    <Badge variant={"outline"} className={cn("ml-2 bg-linear-to-r from-amber-100 to-amber-200 border-amber-300 hidden lg:flex flex-row items-center", !priceId && "from-red-100 to-red-200 border-red-300")}>
      <Crown className={cn("w-3 h-3 mr-1 text-amber-600", !priceId && "text-red-600")} />
      {planName}
    </Badge>
  );
}
