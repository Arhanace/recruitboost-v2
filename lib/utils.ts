import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function titleCase(str: string): string {
  // Only apply if the string is all-uppercase
  if (str !== str.toUpperCase()) return str;
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
