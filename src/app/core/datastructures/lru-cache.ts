// LRU Cache (TypeScript) — estructura de datos utilizada en el proyecto
// Implementación sencilla con lista doble y mapa para acceso O(1)

type Node<K, V> = {
  key: K;
  value: V;
  prev: Node<K, V> | null;
  next: Node<K, V> | null;
};

export class LRUCache<K, V> {
  private capacity: number;
  private map = new Map<K, Node<K, V>>();
  private head: Node<K, V> | null = null; // más reciente
  private tail: Node<K, V> | null = null; // menos reciente

  constructor(capacity: number = 50) {
    if (capacity <= 0) throw new Error('LRUCache capacity must be > 0');
    this.capacity = capacity;
  }

  has(key: K): boolean { return this.map.has(key); }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.moveToHead(node);
    return node.value;
  }

  set(key: K, value: V): void {
    let node = this.map.get(key);
    if (node) {
      node.value = value;
      this.moveToHead(node);
      return;
    }
    node = { key, value, prev: null, next: null };
    this.map.set(key, node);
    this.addToHead(node);
    if (this.map.size > this.capacity) this.evictTail();
  }

  private addToHead(node: Node<K, V>) {
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  private moveToHead(node: Node<K, V>) {
    if (node === this.head) return;
    // desconectar
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.tail) this.tail = node.prev;
    // conectar al inicio
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
  }

  private evictTail() {
    const t = this.tail;
    if (!t) return;
    if (t.prev) t.prev.next = null;
    this.tail = t.prev;
    if (t === this.head) this.head = null;
    this.map.delete(t.key);
  }
}