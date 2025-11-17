export class UndoStack<T> {
  private items: T[] = [];
  constructor(private readonly capacity: number = 50) {}
  push(item: T): void {
    this.items.push(item);
    if (this.items.length > this.capacity) this.items.shift();
  }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
  get size(): number { return this.items.length; }
  clear(): void { this.items = []; }
}