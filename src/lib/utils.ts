import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Constructor<T> = new (...args: any[]) => T;

export function init<T>(clazz: Constructor<T>, ...args: any[]) {
  return new clazz(args);
}

export function fake<T>(data: T) {
  return () => data;
}

export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res: Response = await fetch(dataUrl);
  const blob: Blob = await res.blob();
  return new File([blob], fileName, { type: 'image/png' });
}