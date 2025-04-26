// types/theme.ts
export type ThemeColors = "Blue" | "Zinc" | "Rose" | "Green" | "Orange";

export interface IThemeColor {
  name: ThemeColors;
  light: string;
  dark: string;
}

export interface ThemeColorStateParams {
  themeColor: ThemeColors;
  setThemeColor: React.Dispatch<React.SetStateAction<ThemeColors>>;
}