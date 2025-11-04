// Lista circular doblemente enlazada
export class CircularDoublyNode<T> {
  constructor(
    public value: T,
    public prev: CircularDoublyNode<T> | null = null,
    public next: CircularDoublyNode<T> | null = null
  ) {}
}

export class CircularDoublyLinkedList<T> implements Iterable<T> {
  private head: CircularDoublyNode<T> | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  append(value: T): void {
    const node = new CircularDoublyNode(value);
    if (!this.head) {
      node.next = node.prev = node;
      this.head = node;
    } else {
      const tail = this.head.prev as CircularDoublyNode<T>;
      node.next = this.head;
      node.prev = tail;
      tail.next = node;
      this.head.prev = node;
    }
    this._size++;
  }

  prepend(value: T): void {
    this.append(value);
    this.head = this.head?.prev || null; // el nuevo es el previo del head anterior
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) throw new RangeError('index out of range');
    if (index === 0) return this.prepend(value);
    if (index === this._size) return this.append(value);

    let cur = this.head as CircularDoublyNode<T>;
    for (let i = 0; i < index; i++) cur = cur.next as CircularDoublyNode<T>;
    const node = new CircularDoublyNode(value, cur.prev, cur);
    (cur.prev as CircularDoublyNode<T>).next = node;
    cur.prev = node;
    this._size++;
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) throw new RangeError('index out of range');
    const value = this.nodeAt(index).value;
    this.unlinkAt(index);
    return value;
  }

  private nodeAt(index: number): CircularDoublyNode<T> {
    let cur = this.head as CircularDoublyNode<T>;
    for (let i = 0; i < index; i++) cur = cur.next as CircularDoublyNode<T>;
    return cur;
  }

  private unlinkAt(index: number): void {
    const cur = this.nodeAt(index);
    if (this._size === 1) {
      this.head = null;
    } else {
      (cur.prev as CircularDoublyNode<T>).next = cur.next;
      (cur.next as CircularDoublyNode<T>).prev = cur.prev;
      if (cur === this.head) this.head = cur.next;
    }
    this._size--;
  }

  toArrayForward(): T[] {
    const out: T[] = [];
    if (!this.head) return out;
    let cur = this.head;
    for (let i = 0; i < this._size; i++) {
      out.push(cur.value);
      cur = cur.next as CircularDoublyNode<T>;
    }
    return out;
  }

  toArrayBackward(): T[] {
    const out: T[] = [];
    if (!this.head) return out;
    let cur = this.head.prev as CircularDoublyNode<T>;
    for (let i = 0; i < this._size; i++) {
      out.push(cur.value);
      cur = cur.prev as CircularDoublyNode<T>;
    }
    return out;
  }

  [Symbol.iterator](): Iterator<T> {
    let i = 0;
    let cur = this.head as CircularDoublyNode<T> | null;
    return {
      next: (): IteratorResult<T> => {
        if (!cur || i >= this._size) return { value: undefined as unknown as T, done: true };
        const v = cur.value;
        cur = cur.next;
        i++;
        return { value: v, done: false };
      },
    };
  }
}