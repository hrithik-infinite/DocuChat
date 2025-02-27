import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const header = await headers();
  console.log("[WEBHOOK RECEIVED] Body:", JSON.stringify(body));
  console.log("[WEBHOOK RECEIVED] Headers:", JSON.stringify(header));

  const signature = header.get("Stripe-Signature") ?? "";
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
    console.log("[WEBHOOK VERIFIED] Event Type:", event.type);
  } catch (err) {
    console.error("[WEBHOOK ERROR] Invalid Signature:", err);
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (!session?.metadata?.userId) {
    console.warn("[WEBHOOK WARNING] Missing userId in session metadata");
    return new Response(null, { status: 200 });
  }

  if (event.type === "checkout.session.completed") {
    console.log("[CHECKOUT COMPLETED] Processing subscription for userId:", session.metadata.userId);
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    console.log("[SUBSCRIPTION DETAILS] Subscription ID:", subscription.id);

    await db.user.update({
      where: { id: session.metadata.userId },
      data: {
        stripeSubscriptionId: subscription?.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0]?.price?.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });
    console.log("[DB UPDATED] User subscription details saved");
  }

  if (event.type === "invoice.payment_succeeded") {
    console.log("[PAYMENT SUCCESS] Processing invoice payment for subscription:", session.subscription);
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    console.log("[SUBSCRIPTION DETAILS] Subscription ID:", subscription.id);

    await db.user.update({
      where: { stripeSubscriptionId: subscription?.id },
      data: {
        stripePriceId: subscription.items.data[0]?.price?.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });
    console.log("[DB UPDATED] Subscription renewal details updated");
  }

  console.log("[WEBHOOK PROCESSED] Successfully handled event type:", event.type);
  return new Response(null, { status: 200 });
}
