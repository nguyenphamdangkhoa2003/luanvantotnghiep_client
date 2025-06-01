'use client'

import setGlobalColorTheme from '@/lib/theme-colors'
import { ThemeColors, ThemeColorStateParams } from '@/types/theme-types'
import { useTheme } from 'next-themes'
import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext<ThemeColorStateParams>(
  {} as ThemeColorStateParams
)

const availableThemeColors: ThemeColors[] = [
  'Blue',
  'Zinc',
  'Rose',
  'Green',
  'Orange',
] as const

export default function ThemeDataProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [themeColor, setThemeColor] = useState<ThemeColors>('Blue') // Default theme
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = useTheme()

  // Load saved theme color on client-side
  useEffect(() => {
    const getSavedThemeColor = (): ThemeColors => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedColor = window.localStorage.getItem(
            'themeColor'
          ) as ThemeColors
          return availableThemeColors.includes(savedColor) ? savedColor : 'Blue'
        }
        return 'Blue'
      } catch (error) {
        console.warn('Error reading themeColor from localStorage:', error)
        return 'Blue'
      }
    }

    const savedTheme = getSavedThemeColor()
    setThemeColor(savedTheme)
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    if (!availableThemeColors.includes(themeColor)) {
      console.warn(`Invalid themeColor: ${themeColor}, defaulting to Blue`)
      setThemeColor('Blue')
      return
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('themeColor', themeColor)
      }
      setGlobalColorTheme(theme as 'light' | 'dark', themeColor)
    } catch (error) {
      console.warn('Error saving themeColor to localStorage:', error)
    }
  }, [themeColor, theme, isMounted])

  if (!isMounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeDataProvider')
  }
  return context
}
