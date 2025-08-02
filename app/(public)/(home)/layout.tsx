'use client'
import ChatFloatButton from '@/components/button/ButtonChat'
import Footer from '@/components/layout/MainLayout/Footer'
import Header from '@/components/layout/MainLayout/Header'
import TanstackProvider from '@/components/provider/TanstackProvider'
import { AuthProvider } from '@/context/auth-provider'
import { useAuthContext } from '@/context/auth-provider'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Định nghĩa rõ kiểu role
type Role = 'admin' | 'driver' | 'customer'

// Các trang công khai không cần đăng nhập
const publicRoutes = [
  '/',
  '/contact',
  '/about',
  '/privacy',
  '/privacypolicy',
  '/terms',
]

// Quyền truy cập cho các vai trò
const accessControl: Record<Role, string[]> = {
  admin: [],
  driver: [
    '/driverpass',
    '/registeratrip',
    '/tripmanage',
    '/chat',
    '/messages',
    '/historybooking',
    '/booking',
    '/notifications',
    '/profile',
    '/rating',
    '/terms',
  ],
  customer: [
    '/chat',
    '/messages',
    '/historybooking',
    '/booking',
    '/notifications',
    '/profile',
    '/rating',
  ],
}

function Homelayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, isLoading } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    // Cho phép truy cập các trang công khai
    if (publicRoutes.includes(pathname)) {
      return
    }

    const role = user?.role as Role | undefined
    if (!role) {
      router.push('/sign-in')
      return
    }

    const isAllowed = accessControl[role]?.some(
      (route) =>
        pathname.startsWith(route) ||
        new RegExp(`^${route.replace('[id]', '[^/]+')}$`).test(pathname)
    )

    if (!isAllowed) {
      router.push('/')
    }
  }, [user, isLoading, router, pathname])

  if (isLoading) {
    return null
  }

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
  )
}

export default Homelayout
