import { auth, currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { notFound, redirect } from "next/navigation";
import PDFRenderer from "@/components/PDFRenderer";
import ChatWrapper from "@/components/chat/ChatWrapper";

const Page = async ({ params }) => {
  const { fileId } = params;
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const file = await prismadb.file.findFirst({
    where: {
      id: fileId,
      userId: userId,
    },
  });
  if (!file) notFound();
  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <PDFRenderer url={file.url} />
          </div>
        </div>

        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper fileId={file.id} />
        </div>
      </div>
    </div>
  );
};

export default Page;
