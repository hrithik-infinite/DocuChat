import { PLANS } from "@/lib/stripePlans";
import { prismadb } from "@/lib/prismadb";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-04-10",
});

export async function getUserSubscriptionPlan() {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        ...PLANS[0],
        isSubscribed: false,
        isCanceled: false,
        stripeCurrentPeriodEnd: null,
      };
    }

    console.log(userId, "usssssssssssssssssssssssssss");

    const dbUser = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    console.log(dbUser, "dddddddddsssssssssssssssssssssssssss");

    if (!dbUser) {
      return {
        ...PLANS[0],
        isSubscribed: false,
        isCanceled: false,
        stripeCurrentPeriodEnd: null,
      };
    }

    const isSubscribed = Boolean(dbUser.stripePriceId && dbUser.stripeCurrentPeriodEnd && dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now());

    console.log("issubscribe", isSubscribed);

    const plan = isSubscribed ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId) : null;

    console.log("plan", plan);

    let isCanceled = false;
    if (isSubscribed && dbUser.stripeSubscriptionId) {
      const stripePlan = await stripe.subscriptions.retrieve(dbUser.stripeSubscriptionId);
      console.log("stripePlan", stripePlan);

      isCanceled = stripePlan.cancel_at_period_end;
    }

    return {
      ...plan,
      stripeSubscriptionId: dbUser.stripeSubscriptionId,
      stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
      stripeCustomerId: dbUser.stripeCustomerId,
      isSubscribed,
      isCanceled,
    };
  } catch (error) {
    console.error("Error retrieving user subscription plan:", error);
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }
}
