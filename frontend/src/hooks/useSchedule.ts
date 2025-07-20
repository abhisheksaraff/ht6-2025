import { useRef } from 'react';
import { Schedule } from '../schedule';

export function useSchedule() {
  const scheduleRef = useRef<Schedule | null>(null);
  if (!scheduleRef.current) {
    scheduleRef.current = new Schedule();
  }
  return scheduleRef.current;
} 