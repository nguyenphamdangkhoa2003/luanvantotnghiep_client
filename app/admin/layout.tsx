import React from 'react';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AdminLayout/AppSlidbar';
import TanstackProvider from '@/components/provider/TanstackProvider';
import { Toaster } from 'sonner';

function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
    );
}

export default AdminLayout;
