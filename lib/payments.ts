import Stripe from "stripe";
import { getDbConnection } from "./db";

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
    const sql = await getDbConnection();
    const user = await sql`SEELCT * FROM users WHERE email = ${email}`;
    if (user.length === 0) {
      await sql`INSERT INTO USERS (email, full_name ,customer_id, price_id, status)
        VALUES
        (${email}, ${fullName}, ${customerId}, ${priceId}, ${status})`;
    }
  } catch (e) {
    console.error("error in creating or updating user", e);
  }
}

async function createPayment({ session, priceId, userEmail }: { session: Stripe.Checkout.Session; priceId: string; userEmail: string }) {
  try {
    const sql = await getDbConnection();
    const { amount_total, id, status } = session;
    await sql`INSERT INTO payments (amount, status, stripe_payment_id, price_id, user_mail) VALUE (
            ${amount_total}, ${status}, ${id} , ${priceId}, ${userEmail}
        )`;
  } catch (e) {
    console.error("Error creating pament", e);
  }
}
