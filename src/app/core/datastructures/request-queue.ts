export type Task<T> = () => Promise<T>;

// Cola FIFO para serializar tareas asíncronas (estructura de datos aplicada)
export class RequestQueue {
  private queue: Task<any>[] = [];
  private processing = false;

  enqueue<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const wrapped = async () => {
        try {
          const res = await task();
          resolve(res);
        } catch (e) {
          reject(e);
        }
      };
      this.queue.push(wrapped);
      this.run();
    });
  }

  private async run(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const next = this.queue.shift()!;
        await next();
      }
    } finally {
      this.processing = false;
    }
  }
}