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
    return NextResponse.json({ error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}` }, { status: 400 });
  }
  console.log(event.type, "______________event.type________");

  const session = event.data.object;
  if (!session?.metadata?.userId) {
    return NextResponse.json({}, { status: 200 });
  }
  switch (event.type) {
    case "checkout.session.completed":
      console.log("inside http://localhost:3001/dashboard/billin" , session);
      await handleCheckoutSessionCompleted(session);
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(session);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({}, { status: 200 });
}

async function handleCheckoutSessionCompleted(session) {
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
console.log("api subs", subscription);
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
}

async function handleInvoicePaymentSucceeded(session) {
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  await prismadb.user.update({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}
