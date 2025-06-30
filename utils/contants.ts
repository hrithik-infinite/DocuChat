export type PricingType = {
  id: string;
  name: string;
  description: string;
  paymentLink: string;
  priceId: string;
  price: number;
  items: string[];
};
const isDev = process.env.NODE_ENV === "development";
export const ORIGIN_URL = isDev ? "http://localhost:3000/" : "https://docuchat-hrithik.vercel.app/";
export const plans: PricingType[] = [
  {
    id: "basic",
    name: "Free",
    description: "For occasional users",
    paymentLink: `${ORIGIN_URL}upload`,
    priceId: "free",
    price: 0,
    items: ["5 PDF summaries per month", "Standard processing speed", "Email support"]
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals and teams",
    paymentLink: "https://buy.stripe.com/test_5kQ3cx37q1Mt18TaKx5EY00",
    priceId: isDev ? "price_1RaF4jSHV5FsgvHgD5ke40Oe" : "price_1RfkBzSIKaHu1g8JLv1yploN",
    price: 299,
    items: ["Unlimited PDF summaries", "Priority processing", "24/7 priority support", "Markdown export"]
  }
];
