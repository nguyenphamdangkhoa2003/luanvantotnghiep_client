import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import "stream-chat-react/dist/css/v2/index.css";
import "./globals.css";
import QueryProvider from "@/context/query-provider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/provider/ThemeProvider";
import ThemeDataProvider from "@/context/theme-data-provider";
import { AuthProvider } from "@/context/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xe Share",
  description: "Ứng dụng đặt xe đi chung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased flex
          flex-col`}
      >
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <ThemeDataProvider>{children}</ThemeDataProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
