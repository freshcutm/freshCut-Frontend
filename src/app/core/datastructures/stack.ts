// Pila (LIFO) basada en ArrayList
import { ArrayList } from './array-list';

export class Stack<T> implements Iterable<T> {
  private store = new ArrayList<T>(4);

  push(value: T): void {
    this.store.push(value);
  }

  pop(): T | undefined {
    return this.store.pop();
  }

  peek(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.store.get(this.size - 1);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.length;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  toArray(): T[] {
    return this.store.toArray();
  }

  [Symbol.iterator](): Iterator<T> {
    // itera desde el tope hacia abajo
    const arr = this.toArray();
    let i = arr.length - 1;
    return {
      next(): IteratorResult<T> {
        if (i >= 0) return { value: arr[i--], done: false };
        return { value: undefined as unknown as T, done: true };
      },
    };
  }
}