'use client';
import { type LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url?: string;
    icon?: LucideIcon;
    submenu?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1">
        <SidebarMenu>
          {items.map((item) => (
            <div key={item.title} className="group">
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "w-full transition-all duration-200 hover:bg-accent/50",
                    "data-[state=open]:bg-accent/50",
                    "hover:shadow-sm hover:shadow-primary/20", // Added shadow on hover
                    "active:scale-[0.98] active:shadow-none", // Subtle press effect
                    "rounded-lg p-5"
                  )}
                  onClick={() => {
                    if (item.submenu) {
                      toggleSubmenu(item.title);
                    }
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <item.icon className={cn(
                          "h-4 w-4 text-primary",
                          "transition-transform duration-200 group-hover:scale-110" 
                        )} />
                      )}
                      {item.url ? (
                        <Link href={item.url} className="text-sm font-medium  transition-colors">
                          {item.title}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium">{item.title}</span>
                      )}
                    </div>
                    {item.submenu && (
                      openSubmenus[item.title] ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                      )
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {item.submenu && openSubmenus[item.title] && (
                <div className="ml-8 pl-3 border-l border-border/50">
                  <SidebarMenu>
                    {item.submenu.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton
                          tooltip={subItem.title}
                          className={cn(
                            "pl-6 hover:bg-accent/30",
                            "transition-all duration-200 hover:shadow-xs hover:shadow-primary/10",
                            "rounded-lg"
                          )}
                          asChild
                        >
                          <Link 
                            href={subItem.url} 
                            className="text-sm hover:text-primary transition-colors"
                          >
                            {subItem.title}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </div>
              )}
            </div>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}