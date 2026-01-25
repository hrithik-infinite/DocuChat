import { FileText } from "lucide-react";
import NavLink from "./nav-link";
import PlanBadge from "./PlanBadge";
import { withAuth, signOut } from "@workos-inc/authkit-nextjs";
import { Button } from "@/components/ui/button";

export default async function Header() {
  const { user } = await withAuth({ ensureSignedIn: false });

  return (
    <nav className="container flex items-center justify-between py-4 lg:px-8 px-2 mx-auto">
      <div className="flex lg:flex-1">
        <NavLink href="/" className="flex items-center gap-1 lg:gap-2 shrink-0">
          <FileText className="w-5 h-5 lg:w-8 lg:h-8 text-gray-900 hover:rotate-12 transform transition duration-200 ease-in-out" />
          <span className="font-extrabold lg:text-xl text-gray-900"> DocuChat</span>
        </NavLink>
      </div>
      <div className="flex lg:justify-center gap-4 lg:gap-12 lg:items-center">
        <NavLink href="/#pricing">Pricing</NavLink>
        {user && <NavLink href="/dashboard">Your Summaries</NavLink>}
      </div>
      <div className="flex lg:justify-end lg:flex-1">
        {user ? (
          <div className="flex gap-2 items-center">
            <NavLink href="/upload">Upload a PDF</NavLink>
            <PlanBadge />
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        ) : (
          <NavLink href="/sign-in">Sign In</NavLink>
        )}
      </div>
    </nav>
  );
}
