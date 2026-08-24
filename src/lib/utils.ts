import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DaySchedule, BusinessHour } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts 24hr time string (e.g. "13:00") to 12hr format (e.g. "1:00 PM")
 */
export function formatTime12h(time24: string): string {
  if (!time24) return "";
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return time24;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Computes human-friendly summary hours array from a 7-day schedule
 */
export function computeSummaryHours(schedule: DaySchedule[]): BusinessHour[] {
  if (!schedule || schedule.length === 0) {
    return [
      { day: "Sunday – Thursday", hours: "1:00 PM – 9:00 PM" },
      { day: "Friday – Saturday", hours: "1:00 PM – 10:00 PM" },
    ];
  }

  const formattedSchedule = schedule.map((item) => {
    if (!item.isOpen) {
      return { ...item, formattedText: "Closed" };
    }
    const openStr = formatTime12h(item.openTime);
    const closeStr = formatTime12h(item.closeTime);
    return { ...item, formattedText: `${openStr} – ${closeStr}` };
  });

  const result: BusinessHour[] = [];
  let currentGroup: { days: string[]; hours: string } | null = null;

  for (const dayItem of formattedSchedule) {
    const hoursText = dayItem.formattedText || "Closed";
    if (!currentGroup) {
      currentGroup = { days: [dayItem.day], hours: hoursText };
    } else if (currentGroup.hours === hoursText) {
      currentGroup.days.push(dayItem.day);
    } else {
      const dayLabel =
        currentGroup.days.length === 1
          ? currentGroup.days[0]
          : `${currentGroup.days[0]} – ${currentGroup.days[currentGroup.days.length - 1]}`;
      result.push({ day: dayLabel, hours: currentGroup.hours });
      currentGroup = { days: [dayItem.day], hours: hoursText };
    }
  }

  if (currentGroup) {
    const dayLabel =
      currentGroup.days.length === 1
        ? currentGroup.days[0]
        : `${currentGroup.days[0]} – ${currentGroup.days[currentGroup.days.length - 1]}`;
    result.push({ day: dayLabel, hours: currentGroup.hours });
  }

  return result;
}
