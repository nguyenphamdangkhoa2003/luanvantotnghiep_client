'use client';

import * as React from 'react';
import { useThemeContext } from '@/context/theme-data-provider';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeColors } from '@/types/theme-types';
import { Check } from 'lucide-react';

interface IThemeColor {
  name: string;
  light: string;
  dark: string;
  textColor: string;
}

const availableThemeColors: IThemeColor[] = [
  { name: 'Blue', light: 'bg-blue-600', dark: 'bg-blue-700', textColor: 'text-blue-600' },
  { name: 'Zinc', light: 'bg-zinc-900', dark: 'bg-zinc-700', textColor: 'text-zinc-900' },
  { name: 'Rose', light: 'bg-rose-600', dark: 'bg-rose-700', textColor: 'text-rose-600' },
  { name: 'Green', light: 'bg-green-600', dark: 'bg-green-500', textColor: 'text-green-600' },
  { name: 'Orange', light: 'bg-orange-500', dark: 'bg-orange-700', textColor: 'text-orange-500' },
];

interface ThemeColorToggleProps {
  mobile?: boolean;
}

export function ThemeColorToggle({ mobile = false }: ThemeColorToggleProps) {
  const { themeColor, setThemeColor } = useThemeContext();
  const { theme } = useTheme();

  const selectedColor = availableThemeColors.find((cl) => cl.name === themeColor) || availableThemeColors[1];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-sm',
          'hover:bg-accent/50 rounded-lg cursor-pointer',
          mobile ? 'h-10' : 'h-9'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'rounded-full w-5 h-5 shadow-sm',
              theme === 'light' ? selectedColor.light : selectedColor.dark
            )}
          />
          <span>Màu sắc</span>
        </div>
        {mobile && <span className={selectedColor.textColor}>{selectedColor.name}</span>}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent
          className={cn(
            'w-48 bg-background/95 backdrop-blur-lg border-border/40',
            'rounded-lg shadow-lg p-2'
          )}
        >
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Chọn màu sắc
          </div>
          <DropdownMenuSeparator className="border-border/40" />
          {availableThemeColors.map((item) => (
            <DropdownMenuItem
              key={item.name}
              onClick={() => setThemeColor(item.name as ThemeColors)}
              className={cn(
                'flex items-center justify-between px-3 py-2 text-sm rounded-md',
                'hover:bg-accent/50 cursor-pointer'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'rounded-full w-5 h-5 shadow-sm',
                    theme === 'light' ? item.light : item.dark
                  )}
                />
                <span>{item.name}</span>
              </div>
              {themeColor === item.name && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}