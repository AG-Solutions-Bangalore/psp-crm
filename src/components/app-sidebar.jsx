import * as React from "react";
import {
  AudioWaveform,
  BadgeIndianRupee,
  Blocks,
  Command,
  Folder,
  Frame,
  GalleryVerticalEnd,
  Map,
  NotebookText,
  ReceiptText,
  Settings,
  Settings2,
  TicketPlus,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMainUser } from "./nav-main-user";
import { useSelector } from "react-redux";

export function AppSidebar({ ...props }) {
  const nameL = useSelector((state) => state.auth.name);
  const emailL = useSelector((state) => state.auth.email);
  const companyName = useSelector((state) => state.auth.companyname);

  const initialData = {
    user: {
      name: `${nameL}`,
      email: `${emailL}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: `${companyName}`,
        logo: GalleryVerticalEnd,
        plan: "",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/home",
        icon: Frame,
        isActive: false,
      },
      {
        title: "Master",
        url: "#",
        isActive: false,
        icon: Settings2,
        items: [
          {
            title: "Team",
            url: "/master/team",
          },
          {
            title: "Color",
            url: "/master/color",
          },
          {
            title: "Item",
            url: "/master/item",
          },
          {
            title: "Vendor",
            url: "/master/vendor",
          },
        ],
      },
      {
        title: "Raw Material",
        url: "/raw-material",
        icon: Blocks,
        isActive: false,
      },
      {
        title: "Granuals",
        url: "/granuals",
        icon: NotebookText,
        isActive: false,
      },
      {
        title: "Yarn",
        url: "/yarn",
        icon: NotebookText,
        isActive: false,
      },
      {
        title: "Fabric Sale",
        url: "/fabric-sale",
        icon: NotebookText,
        isActive: false,
      },
      {
        title: "Raw Materil Production",
        url: "/raw-material-production",
        icon: NotebookText,
        isActive: false,
      },
      {
        title: "Granuals To Yarn Production",
        url: "/granual-yarn-production",
        icon: NotebookText,
        isActive: false,
      },
    ],
  };

  const data = {
    ...initialData,
    navMain: initialData.navMain,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
        {/* <NavProjects projects={data.projects} /> */}
        <NavMain items={data.navMain} />
        {/* <NavMainUser projects={data.userManagement} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
