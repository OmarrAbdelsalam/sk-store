import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const getCourseSpecId = () => {
  const id = localStorage.getItem("courseSpecId");
  if (!id) throw new Error("courseSpecId not found in localStorage");
  return parseInt(id, 10);
};

export const getCourseKey = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("courseKey"); // ❌ ما نرميش Error
};
