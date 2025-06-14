import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import React from "react";

const itemVariants = {
  open: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.2, ease: "easeOut" },
  },
  closed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.1 },
  },
};

export function NavMain({ items }) {
  const location = useLocation();

  const handleLinkClick = () => {
    const sidebarContent = document.querySelector(".sidebar-content");
    if (sidebarContent) {
      sessionStorage.setItem("sidebarScrollPosition", sidebarContent.scrollTop);
    }
  };

  React.useEffect(() => {
    const sidebarContent = document.querySelector(".sidebar-content");
    const scrollPosition = sessionStorage.getItem("sidebarScrollPosition");

    if (sidebarContent && scrollPosition) {
      sidebarContent.scrollTop = parseInt(scrollPosition);
    }
  }, [location.pathname]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">
        Navigation
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isParentActive = hasSubItems
            ? item.items.some((subItem) => subItem.url === location.pathname)
            : location.pathname === item.url;

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <Link to={item.url} onClick={handleLinkClick}>
                  <motion.div variants={buttonVariants} whileHover="hover">
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`px-3 py-2 ${
                        isParentActive
                          ? "bg-sidebar-primary/10 text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                      }`}
                    >
                      {item.icon && <item.icon className="size-4" />}
                      <span className="ml-3">{item.title}</span>
                    </SidebarMenuButton>
                  </motion.div>
                </Link>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isParentActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <motion.div variants={buttonVariants} whileHover="hover">
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`px-3 py-2 w-full ${
                        isParentActive
                          ? "bg-sidebar-primary/10 text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                      }`}
                    >
                      {item.icon && <item.icon className="size-4" />}
                      <span className="ml-3">{item.title}</span>
                      <ChevronRight className="ml-auto size-4 transition-transform duration-200 text-sidebar-foreground/70 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </motion.div>
                </CollapsibleTrigger>
                <CollapsibleContent
                  as={motion.div}
                  variants={itemVariants}
                  initial="closed"
                  animate={isParentActive ? "open" : "closed"}
                  className="overflow-hidden"
                >
                  <SidebarMenuSub className="ml-5 border-l-2 border-sidebar-primary/20 pl-3">
                    {item.items?.map((subItem) => {
                      const isSubItemActive = location.pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              to={subItem.url}
                              onClick={handleLinkClick}
                              className={`flex items-center rounded-md px-3 py-1.5 text-sm ${
                                isSubItemActive
                                  ? "bg-sidebar-primary/10 text-sidebar-primary font-medium"
                                  : "text-sidebar-foreground/90 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground"
                              }`}
                            >
                              {subItem.icon && (
                                <subItem.icon className="mr-2 size-3.5" />
                              )}
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}



import { motion } from "framer-motion";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

const buttonVariants = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.1 },
  },
};

export function NavMainUser({ projects }) {
  const location = useLocation();

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">
        Administration
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {projects.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              key={item.name}
            >
              <SidebarMenuItem key={item.name}>
                <Link to={item.url}>
                  <SidebarMenuButton
                    tooltip={item.name}
                    className={`px-3 py-2 ${
                      isActive
                        ? "bg-sidebar-primary/10 text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                    }`}
                  >
                    {item.icon && <item.icon className="size-4" />}
                    <span className="ml-3">{item.name}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </motion.div>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}