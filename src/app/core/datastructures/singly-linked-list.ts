// Lista simplemente enlazada (Singly Linked List)
export class SinglyLinkedListNode<T> {
  constructor(public value: T, public next: SinglyLinkedListNode<T> | null = null) {}
}

export class SinglyLinkedList<T> implements Iterable<T> {
  private head: SinglyLinkedListNode<T> | null = null;
  private tail: SinglyLinkedListNode<T> | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  prepend(value: T): void {
    const node = new SinglyLinkedListNode(value, this.head);
    this.head = node;
    if (!this.tail) this.tail = node;
    this._size++;
  }

  append(value: T): void {
    const node = new SinglyLinkedListNode(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      (this.tail as SinglyLinkedListNode<T>).next = node;
      this.tail = node;
    }
    this._size++;
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) throw new RangeError('index out of range');
    if (index === 0) return this.prepend(value);
    if (index === this._size) return this.append(value);

    let prev = this.head as SinglyLinkedListNode<T>;
    for (let i = 0; i < index - 1; i++) prev = prev.next as SinglyLinkedListNode<T>;
    const node = new SinglyLinkedListNode(value, prev.next);
    prev.next = node;
    this._size++;
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) throw new RangeError('index out of range');
    if (index === 0) {
      const val = (this.head as SinglyLinkedListNode<T>).value;
      this.head = (this.head as SinglyLinkedListNode<T>).next;
      if (!this.head) this.tail = null;
      this._size--;
      return val;
    }

    let prev = this.head as SinglyLinkedListNode<T>;
    for (let i = 0; i < index - 1; i++) prev = prev.next as SinglyLinkedListNode<T>;
    const target = prev.next as SinglyLinkedListNode<T>;
    prev.next = target.next;
    if (target === this.tail) this.tail = prev;
    this._size--;
    return target.value;
  }

  remove(value: T): boolean {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next;
      if (!this.head) this.tail = null;
      this._size--;
      return true;
    }
    let prev = this.head;
    while (prev.next && prev.next.value !== value) prev = prev.next;
    if (!prev.next) return false;
    if (prev.next === this.tail) this.tail = prev;
    prev.next = prev.next.next;
    this._size--;
    return true;
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    let i = 0;
    for (const v of this) {
      if (predicate(v, i++)) return v;
    }
    return undefined;
  }

  toArray(): T[] {
    const out: T[] = [];
    for (const v of this) out.push(v);
    return out;
  }

  [Symbol.iterator](): Iterator<T> {
    let cur = this.head;
    return {
      next(): IteratorResult<T> {
        if (cur) {
          const v = cur.value;
          cur = cur.next;
          return { value: v, done: false };
        }
        return { value: undefined as unknown as T, done: true };
      },
    };
  }
}