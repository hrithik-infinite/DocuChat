import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Image from "next/image";
import { buttonVariants } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
// import MobileNav from "./MobileNav";
const NavBar = () => {
  const { userId } = auth();

  return (
    <nav className="sticky inset-x-0 top-0 z-30 h-14 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="z-40 flex font-semibold">
            <Image src="/DocuChat_logo_black.png" alt="uploading preview" width={180} height={32} quality={100} />
          </Link>
          {/* <MobileNav isAuth={!!userId} /> */}

          <div className="hidden items-center space-x-4 sm:flex">
            {!userId ? (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm"
                  })}>
                  Pricing
                </Link>
                <LoginLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm"
                  })}>
                  Sign In
                </LoginLink>
                <RegisterLink
                  className={buttonVariants({
                    size: "sm"
                  })}>
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm"
                  })}>
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/billing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm"
                  })}>
                  Subscription
                </Link>
                <UserButton showName />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default NavBar;
