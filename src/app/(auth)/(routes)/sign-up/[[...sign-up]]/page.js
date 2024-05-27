import { buttonVariants } from "@/components/ui/button";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      appearance={{
        elements: {
          formButtonPrimary: buttonVariants({
            size: "lg",
            className: "mt-5",
          }),
        },
      }}
    />
  );
}
