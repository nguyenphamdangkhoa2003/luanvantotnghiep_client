'use client';
import {
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from "lucide-react";
import { getInitials } from "@/utils/index";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavUserProps {
  user: any;
  onLogout?: () => void;
}

export function NavUser({ user, onLogout }: NavUserProps) {
  const { isMobile } = useSidebar();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "hover:bg-accent/50 transition-all duration-200",
                "data-[state=open]:bg-accent/50",
                "hover:shadow-sm hover:shadow-primary/20", // Added shadow on hover
                "active:scale-[0.98]", // Subtle press effect
                "rounded-lg" // Added rounded corners
              )}
            >
              <Avatar className="h-8 w-8 rounded-lg transition-transform duration-200 ">
                {user.avatar && (
                  <AvatarImage src={user.avatar.url} alt={user.name || ""} />
                )}
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium transition-colors duration-200 ">
                  {user.name || "User"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email || "No email provided"}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4 text-muted-foreground transition-transform duration-200 " />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg shadow-xl border border-border/50 bg-background/95 backdrop-blur-sm"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-2 font-normal hover:bg-transparent">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-lg transition-transform duration-200 hover:scale-105">
                  {user.avatar?.url && (
                    <AvatarImage src={user.avatar.url} alt={user.name || ""} />
                  )}
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.name || "User"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email || "No email provided"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="border-border/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className={cn(
                  "cursor-pointer focus:bg-accent/50",
                  "transition-all duration-200 hover:shadow-xs hover:shadow-primary/10",
                  "rounded-md"
                )}
              >
                <UserCircleIcon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                <span className="transition-colors duration-200 group-hover:text-primary">Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={cn(
                  "cursor-pointer focus:bg-accent/50",
                  "transition-all duration-200 hover:shadow-xs hover:shadow-primary/10",
                  "rounded-md"
                )}
              >
                <CreditCardIcon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                <span className="transition-colors duration-200 group-hover:text-primary">Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={cn(
                  "cursor-pointer focus:bg-accent/50",
                  "transition-all duration-200 hover:shadow-xs hover:shadow-primary/10",
                  "rounded-md"
                )}
              >
                <BellIcon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                <span className="transition-colors duration-200 group-hover:text-primary">Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="border-border/50" />
            <DropdownMenuItem 
              className={cn(
                "cursor-pointer focus:bg-red-500/10 text-red-500",
                "transition-all duration-200 hover:shadow-xs hover:shadow-red-500/10",
                "rounded-md hover:text-red-600"
              )}
              onClick={handleLogout}
            >
              <LogOutIcon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}