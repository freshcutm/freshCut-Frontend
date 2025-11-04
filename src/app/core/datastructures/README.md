# Estructuras de datos (TypeScript)

Incluye implementaciones didácticas: `ArrayList`, `Stack`, `Queue`, `SinglyLinkedList`, `DoublyLinkedList`, `CircularDoublyLinkedList` y `BinarySearchTree`.

## Uso rápido

```ts
import { ArrayList, Stack, Queue, SinglyLinkedList, DoublyLinkedList, CircularDoublyLinkedList, BinarySearchTree } from './index';

// ArrayList
const arr = new ArrayList<number>();
arr.push(10); arr.insertAt(0, 5); // [5, 10]

// Stack
const st = new Stack<string>();
st.push('A'); st.push('B'); st.pop();

// Queue
const q = new Queue<number>();
q.enqueue(1); q.enqueue(2); q.dequeue();

// Singly Linked List
const sll = new SinglyLinkedList<number>();
sll.append(1); sll.prepend(0); sll.removeAt(1);

// Doubly Linked List
const dll = new DoublyLinkedList<number>();
dll.append(1); dll.prepend(0); dll.remove(1);

// Circular Doubly Linked List
const cdll = new CircularDoublyLinkedList<number>();
cdll.append(1); cdll.prepend(0);

// Binary Search Tree
const bst = new BinarySearchTree<number>();
bst.insert(8); bst.insert(3); bst.insert(10);
const inorder = bst.inOrder(); // [3, 8, 10]
```

Notas:
- Son implementaciones puras de TS, sin dependencias de Angular.
- Pueden moverse a `shared/` o `core/` según convenga.
- Para tipos complejos en `BinarySearchTree`, pasa un comparador `(a,b) => number`.