// Estructura tipo ArrayList con capacidad dinámica
export class ArrayList<T> implements Iterable<T> {
  private data: (T | undefined)[];
  private _size = 0;

  constructor(initialCapacity = 4) {
    const cap = Math.max(1, initialCapacity | 0);
    this.data = new Array(cap);
  }

  get length(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  capacity(): number {
    return this.data.length;
  }

  private resize(newCapacity: number): void {
    const next = new Array(Math.max(1, newCapacity | 0)) as (T | undefined)[];
    for (let i = 0; i < this._size; i++) next[i] = this.data[i];
    this.data = next;
  }

  private ensureCapacity(minCapacity: number): void {
    if (minCapacity <= this.data.length) return;
    let newCap = this.data.length * 2;
    while (newCap < minCapacity) newCap *= 2;
    this.resize(newCap);
  }

  push(value: T): void {
    this.ensureCapacity(this._size + 1);
    this.data[this._size++] = value;
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined;
    const val = this.data[--this._size];
    this.data[this._size] = undefined;
    return val as T | undefined;
  }

  get(index: number): T {
    this.checkIndex(index);
    return this.data[index] as T;
  }

  set(index: number, value: T): void {
    this.checkIndex(index);
    this.data[index] = value;
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) throw new RangeError('index out of range');
    this.ensureCapacity(this._size + 1);
    for (let i = this._size; i > index; i--) this.data[i] = this.data[i - 1];
    this.data[index] = value;
    this._size++;
  }

  removeAt(index: number): T {
    this.checkIndex(index);
    const val = this.data[index] as T;
    for (let i = index; i < this._size - 1; i++) this.data[i] = this.data[i + 1];
    this._size--;
    this.data[this._size] = undefined;
    return val;
  }

  indexOf(value: T, fromIndex = 0): number {
    for (let i = Math.max(0, fromIndex | 0); i < this._size; i++) {
      if (this.data[i] === value) return i;
    }
    return -1;
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) this.data[i] = undefined;
    this._size = 0;
  }

  toArray(): T[] {
    const out = new Array(this._size) as T[];
    for (let i = 0; i < this._size; i++) out[i] = this.data[i] as T;
    return out;
  }

  private checkIndex(index: number): void {
    if (index < 0 || index >= this._size) throw new RangeError('index out of range');
  }

  [Symbol.iterator](): Iterator<T> {
    let i = 0;
    const size = this._size;
    const arr = this.data;
    return {
      next(): IteratorResult<T> {
        if (i < size) return { value: arr[i++] as T, done: false };
        return { value: undefined as unknown as T, done: true };
      },
    };
  }
}