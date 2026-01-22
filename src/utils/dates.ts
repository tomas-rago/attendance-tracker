import { format, parse, addDays, subDays, getDay, isWeekend } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Weekday } from '../types';

// Format date for display (e.g., "21/01/2026")
export function formatDateShort(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: es });
}

// Format date for storage (ISO format "2026-01-21")
export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Parse ISO date string to Date
export function parseISODate(dateString: string): Date {
  return parse(dateString, 'yyyy-MM-dd', new Date());
}

// Format date with weekday (e.g., "Lunes 21/01/2026")
export function formatDateWithWeekday(date: Date): string {
  return format(date, "EEEE dd/MM/yyyy", { locale: es });
}

// Format date with weekday short (e.g., "Lunes 26/03") - capitalized
export function formatDateNavbar(date: Date): string {
  const formatted = format(date, "EEEE dd/MM", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Get weekday name in Spanish
export function getWeekdayName(date: Date): string {
  return format(date, 'EEEE', { locale: es });
}

// Navigate to previous day
export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

// Navigate to next day
export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

// Get today's date at midnight
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// Convert JS Date weekday (0=Sunday, 6=Saturday) to our Weekday type (0=Monday, 4=Friday)
export function getScheduleWeekday(date: Date): Weekday | null {
  const jsDay = getDay(date); // 0=Sunday, 1=Monday, ..., 6=Saturday
  if (jsDay === 0 || jsDay === 6) return null; // Weekend
  return (jsDay - 1) as Weekday; // Convert to 0=Monday, 4=Friday
}

// Check if date is a weekday (Monday-Friday)
export function isWeekday(date: Date): boolean {
  return !isWeekend(date);
}

// Format time for display (e.g., "08:00")
export function formatTime(time: string): string {
  return time;
}

// Get current year
export function getCurrentYear(): number {
  return new Date().getFullYear();
}
