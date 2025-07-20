export interface ISchedule {
  add(id: string, t: number, task: () => void): void;
  remove(id: string): void;
}

export class Schedule implements ISchedule {
  private tasks: Map<string, NodeJS.Timeout> = new Map();

  add(id: string, t: number, task: () => void): void {
    console.log(`[Schedule] Adding task: ${id}, interval: ${t}ms`);
    if (this.tasks.has(id)) {
      throw new Error(`Task with id ${id} already exists.`);
    }
    const timeOutId = setTimeout(() => {
      console.log(`[Schedule] Running task: ${id}`);
      task();
      this.tasks.delete(id);
    }, t);
    this.tasks.set(id, timeOutId);
  }

  remove(id: string): void {
    console.log(`[Schedule] Removing task: ${id}`);
    if (!this.tasks.has(id)) {
      throw new Error(`Task with id ${id} does not exist.`);
    }
    const timeOutId = this.tasks.get(id);
    if (timeOutId !== undefined) {
      clearTimeout(timeOutId);
      this.tasks.delete(id);
    }
  }
}
