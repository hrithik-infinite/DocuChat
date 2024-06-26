import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { headers } from "next/headers";
import { sub } from "date-fns";

export async function POST(request) {
  const body = await request.text();
  const signature = headers().get("Stripe-Signature") ?? "";

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err) {
    console.error("Webhook Error:", err instanceof Error ? err.message : "Unknown Error");
    return NextResponse.json({ error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}` }, { status: 400 });
  }

  console.log(`Received event: ${event.type}`);

  const session = event.data.object;
  if (!session?.metadata?.userId) {
    console.warn("Session metadata does not contain userId");
    return NextResponse.json({}, { status: 200 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      console.log("Handling checkout.session.completed for session:", session);
      await handleCheckoutSessionCompleted(session);
      break;

    case "invoice.payment_succeeded":
      console.log("Handling invoice.payment_succeeded for session:", session);
      await handleInvoicePaymentSucceeded(session);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({}, { status: 200 });
}

async function handleCheckoutSessionCompleted(session) {
  try {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    console.log("Retrieved subscription:", subscription);

    await prismadb.user.update({
      where: {
        id: session.metadata.userId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`User ${session.metadata.userId} updated with subscription details`);
  } catch (err) {
    console.error(`Error handling checkout.session.completed for session ${session.id}:`, err);
  }
}

async function handleInvoicePaymentSucceeded(session) {
  try {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    console.log("Retrieved subscription:", subscription);

    await prismadb.user.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`User with subscription ${subscription.id} updated with new payment details`);
  } catch (err) {
    console.error(`Error handling invoice.payment_succeeded for session ${session.id}:`, err);
  }
}
