'use client';

import * as React from 'react';
import { useThemeContext } from '@/context/theme-data-provider';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeColors } from '@/types/theme-types';

interface IThemeColor {
  name: string;
  light: string;
  dark: string;
}

const availableThemeColors: IThemeColor[] = [
  { name: 'Blue', light: 'bg-blue-600', dark: 'bg-blue-700' },
  { name: 'Zinc', light: 'bg-zinc-900', dark: 'bg-zinc-700' },
  { name: 'Rose', light: 'bg-rose-600', dark: 'bg-rose-700' },
  { name: 'Green', light: 'bg-green-600', dark: 'bg-green-500' },
  { name: 'Orange', light: 'bg-orange-500', dark: 'bg-orange-700' },
];

export function ThemeColorToggle() {
  const { themeColor, setThemeColor } = useThemeContext();
  const [selectedValue, setSelectedValue] = React.useState<IThemeColor>(() => {
    const match = availableThemeColors.find((cl) => cl.name === themeColor);
    return match || availableThemeColors[1];
  });
  const { theme } = useTheme();

  const createDropdownMenuItems = () => {
    return availableThemeColors.map((item) => (
      <DropdownMenuItem
        key={item.name}
        onClick={() => {
          setThemeColor(item.name as React.SetStateAction<ThemeColors>);
          setSelectedValue(item);
        }}
        className={cn(
          'flex items-center gap-3 px-3 py-2 text-sm text-[var(--foreground)]',
          'hover:bg-[var(--muted)] hover:shadow-sm',
          'transition-all duration-200 ease-in-out',
          'cursor-pointer rounded-[var(--radius-sm)]'
        )}
      >
        <div
          className={cn(
            'rounded-full w-5 h-5 shadow-sm transform transition-transform duration-200',
            theme === 'light' ? item.light : item.dark,
            'hover:scale-110'
          )}
        />
        <span>{item.name}</span>
      </DropdownMenuItem>
    ));
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className={cn(
          'flex items-center gap-3 px-3 py-2 w-full text-sm text-[var(--foreground)]',
          'hover:bg-[var(--muted)] rounded-[var(--radius-sm)] hover:shadow-sm',
          'transition-colors duration-200 ease-in-out',
          'ring-offset-transparent focus:ring-transparent'
        )}
      >
        <div
          className={cn(
            'rounded-full w-5 h-5 shadow-sm',
            theme === 'light' ? selectedValue.light : selectedValue.dark
          )}
        />
        <span>{selectedValue.name}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent
          className={cn(
            'min-w-48 bg-[var(--card)] border-[var(--border)] rounded-[var(--radius-md)]',
            'shadow-lg p-2'
          )}
        >
          {createDropdownMenuItems()}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}