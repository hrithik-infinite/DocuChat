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
export const plans: PricingType[] = [
  {
    id: "basic",
    name: "Basic",
    description: "For occasional users",
    paymentLink: isDev ? "https://buy.stripe.com/test_6oU5kF9vEgst99gcCvefC01" : "",
    priceId: isDev ? "price_1RaF4TSHV5FsgvHgLpuuzVlL" : "",
    price: 9,
    items: ["5 PDF summaries per month", "Standard processing speed", "Email support"]
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals and teams",
    paymentLink: isDev ? "https://buy.stripe.com/test_dRmaEZ8rAb89cls45ZefC00" : "",
    priceId: isDev ? "price_1RaF4jSHV5FsgvHgD5ke40Oe" : "",
    price: 19,
    items: ["Unlimited PDF summaries", "Priority processing", "24/7 priority support", "Markdown export"]
  }
];

export const ORIGIN_URL = isDev ? "http://localhost:3000/" : "";
