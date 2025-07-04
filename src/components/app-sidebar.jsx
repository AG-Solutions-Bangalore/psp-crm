import {
  AudioWaveform,
  ChartColumnDecreasing,
  Command,
  Factory,
  GalleryVerticalEnd,
  House,
  NotebookText,
  Package,
  Scissors,
  Settings2,
  Shirt,
  ShoppingCart,
  Zap,
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
import { useSelector } from "react-redux";

export function AppSidebar({ ...props }) {
  const nameL = useSelector((state) => state.auth.name);
  const emailL = useSelector((state) => state.auth.email);
  const companyName = useSelector((state) => state.auth.companyname);
  const userType = useSelector((state) => state.auth.user_type);
  const firstSpaceIndex = companyName.indexOf(" ");
  const name =
    companyName.length > 5
      ? `${companyName.slice(0, 5)} ${companyName.slice(
          5,
          companyName.indexOf(" ")
        )}`
      : companyName;

  const plan =
    firstSpaceIndex !== -1 ? companyName.slice(firstSpaceIndex + 1) : "";
  const initialData = {
    user: {
      name: `${nameL}`,
      email: `${emailL}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: `${name}`,
        logo: Factory,
        plan: `${plan}`,
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
        icon: House,
        isActive: false,
      },

      {
        title: "Master",
        url: "#",
        isActive: false,
        icon: Settings2,
        items: [
          ...(userType === 3
            ? [
                {
                  title: "Team",
                  url: "/master/team",
                },
              ]
            : []),
          {
            title: "Item",
            url: "/master/item",
          },
          {
            title: "Color",
            url: "/master/color",
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
        icon: Package,
        isActive: false,
      },
      {
        title: "Granuals",
        url: "/granuals",
        icon: Zap,
        isActive: false,
      },

      // {
      //   title: "Raw Material Production",
      //   url: "/raw-material-production",
      //   icon: NotebookText,
      //   isActive: false,
      // },
      // {
      //   title: "Granuals To Yarn Production",
      //   url: "/granual-yarn-production",
      //   icon: NotebookText,
      //   isActive: false,
      // },
      {
        title: "Yarn",
        url: "/yarn",
        icon: Scissors,
        isActive: false,
      },
      {
        title: "Fabric",
        url: "/yarn-fabric-production",
        icon: Shirt,
        isActive: false,
      },
      {
        title: "Sales",
        url: "/sales",
        icon: Package,
        isActive: false,
      },
      {
        title: "Stock Summary",
        url: "/stock-summary",
        icon: Package,
        isActive: false,
      },

      // {
      //   title: "Yarn To Fabric Work Production",
      //   url: "/yarn-fabric-work-production",
      //   icon: NotebookText,
      //   isActive: false,
      // },
      {
        title: "Report",
        url: "#",
        isActive: false,
        icon: ChartColumnDecreasing,
        items: [
          {
            title: "Purchase",
            url: "#",
            isActive: false,
            icon: Package,
            items: [
              {
                title: "Raw Material",
                url: "/report/purchase-raw-material",
              },
              {
                title: "Granuals",
                url: "/report/purchase-granuals",
              },
            ],
          },
          {
            title: "Sales",
            url: "#",
            isActive: false,
            icon: ShoppingCart,
            items: [
              {
                title: "Fabric",
                url: "/report/sales-fabric",
              },
              {
                title: "Yarn",
                url: "/report/sales-yarn",
              },
            ],
          },
          {
            title: "Production",
            url: "#",
            isActive: false,
            icon: Factory,
            items: [
              {
                title: "Raw Material",
                url: "/report/production-raw-material",
              },
              {
                title: "Granuals",
                url: "/report/production-granuals",
              },

              {
                title: "Yarn",
                url: "/report/production-yarn",
              },
              {
                title: "Fabric",
                url: "/report/production-fabric",
              },
              {
                title: "Fabric Work",
                url: "/report/production-fabric-work",
              },
            ],
          },
          {
            title: "Stock",
            url: "#",
            isActive: false,
            icon: Package,
            items: [
              {
                title: "Raw material",
                url: "/report/raw-material",
              },
              {
                title: "Granuals",
                url: "/report/granuals",
              },
              {
                title: "Yarn",
                url: "/report/yarn",
              },
              {
                title: "Fabric",
                url: "/report/fabric",
              },
            ],
          },
        ],
      },
      {
        title: "Website Enquiry",
        url: "/website-enquiry",
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
