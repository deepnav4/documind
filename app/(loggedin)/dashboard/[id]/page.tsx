import {AppSidebar} from "@/components/app-sidebar";
import {ResizablePanelExample} from "@/components/examples/resizable-panel";
import {AnimatedThemeToggler} from "@/components/ui/animated-theme-toggler";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {PlusIcon} from "lucide-react";
import Link from "next/link";
import {
  getAllDocumentsByUserId,
  getDocumentById,
  checkIfEmbeddingsExist,
} from "@/actions/upload-actions";
import CheckIfUserExists from "@/actions/checkUser";
import {auth} from "@/utils/auth";
import {EmptyState} from "@/components/individual-project/empty-state";
import {TbCardsFilled} from "react-icons/tb";
import {redirect} from "next/navigation";

type TDocumentInfo = {
  file_name: string;
  file_size: string;
};

type TUserInfo = {
  name: string;
  email: string;
  image: string;
};

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const [document, user, embeddingsStatus] = await Promise.all([
    getDocumentById(id),
    CheckIfUserExists(),
    checkIfEmbeddingsExist(id),
  ]);

  const userIn = await auth();
  const userInfo: TUserInfo = {
    name: userIn?.user?.name ?? "",
    email: userIn?.user?.email ?? "",
    image: userIn?.user?.image ?? "",
  };
  const documents = await getAllDocumentsByUserId();
  const allDocuments =
    documents.documents?.map((doc) => ({
      name: doc.file_name || "Untitled PDF",
      url: `/dashboard/${doc.id}`,
      id: doc.id,
    })) || [];

  const documentData = document.document;

  if (!documentData) {
    return (
      <div>
        Document data not available
      </div>
    );
  }

  const documentInfo: TDocumentInfo = {
    file_name: documentData.file_name ?? "Untitled PDF",
    file_size: documentData.file_size ?? "0 KB",
  };

  const documentContextForChat = {
    id: documentData.id,
    url: documentData.original_file_url,
    name: documentData.file_name || "Untitled PDF",
    key: documentData.file_key || "",
    size: documentData.file_size || "",
    totalChunks: embeddingsStatus?.total || 0,
    isReady: embeddingsStatus?.isReady || false,
    chatMessages: documentData.chatMessages,
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar
        allDocuments={allDocuments}
        documentInfo={documentInfo}
        user={userInfo}
      />
      <SidebarInset className="max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 pr-5">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div className="flex gap-2 items-baseline justify-center">
            <Button
              size={"sm"}
              className="rounded-sm hidden md:inline bg-linear-to-r from-blue-400 to-blue-500 hover:from-blue-600 hover:to-blue-800 hover:scale-105 transition-all duration-300 group"
            >
              <Link href={"/upload"} className="flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" /> Upload PDF
              </Link>
            </Button>
            <Button
              size={"xs"}
              className="md:hidden rounded-xs bg-linear-to-r from-blue-400 to-blue-500 dark:from-zinc-200 dark:to-zinc-400 hover:from-blue-600 hover:to-blue-800 hover:scale-105 transition-all duration-300 group"
            >
              <Link href={"/upload"} className="flex items-center">
                <PlusIcon className="w-3 h-3 mr-1" /> Upload PDF
              </Link>
            </Button>
            <AnimatedThemeToggler />
          </div>
        </header>
        <Separator />
        <ResizablePanelExample
          url={documentData.original_file_url}
          generatedContent={documentData.generated_content}
          documentContextForChat={documentContextForChat}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
