// Árbol de Búsqueda Binaria (BST) genérico con comparador
export class BSTNode<T> {
  constructor(
    public value: T,
    public left: BSTNode<T> | null = null,
    public right: BSTNode<T> | null = null
  ) {}
}

export type Comparator<T> = (a: T, b: T) => number;

function defaultCompare<T>(a: T, b: T): number {
  // Comparador básico para números y strings
  if (a === b) return 0;
  // @ts-expect-error comparaciones simples
  return a < b ? -1 : 1;
}

export class BinarySearchTree<T> implements Iterable<T> {
  private root: BSTNode<T> | null = null;
  private _size = 0;
  constructor(private readonly compare: Comparator<T> = defaultCompare<T>) {}

  get size(): number { return this._size; }
  isEmpty(): boolean { return this._size === 0; }

  insert(value: T): void {
    const node = new BSTNode(value);
    if (!this.root) { this.root = node; this._size++; return; }
    let cur = this.root;
    while (true) {
      const cmp = this.compare(value, cur.value);
      if (cmp < 0) {
        if (!cur.left) { cur.left = node; this._size++; return; }
        cur = cur.left;
      } else if (cmp > 0) {
        if (!cur.right) { cur.right = node; this._size++; return; }
        cur = cur.right;
      } else {
        // duplicados: sobreescribimos o ignoramos; aquí ignoramos
        return;
      }
    }
  }

  contains(value: T): boolean {
    let cur = this.root;
    while (cur) {
      const cmp = this.compare(value, cur.value);
      if (cmp === 0) return true;
      cur = cmp < 0 ? cur.left : cur.right;
    }
    return false;
  }

  min(): T | undefined {
    if (!this.root) return undefined;
    let cur = this.root;
    while (cur.left) cur = cur.left;
    return cur.value;
  }

  max(): T | undefined {
    if (!this.root) return undefined;
    let cur = this.root;
    while (cur.right) cur = cur.right;
    return cur.value;
  }

  remove(value: T): boolean {
    const res = this.removeNode(this.root, value);
    if (res.removed) this._size--;
    this.root = res.node;
    return res.removed;
  }

  private removeNode(node: BSTNode<T> | null, value: T): { node: BSTNode<T> | null; removed: boolean } {
    if (!node) return { node: null, removed: false };
    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      const r = this.removeNode(node.left, value);
      node.left = r.node; return { node, removed: r.removed };
    }
    if (cmp > 0) {
      const r = this.removeNode(node.right, value);
      node.right = r.node; return { node, removed: r.removed };
    }
    // encontrado
    if (!node.left) return { node: node.right, removed: true };
    if (!node.right) return { node: node.left, removed: true };
    // dos hijos: reemplazar por sucesor (mínimo del subárbol derecho)
    let sParent = node;
    let succ = node.right;
    while (succ && succ.left) { sParent = succ; succ = succ.left; }
    node.value = (succ as BSTNode<T>).value;
    if (sParent.left === succ) sParent.left = succ!.right; else sParent.right = succ!.right;
    return { node, removed: true };
  }

  // Recorridos
  inOrder(): T[] { const out: T[] = []; this.traverseInOrder(this.root, out); return out; }
  private traverseInOrder(node: BSTNode<T> | null, out: T[]): void {
    if (!node) return; this.traverseInOrder(node.left, out); out.push(node.value); this.traverseInOrder(node.right, out);
  }

  preOrder(): T[] { const out: T[] = []; this.traversePreOrder(this.root, out); return out; }
  private traversePreOrder(node: BSTNode<T> | null, out: T[]): void {
    if (!node) return; out.push(node.value); this.traversePreOrder(node.left, out); this.traversePreOrder(node.right, out);
  }

  postOrder(): T[] { const out: T[] = []; this.traversePostOrder(this.root, out); return out; }
  private traversePostOrder(node: BSTNode<T> | null, out: T[]): void {
    if (!node) return; this.traversePostOrder(node.left, out); this.traversePostOrder(node.right, out); out.push(node.value);
  }

  levelOrder(): T[] {
    const out: T[] = [];
    const q: (BSTNode<T> | null)[] = [];
    if (this.root) q.push(this.root);
    while (q.length) {
      const n = q.shift()!;
      out.push(n.value);
      if (n.left) q.push(n.left);
      if (n.right) q.push(n.right);
    }
    return out;
  }

  [Symbol.iterator](): Iterator<T> {
    const stack: BSTNode<T>[] = [];
    let cur = this.root;
    return {
      next: (): IteratorResult<T> => {
        while (cur) { stack.push(cur); cur = cur.left; }
        const top = stack.pop();
        if (!top) return { value: undefined as unknown as T, done: true };
        const val = top.value; cur = top.right; return { value: val, done: false };
      },
    };
  }
}