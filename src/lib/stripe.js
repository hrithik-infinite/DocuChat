import { PLANS } from "@/lib/stripePlans";
import prismadb from "@/lib/prismadb";
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

    const dbUser = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!dbUser) {
      return {
        ...PLANS[0],
        isSubscribed: false,
        isCanceled: false,
        stripeCurrentPeriodEnd: null,
      };
    }

    const isSubscribed = Boolean(dbUser.stripePriceId && dbUser.stripeCurrentPeriodEnd && dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now());

    const plan = isSubscribed ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId) : null;

    let isCanceled = false;
    if (isSubscribed && dbUser.stripeSubscriptionId) {
      const stripePlan = await stripe.subscriptions.retrieve(dbUser.stripeSubscriptionId);

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
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }
}
