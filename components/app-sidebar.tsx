"use client"

import * as React from "react"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { ProjectName } from "@/components/project-name"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { BsFiletypePdf } from "react-icons/bs";
import { VscFilePdf } from "react-icons/vsc";
import { TbFileTypePdf } from "react-icons/tb";
import UserAccountAvatar from "@/components/smoothui/user-account-avatar";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  }
}

type TDocumentInfo = {
  file_name: string;
  file_size: string;
}

export function AppSidebar({ 
  allDocuments,
  user,
  documentInfo,
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  allDocuments?: { name: string, url: string, id: string }[],
  user: {name: string, email: string, image: string},
  documentInfo?: TDocumentInfo,
}) {
  
  const projects = allDocuments?.map((doc) => ({
    name: doc.name,
    url: doc.url,
    icon: BsFiletypePdf
  })) || [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectName documentInfo={documentInfo} />
      </SidebarHeader>  
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={user} /> */}
        {user && (
        <UserAccountAvatar
          className="h-8 w-8 overflow-hidden"
          user={{
            name: user.name || "User",
            email: user.email || "",
            avatar: user.image || "",
          }}
          onLogout={() => {
            signOut()
            redirect("/")
          }}
        />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
