'use client'
import * as React from 'react'
import { LayoutDashboardIcon, Users, Settings,Car,Package, Star } from 'lucide-react'
import { NavMain } from './NavMain'
import { NavUser } from './NavUser'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { RoleEnum } from '@/types/enum'
import Logo from '../Logo'
import { useAuthContext } from '@/context/auth-provider'

interface NavItem {
  title: string
  url?: string
  icon: React.ComponentType<{ className?: string }>
  submenu?: Array<{
    title: string
    url: string
  }>
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthContext()

  const data = {
    navMain: [
      {
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: LayoutDashboardIcon,
      },
      {
        title: 'Users',
        url: '/admin/users',
        icon: Users,
      },
      {
        title: 'Pass Packages',
        url: '/admin/pass-packages',
        icon: Package,
      },
      {
        title: 'Driver Passes',
        url: '/admin/driverpasses',
        icon: Car,
      },
      {
        title: 'Reviews',
        url: '/admin/reviews',
        icon: Star, 
      },
      {
        title: 'Settings',
        url: '/admin/settings',
        icon: Settings,
      },
    ],
  }

  if (!user) {
    return null
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className="border-r shadow border-border/50"
    >
      <SidebarHeader className="px-4 py-4">
        <SidebarMenu>
          <Link href="/" className="flex items-center justify-center gap-2">
            <Logo width="160" height="40" fill="var(--primary)" />
          </Link>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="!p-0 hover:bg-transparent"
            ></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border/50">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
