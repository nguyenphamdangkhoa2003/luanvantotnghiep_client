'use client'

import setGlobalColorTheme from '@/lib/theme-colors'
import { ThemeColors, ThemeColorStateParams } from '@/types/theme-types'
import { useTheme } from 'next-themes'
import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext<ThemeColorStateParams>(
  {} as ThemeColorStateParams
)

const availableThemeColors = [
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
  const getSavedThemeColor = (): ThemeColors => {
    try {
      const savedColor = localStorage.getItem('themeColor') as ThemeColors
      return availableThemeColors.includes(savedColor) ? savedColor : 'Blue'
    } catch (error) {
      console.warn('Error reading themeColor from localStorage:', error)
      return 'Blue'
    }
  }

  const [themeColor, setThemeColor] = useState<ThemeColors>(
    getSavedThemeColor()
  )
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    if (!availableThemeColors.includes(themeColor)) {
      console.warn(`Invalid themeColor: ${themeColor}, defaulting to Blue`)
      setThemeColor('Blue')
      return
    }
    localStorage.setItem('themeColor', themeColor)
    setGlobalColorTheme(theme as 'light' | 'dark', themeColor)
    setIsMounted(true)
  }, [themeColor, theme])

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
