import Link from "next/link";
import Wrapper from "./Wrapper";
import Image from "next/image";
import { buttonVariants } from "./ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
const NavBar = () => {
  const { userId } = auth();

  return (
    <nav className="sticky inset-x-0 top-0 z-30 h-14 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <Wrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="z-40 flex font-semibold">
            <Image src="/DocuChat_logo_black.png" alt="uploading preview" width={180} height={32} quality={100} />
          </Link>
          <div className="hidden items-center space-x-4 sm:flex">
            {!userId ? (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}>
                  Pricing
                </Link>
                <SignInButton
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                />
                <SignUpButton
                  className={buttonVariants({
                    size: "sm",
                  })}>
                  <button>
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}>
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/billing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}>
                  Subscription
                </Link>
                <UserButton showName />
              </>
            )}
          </div>
        </div>
      </Wrapper>
    </nav>
  );
};

export default NavBar;
