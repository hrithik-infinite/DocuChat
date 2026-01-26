import Stripe from "stripe";
import { db } from "./db";
import { users, payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function handleCheckoutSessionCompleted({ session, stripe }: { session: Stripe.Checkout.Session; stripe: Stripe }) {
  console.log("checkout session completed", session);
  const customerId = session.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const priceId = session.line_items?.data[0]?.price?.id;
  if ("email" in customer && priceId) {
    const { email, name } = customer;
    await createOrUpdateUser({
      email: email as string,
      fullName: name as string,
      customerId,
      priceId: priceId as string,
      status: "active"
    });

    await createPayment({
      session,
      priceId: priceId as string,
      userEmail: email as string
    });
  }
}

async function createOrUpdateUser({ email, fullName, customerId, priceId, status }: { email: string; fullName: string; customerId: string; priceId: string; status: string }) {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length === 0) {
      await db.insert(users).values({
        email,
        fullName,
        customerId,
        priceId,
        status
      });
    }
  } catch (e) {
    console.error("error in creating or updating user", e);
  }
}

async function createPayment({ session, priceId, userEmail }: { session: Stripe.Checkout.Session; priceId: string; userEmail: string }) {
  try {
    const { amount_total, id, status } = session;
    await db.insert(payments).values({
      amount: amount_total || 0,
      status: status || "unknown",
      stripePaymentId: id,
      priceId,
      userEmail
    });
  } catch (e) {
    console.error("Error creating payment", e);
  }
}

export async function handleSubscriptionDeleted({ subscriptionId, stripe }: { subscriptionId: string; stripe: Stripe }) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await db
      .update(users)
      .set({ status: "cancelled" })
      .where(eq(users.customerId, subscription.customer as string));
  } catch (e) {
    console.error("error in subscription delete", e);
    throw e;
  }
}
