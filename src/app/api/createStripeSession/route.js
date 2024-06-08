import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/stripePlans";

export async function POST(req, { params }) {
  const { userId } = auth();
  const billingUrl = absoluteUrl("/dashboard/billing");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 404 });
  }
  const dbUser = await prismadb.user.findFirst({
    where: {
      id: userId,
    },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 404 });
  }

  const subscriptionPlan = await getUserSubscriptionPlan();
  if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: billingUrl,
    });

    return { url: stripeSession.url };
  }
  const stripeSession = await stripe.checkout.sessions.create({
    success_url: billingUrl,
    cancel_url: billingUrl,
    mode: "subscription",
    billing_address_collection: "auto",
    line_items: [
      {
        price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
        quantity: 1,
      },
    ],
    metadata: {
      userId: userId,
    },
  });

  return { url: stripeSession.url };
}
