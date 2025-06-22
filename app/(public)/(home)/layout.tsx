// import ChatFloatButton from "@/components/ChatFloatButton";
import ChatFloatButton from "@/components/button/ButtonChat";
import Footer from "@/components/layout/MainLayout/Footer";
import Header from "@/components/layout/MainLayout/Header";
import TanstackProvider from "@/components/provider/TanstackProvider";
import { AuthProvider } from "@/context/auth-provider";
import React from "react";

function Homelayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div suppressHydrationWarning>
      <TanstackProvider>
        <AuthProvider>
          <Header />
          <main className="flex-grow mt-10">{children}</main>
          <ChatFloatButton />
          <Footer />
        </AuthProvider>
      </TanstackProvider>
    </div>
  );
}

export default Homelayout;
