'use client'
import React, { useEffect, useState } from 'react'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AdminLayout/AppSlidbar'
import TanstackProvider from '@/components/provider/TanstackProvider' 
import { Toaster } from 'sonner'
import { useAuthContext } from '@/context/auth-provider'
import { useRouter } from 'next/navigation'

function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const { user } = useAuthContext()
  const [isCheckingRole, setIsCheckingRole] = useState(true)

  useEffect(() => {
    if (user) {
      if (user.role !== 'admin') {
        router.push('/')
      } else {
        setIsCheckingRole(false)
      }
    } else {
      const timer = setTimeout(() => {
        setIsCheckingRole(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, router])

  if (isCheckingRole) {
    return (
      <div className="flex h-screen w-full">
        {/* Sidebar skeleton */}
        <div className="w-64 border-r shadow border-border/50 p-4 flex flex-col gap-4">
          <div className="h-10 w-40 bg-gray-200 animate-pulse rounded" />
          <div className="flex-1 space-y-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-10 w-full bg-gray-200 animate-pulse rounded"
              />
            ))}
          </div>
          <div className="flex items-center gap-2 p-2 border-t border-border/50">
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full" />
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 p-4">
          <div className="h-8 w-8 bg-gray-200 animate-pulse rounded mb-4" />
          <div className="space-y-4">
            <div className="h-12 w-3/4 bg-gray-200 animate-pulse rounded" />
            <div className="h-12 w-1/2 bg-gray-200 animate-pulse rounded" />
            <div className="h-64 w-full bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <TanstackProvider>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
              <SidebarTrigger />
              {children}
            </div>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </TanstackProvider>
  )
}

export default AdminLayout
