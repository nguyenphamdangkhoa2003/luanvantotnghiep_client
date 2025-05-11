'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogIn, Menu, X } from 'lucide-react';
import {
  MdOutlineAdminPanelSettings,
  MdCalendarToday,
  MdAccountCircle,
} from 'react-icons/md';
import { CiMenuKebab } from 'react-icons/ci';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleEnum } from '@/types/enum';
import LogoutDialog from '@/components/dialog/LogoutDialog';
import Logo from '../Logo';
import { ThemeColorToggle } from '@/components/toggle/ThemeColorToggle';
import { ThemeModeToggle } from '@/components/toggle/ThemeModeToggle';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/context/auth-provider';

const Header = () => {
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthContext();

  return (
    <nav
      className={cn(
        'fixed w-full z-20 top-0 start-0 bg-[var(--background)] border-b',
        'border-[var(--border)] shadow-sm'
      )}
    >
      <div className="max-w-screen-xl flex items-center justify-between mx-auto px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-1">
          <Logo
            width="200"
            height="auto"
            className="md:block hidden"
            fill="var(--primary)"
          />
          <Logo
            width="150"
            height="auto"
            className="md:hidden block"
            fill="var(--primary)"
          />
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex space-x-6 text-lg font-medium text-[var(--foreground)]">
          <Link href="/" className="text-primary hover:text-primary/80 transition">
            Trang chủ
          </Link>
          <Link href="/booking" className="text-primary hover:text-primary/80 transition">
            Đặt trước
          </Link>
          <Link href="/contact" className="text-primary hover:text-primary/80 transition">
            Liên hệ
          </Link>
          <Link href="/about" className="text-primary hover:text-primary/80 transition">
            Về chúng tôi
          </Link>
        </div>

        {/* Phần điều khiển */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {!user ? (
            <div className="hidden md:flex items-center gap-2">
              <Button
                className={cn(
                  'bg-[var(--primary)] text-[var(--primary-foreground)]',
                  'hover:bg-[var(--primary)]/90 hover:shadow-md',
                  'transition-all duration-200 ease-in-out',
                  'rounded-[var(--radius-md)] px-3 sm:px-4 py-2 text-sm'
                )}
                variant="default"
                onClick={() => router.push('/sign-in')}
              >
                Đăng nhập
              </Button>
              <Button
                variant="outline"
                className={cn(
                  'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
                  'border-[var(--border)] hover:bg-[var(--muted)] hover:shadow-md',
                  'transition-all duration-200 ease-in-out',
                  'rounded-[var(--radius-md)] px-3 sm:px-4 py-2 text-sm'
                )}
                onClick={() => router.push('/sign-up')}
              >
                Đăng ký
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    className={cn(
                      'flex items-center gap-2 p-1',
                      'hover:bg-[var(--muted)] hover:shadow-md',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-md)]'
                    )}
                  >
                    <div
                      className={cn(
                        'h-8 sm:h-9 w-8 sm:w-9 rounded-full bg-[var(--muted)]',
                        'flex items-center justify-center shadow-sm'
                      )}
                    >
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          width={36}
                          height={36}
                          alt="Avatar"
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {user?.name?.split(' ')?.[0]?.charAt(0)}
                          {user?.name?.split(' ')?.[1]?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className=" flex-1 text-left text-sm leading-tight hidden lg:grid">
                      <span className="truncate font-semibold text-[var(--foreground)]">
                        {user?.name}
                      </span>
                      <span className="truncate text-xs text-[var(--muted-foreground)]">
                        {user?.email}
                      </span>
                    </div>
                    <span className="ml-auto lg:block hidden size-4 text-[var(--muted-foreground)]">
                      <CiMenuKebab />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    'w-[--radix-dropdown-menu-trigger-width] min-w-52 sm:min-w-56',
                    'bg-[var(--card)] border-[var(--border)] rounded-[var(--radius-md)]',
                    'shadow-lg'
                  )}
                  side="bottom"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                      'hover:bg-[var(--muted)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                    )}
                  >
                    <MdAccountCircle size={16} />
                    <span>Hồ sơ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/historybooking')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                      'hover:bg-[var(--muted)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                    )}
                  >
                    <MdCalendarToday size={16} />
                    <span>Lịch sử đặt chỗ</span>
                  </DropdownMenuItem>
                  {user.role === RoleEnum.ADMIN && (
                    <DropdownMenuItem
                      onClick={() => router.push('/admin')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                        'hover:bg-[var(--muted)] hover:shadow-sm',
                        'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                      )}
                    >
                      <MdOutlineAdminPanelSettings size={16} />
                      <span>Trang quản trị</span>
                    </DropdownMenuItem>
                  )}
                  <ThemeColorToggle />
                  <DropdownMenuItem
                    onClick={() => setIsLogoutOpen(true)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                      'hover:bg-[var(--muted)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                    )}
                  >
                    <LogIn size={16} />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <ThemeModeToggle />
          {/* Hamburger Menu Button */}
          <Button
            onClick={() => setIsOpen(true)}
            className={cn(
              'md:hidden hover:text-[var(--primary)] text-[var(--muted)] hover:bg-[var(--muted)] hover:shadow-md',
              'transition-all duration-200 ease-in-out rounded-[var(--radius-md)] p-2'
            )}
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile & Tablet Menu */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-64 sm:w-72 bg-[var(--card)] shadow-xl',
          'transform transition-transform duration-300 ease-in-out z-50',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsOpen(false)}
            className={cn(
              'text-[var(--primary)] hover:bg-[var(--muted)] hover:shadow-md',
              'transition-all duration-200 ease-in-out rounded-[var(--radius-md)] p-2'
            )}
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col space-y-2 p-6 text-lg font-medium text-[var(--foreground)]">
          <Link
            href="/"
            className={cn(
              'text-primary hover:text-primary/80 hover:bg-[var(--muted)] hover:shadow-sm',
              'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] px-3 py-2'
            )}
            onClick={() => setIsOpen(false)}
          >
            Trang chủ
          </Link>
          <Link
            href="/booking"
            className={cn(
              'text-primary hover:text-primary/80 hover:bg-[var(--muted)] hover:shadow-sm',
              'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] px-3 py-2'
            )}
            onClick={() => setIsOpen(false)}
          >
            Đặt trước
          </Link>
          <Link
            href="/contact"
            className={cn(
              'text-primary hover:text-primary/80 hover:bg-[var(--muted)] hover:shadow-sm',
              'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] px-3 py-2'
            )}
            onClick={() => setIsOpen(false)}
          >
            Liên hệ
          </Link>
          <Link
            href="/about"
            className={cn(
              'text-primary hover:text-primary/80 hover:bg-[var(--muted)] hover:shadow-sm',
              'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] px-3 py-2'
            )}
            onClick={() => setIsOpen(false)}
          >
            Về chúng tôi
          </Link>

          {/* Auth Section for Mobile & Tablet */}
          {!user ? (
            <div className="flex flex-col gap-2 pt-4">
              <Button
                className={cn(
                  'w-full bg-[var(--primary)] text-[var(--primary-foreground)]',
                  'hover:bg-[var(--primary)]/90 hover:shadow-md',
                  'transition-all duration-200 ease-in-out rounded-[var(--radius-md)] py-2 text-sm'
                )}
                onClick={() => {
                  router.push('/sign-in');
                  setIsOpen(false);
                }}
              >
                Đăng nhập
              </Button>
              <Button
                variant="outline"
                className={cn(
                  'w-full bg-[var(--secondary)] text-[var(--secondary-foreground)]',
                  'border-[var(--border)] hover:bg-[var(--muted)] hover:shadow-md',
                  'transition-all duration-200 ease-in-out rounded-[var(--radius-md)] py-2 text-sm'
                )}
                onClick={() => {
                  router.push('/sign-up');
                  setIsOpen(false);
                }}
              >
                Đăng ký
              </Button>
            </div>
          ) : (
            <div className="pt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    className={cn(
                      'flex items-center gap-2 p-2 w-full justify-start',
                      'hover:bg-[var(--muted)] hover:shadow-md',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-md)]'
                    )}
                  >
                    <div
                      className={cn(
                        'h-8 sm:h-9 w-8 sm:w-9 rounded-full bg-[var(--muted)]',
                        'flex items-center justify-center shadow-sm'
                      )}
                    >
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          width={36}
                          height={36}
                          alt="Avatar"
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {user?.name?.split(' ')?.[0]?.charAt(0)}
                          {user?.name?.split(' ')?.[1]?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-[var(--foreground)]">
                        {user?.name}
                      </span>
                      <span className="truncate text-xs text-[var(--muted-foreground)]">
                        {user?.email}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    'w-56 sm:w-64 bg-[var(--card)] border-[var(--border)]',
                    'rounded-[var(--radius-md)] shadow-lg p-2'
                  )}
                  side="bottom"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                      'hover:bg-[var(--muted)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                    )}
                  >
                    <MdAccountCircle size={16} />
                    <span>Hồ sơ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/historybooking')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                      'hover:bg-[var(--muted)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                    )}
                  >
                    <MdCalendarToday size={16} />
                    <span>Lịch sử đặt chỗ</span>
                  </DropdownMenuItem>
                  {user.role === RoleEnum.ADMIN && (
                    <DropdownMenuItem
                      onClick={() => router.push('/admin')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                        'hover:bg-[var(--muted)] hover:shadow-sm',
                        'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                      )}
                    >
                      <MdOutlineAdminPanelSettings size={16} />
                      <span>Trang quản trị</span>
                    </DropdownMenuItem>
                  )}
                  <ThemeColorToggle />
                  <DropdownMenuItem
                    onClick={() => setIsLogoutOpen(true)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]',
                      'hover:bg-[var(--muted)] hover:shadow-sm',
                      'transition-all duration-200 ease-in-out rounded-[var(--radius-sm)] cursor-pointer'
                    )}
                  >
                    <LogIn size={16} />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
      <LogoutDialog isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </nav>
  );
};

export default Header;