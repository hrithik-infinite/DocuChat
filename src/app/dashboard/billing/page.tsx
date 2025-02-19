import BillingForm from "@/components/BillingForm";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const Page = async () => {
  const subscriptionPlan = await getUserSubscriptionPlan();

  if (!subscriptionPlan) {
    console.error("Error: Subscription plan is null or undefined.");
    return <p>Unable to fetch billing details. Please try again later.</p>;
  }

  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default Page;
