import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Backend money fields are stored in kobo (Paystack units). Convert for display. */
export function moneyInNaira(amount?: number | null): number {
  return Math.round((amount ?? 0) / 100);
}
