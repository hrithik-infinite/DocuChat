"use client";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import axios from "axios";

const UpgradeButton = () => {
  const createStripeSession = async () => {
    const resp = await axios.post("/api/createStripeSession");
    window.location.href = resp?.data?.url ?? "/dashboard/billing";
  };
  return (
    <Button onClick={createStripeSession} className="w-full">
      Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
    </Button>
  );
};

export default UpgradeButton;
