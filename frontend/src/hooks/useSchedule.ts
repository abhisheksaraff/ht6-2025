import { useRef } from "react";
import { Schedule, type ISchedule } from "../schedule";

export function useSchedule(): ISchedule {
  const schedule = useRef(new Schedule()).current;
  return schedule;
}
