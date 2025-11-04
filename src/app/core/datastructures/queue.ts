// Cola (FIFO) con buffer circular y crecimiento dinámico
export class Queue<T> implements Iterable<T> {
  private buffer: (T | undefined)[];
  private head = 0; // apunta al siguiente elemento a salir
  private tail = 0; // apunta a la siguiente posición libre
  private _size = 0;

  constructor(initialCapacity = 4) {
    const cap = Math.max(1, initialCapacity | 0);
    this.buffer = new Array(cap);
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  capacity(): number {
    return this.buffer.length;
  }

  enqueue(value: T): void {
    if (this._size === this.buffer.length) this.grow();
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) % this.buffer.length;
    this._size++;
  }

  dequeue(): T | undefined {
    if (this._size === 0) return undefined;
    const val = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.buffer.length;
    this._size--;
    return val as T | undefined;
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined;
    return this.buffer[this.head] as T;
  }

  clear(): void {
    for (let i = 0; i < this.buffer.length; i++) this.buffer[i] = undefined;
    this.head = 0;
    this.tail = 0;
    this._size = 0;
  }

  toArray(): T[] {
    const out = new Array(this._size) as T[];
    for (let i = 0; i < this._size; i++) out[i] = this.buffer[(this.head + i) % this.buffer.length] as T;
    return out;
  }

  private grow(): void {
    const newCap = this.buffer.length * 2;
    const next = new Array(newCap) as (T | undefined)[];
    for (let i = 0; i < this._size; i++) next[i] = this.buffer[(this.head + i) % this.buffer.length];
    this.buffer = next;
    this.head = 0;
    this.tail = this._size;
  }

  [Symbol.iterator](): Iterator<T> {
    let i = 0;
    const size = this._size;
    const head = this.head;
    const buf = this.buffer;
    return {
      next(): IteratorResult<T> {
        if (i < size) return { value: buf[(head + i++) % buf.length] as T, done: false };
        return { value: undefined as unknown as T, done: true };
      },
    };
  }
}