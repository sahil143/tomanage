import type { EnergyLevel } from "../todo";

export const WORK_SCHEDULE = {
  workHours: { start: 9, end: 17 },
  weekendDays: [0, 6],
  timeOfDay: {
    morning: { start: 5, end: 12 },
    afternoon: { start: 12, end: 17 },
    evening: { start: 17, end: 21 },
  },
} as const;

export const DEFAULTS: { ENERGY_LEVEL: EnergyLevel } = {
  ENERGY_LEVEL: "medium",
};


