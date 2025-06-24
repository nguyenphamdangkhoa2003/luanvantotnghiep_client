'use client'

import * as React from 'react'
import { useThemeContext } from '@/context/theme-data-provider'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeColors } from '@/types/theme-types'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface IThemeColor {
  name: string
  light: string
  dark: string
  textColor: string
}

const availableThemeColors: IThemeColor[] = [
  {
    name: 'Blue',
    light: 'bg-blue-600',
    dark: 'bg-blue-700',
    textColor: 'text-blue-600',
  },
  {
    name: 'Zinc',
    light: 'bg-zinc-900',
    dark: 'bg-zinc-700',
    textColor: 'text-zinc-900',
  },
  {
    name: 'Rose',
    light: 'bg-rose-600',
    dark: 'bg-rose-700',
    textColor: 'text-rose-600',
  },
  {
    name: 'Green',
    light: 'bg-green-600',
    dark: 'bg-green-500',
    textColor: 'text-green-600',
  },
  {
    name: 'Orange',
    light: 'bg-orange-500',
    dark: 'bg-orange-700',
    textColor: 'text-orange-500',
  },
]

interface ThemeColorToggleProps {
  mobile?: boolean
}

export function ThemeColorToggle({ mobile = false }: ThemeColorToggleProps) {
  const { themeColor, setThemeColor } = useThemeContext()
  const { theme } = useTheme()

  const selectedColor =
    availableThemeColors.find((cl) => cl.name === themeColor) ||
    availableThemeColors[1]

  return (
    <div className="w-full">
      {/* Desktop: Dropdown Menu (sm and above) */}
      <div className="hidden sm:block">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className={cn(
              'flex items-center justify-between px-4 py-2.5 text-sm text-[var(--foreground)]',
              'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
              'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
              mobile ? 'h-11' : 'h-10'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'rounded-full w-5 h-5 shadow-sm ring-1 ring-[var(--border)]',
                  theme === 'light' ? selectedColor.light : selectedColor.dark
                )}
              />
              <span>Màu sắc</span>
            </div>
            {mobile && (
              <span
                className={cn('text-xs font-medium', selectedColor.textColor)}
              >
                {selectedColor.name}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent
              className={cn(
                'w-56 sm:w-64 bg-[var(--card)] border-[var(--border)]',
                'rounded-xl shadow-lg p-2 transition-all duration-200 ease-in-out'
              )}
            >
              <div className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                Chọn màu sắc
              </div>
              <DropdownMenuSeparator className="my-1 bg-[var(--border)]" />
              {availableThemeColors.map((item) => (
                <DropdownMenuItem
                  key={item.name}
                  onClick={() => setThemeColor(item.name as ThemeColors)}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5 text-sm text-[var(--foreground)]',
                    'hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-sm',
                    'transition-all duration-200 ease-in-out rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'rounded-full w-5 h-5 shadow-sm ring-1 ring-[var(--border)]',
                        theme === 'light' ? item.light : item.dark
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {themeColor === item.name && (
                    <Check className="h-4 w-4 text-[var(--primary-foreground)]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </div>

      {/* Mobile: Color Button Grid (below sm) */}
      <div className="block sm:hidden">
        <div className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
          Chọn màu sắc
        </div>
        <div className="grid grid-cols-5 gap-2 px-4 py-2">
          {availableThemeColors.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="icon"
              onClick={() => setThemeColor(item.name as ThemeColors)}
              className={cn(
                'relative h-5 w-5 rounded-full',
                'transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
                theme === 'light' ? item.light : item.dark
              )}
              aria-label={`Select ${item.name} color`}
            >
              {themeColor === item.name && (
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center',
                    'rounded-lg border-2 border-[var(--primary)]'
                  )}
                >
                  <Check className="h-5 w-5 text-white" />
                </div>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
