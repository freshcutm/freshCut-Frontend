// Lista doblemente enlazada (Doubly Linked List)
export class DoublyLinkedListNode<T> {
  constructor(
    public value: T,
    public prev: DoublyLinkedListNode<T> | null = null,
    public next: DoublyLinkedListNode<T> | null = null
  ) {}
}

export class DoublyLinkedList<T> implements Iterable<T> {
  private head: DoublyLinkedListNode<T> | null = null;
  private tail: DoublyLinkedListNode<T> | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  prepend(value: T): void {
    const node = new DoublyLinkedListNode(value, null, this.head);
    if (this.head) this.head.prev = node; else this.tail = node;
    this.head = node;
    this._size++;
  }

  append(value: T): void {
    const node = new DoublyLinkedListNode(value, this.tail, null);
    if (this.tail) this.tail.next = node; else this.head = node;
    this.tail = node;
    this._size++;
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) throw new RangeError('index out of range');
    if (index === 0) return this.prepend(value);
    if (index === this._size) return this.append(value);

    let cur = this.head as DoublyLinkedListNode<T>;
    for (let i = 0; i < index; i++) cur = cur.next as DoublyLinkedListNode<T>;
    const node = new DoublyLinkedListNode(value, cur.prev, cur);
    (cur.prev as DoublyLinkedListNode<T>).next = node;
    cur.prev = node;
    this._size++;
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) throw new RangeError('index out of range');
    let cur = this.head as DoublyLinkedListNode<T>;
    for (let i = 0; i < index; i++) cur = cur.next as DoublyLinkedListNode<T>;

    if (cur.prev) cur.prev.next = cur.next; else this.head = cur.next;
    if (cur.next) cur.next.prev = cur.prev; else this.tail = cur.prev;
    this._size--;
    return cur.value;
  }

  remove(value: T): boolean {
    let cur = this.head;
    while (cur && cur.value !== value) cur = cur.next;
    if (!cur) return false;
    if (cur.prev) cur.prev.next = cur.next; else this.head = cur.next;
    if (cur.next) cur.next.prev = cur.prev; else this.tail = cur.prev;
    this._size--;
    return true;
  }

  toArray(): T[] {
    const out: T[] = [];
    for (const v of this) out.push(v);
    return out;
  }

  toArrayReverse(): T[] {
    const out: T[] = [];
    let cur = this.tail;
    while (cur) {
      out.push(cur.value);
      cur = cur.prev;
    }
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