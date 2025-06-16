import { handleCheckoutSessionCompleted } from "@/lib/payments";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const POST = async (req: NextRequest) => {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret);
    console.log(event.type);
    switch (event.type) {
      case "checkout.session.completed":
        console.log("checkout session");
        const sessionId = event.data.object.id;
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ["line_items"]
        });
        await handleCheckoutSessionCompleted({ session, stripe });
        break;
      case "customer.subscription.deleted":
        console.log("customer.subscription ");
        const subscription = event.data.object;
      default:
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
  }
  return NextResponse.json({ status: "Success" });
};
