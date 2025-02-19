import { buttonVariants } from "@/components/ui/button";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
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
