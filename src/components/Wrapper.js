import { cn } from "@/lib/utils";

const Wrapper = ({ className, children }) => {
  return <div className={cn("mx-auto w-full max-w-screen-xl px-2.5 md:px-20", className)}>{children}</div>;
};

export default Wrapper;
