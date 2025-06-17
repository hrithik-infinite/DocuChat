export type PricingType = {
  id: string;
  name: string;
  description: string;
  paymentLink: string;
  priceId: string;
  price: number;
  items: string[];
};

export const plans: PricingType[] = [
  {
    id: "basic",
    name: "Basic",
    description: "For occasional users",
    paymentLink: process.env.NODE_ENV == "development" ? "https://buy.stripe.com/test_6oU5kF9vEgst99gcCvefC01" : "",
    priceId: process.env.NODE_ENV === "development" ? "price_1RaF4TSHV5FsgvHgLpuuzVlL" : "",
    price: 9,
    items: ["5 PDF summaries per month", "Standard processing speed", "Email support"]
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals and teams",
    paymentLink: process.env.NODE_ENV === "development" ? "https://buy.stripe.com/test_dRmaEZ8rAb89cls45ZefC00" : "",
    priceId: process.env.NODE_ENV === "development" ? "price_1RaF4jSHV5FsgvHgD5ke40Oe" : "",
    price: 19,
    items: ["Unlimited PDF summaries", "Priority processing", "24/7 priority support", "Markdown export"]
  }
];
