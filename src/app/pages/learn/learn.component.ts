import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProgressService } from '../../core/services/progress.service';

interface StackItem {
  id: number;
  value: string;
  isPeeking?: boolean;
  isPopping?: boolean;
  isUpdated?: boolean;
}

interface QueueItem {
  id: number;
  value: string;
  isPeeking?: boolean;
  isUpdated?: boolean;
}

interface LinkedListNode {
  id: number;
  value: string;
  isHead?: boolean;
  isTail?: boolean;
  isHighlight?: boolean;
}

interface BSTTreeNode {
  val: number;
  left: BSTTreeNode | null;
  right: BSTTreeNode | null;
}

interface BSTNodeVisual {
  val: number;
  x: number;
  y: number;
  level: number;
  isRoot?: boolean;
  highlight?: boolean;
  isFound?: boolean;
  isNew?: boolean;
}

interface BSTEdgeVisual {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active?: boolean;
}

interface HashEntry {
  key: string;
  value: string;
  highlight?: boolean;
  isNew?: boolean;
}

interface GraphVertexVisual {
  id: number;
  x: number;
  y: number;
}

interface GraphEdgeItem {
  id: string;
  u: number;
  v: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active?: boolean;
}

interface QuickSortStep {
  array: number[];
  low: number;
  high: number;
  pivotIdx: number;
  iIdx: number;
  jIdx: number;
  sortedIndices: number[];
  message: string;
}

interface TraversalStep {
  current: number | null;
  frontier: number[];
  visited: number[];
  activeEdges: string[];
  message: string;
}

export type VisualizerCategory = 'data-structures' | 'algorithms';

export type TopicId =
  | 'stack'
  | 'queue'
  | 'linked-list'
  | 'bst'
  | 'min-heap'
  | 'hash-table'
  | 'graph'
  | 'binary-search'
  | 'two-pointers'
  | 'sliding-window'
  | 'bubble-sort'
  | 'quick-sort'
  | 'bfs'
  | 'dfs'
  | 'dp';

const DATA_STRUCTURE_TOPICS: TopicId[] = [
  'stack',
  'queue',
  'linked-list',
  'bst',
  'min-heap',
  'hash-table',
  'graph'
];

const ALGORITHM_TOPICS: TopicId[] = [
  'binary-search',
  'two-pointers',
  'sliding-window',
  'bubble-sort',
  'quick-sort',
  'bfs',
  'dfs',
  'dp'
];

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, BadgeComponent],
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.css']
})
export class LearnComponent implements OnInit, OnDestroy {
  private progressService = inject(ProgressService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  learningPaths = this.progressService.learningPaths;
  Math = Math;

  // View Navigation
  activeMainTab: 'visualizer' | 'curricula' = 'visualizer';
  activeCategory: VisualizerCategory = 'data-structures';
  activeTopic: TopicId = 'stack';
  speedMode: 'slow' | 'normal' | 'fast' = 'normal';

  get stepDelayMs(): number {
    if (this.speedMode === 'slow') return 2100;
    if (this.speedMode === 'fast') return 750;
    return 1350;
  }

  get bstDelayMs(): number {
    if (this.speedMode === 'slow') return 1150;
    if (this.speedMode === 'fast') return 480;
    return 800;
  }

  setSpeedMode(mode: 'slow' | 'normal' | 'fast'): void {
    this.speedMode = mode;
    // Live-adjust any active auto-run interval without resetting progress
    if (this.bsAutoRunning) {
      this.stopAutoBinarySearch();
      this.toggleAutoBinarySearch();
    } else if (this.tpAutoRunning) {
      this.stopAutoTwoPointers();
      this.toggleAutoTwoPointers();
    } else if (this.swAutoRunning) {
      this.stopAutoSlidingWindow();
      this.toggleAutoSlidingWindow();
    } else if (this.bsortAutoRunning) {
      this.stopAutoBubbleSort();
      this.toggleAutoBubbleSort();
    } else if (this.qsortAutoRunning) {
      this.stopAutoQuickSort();
      this.toggleAutoQuickSort();
    } else if (this.bfsAutoRunning) {
      this.stopAutoBFS();
      this.toggleAutoBFS();
    } else if (this.dfsAutoRunning) {
      this.stopAutoDFS();
      this.toggleAutoDFS();
    } else if (this.dpAutoRunning) {
      this.stopAutoDP();
      this.toggleAutoDP();
    }
  }

  // Angular ngFor TrackBy helpers for 60fps DOM reuse & smooth CSS transitions
  trackByIndex(index: number): number {
    return index;
  }

  trackById(_: number, item: { id: string | number }): string | number {
    return item.id;
  }

  trackByNodeVal(_: number, node: BSTNodeVisual): number {
    return node.val;
  }

  formatStatus(text: string): string {
    if (!text) return '';
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const formatSegment = (seg: string): string => {
      return seg
        .replace(/\[([^\]]+)\]/g, '<span class="st-idx">[$1]</span>')
        .replace(/'([^']+)'/g, '<span class="st-val">\'$1\'</span>')
        .replace(/\(([^)]+)\)/g, '<span class="st-val">($1)</span>');
    };

    const formatWithColon = (seg: string): string => {
      const colonIdx = seg.indexOf(':');
      if (colonIdx > 0 && colonIdx < 42) {
        const prefix = formatSegment(seg.slice(0, colonIdx + 1));
        const rest = formatSegment(seg.slice(colonIdx + 1));
        return `<span class="st-prefix">${prefix}</span><span class="st-cmp">${rest}</span>`;
      }
      return formatSegment(seg);
    };

    const arrowParts = escaped.split(/\s*(?:→|-&gt;)\s*/);
    if (arrowParts.length > 1) {
      const left = formatWithColon(arrowParts[0]);
      const rightRaw = arrowParts.slice(1).join(' → ');
      const isPositive = /Swapped|FOUND|Inserted|Placed|complete|PALINDROME|enqueued|Visit/i.test(rightRaw);
      const badgeClass = isPositive ? 'st-action st-action-success' : 'st-action';
      return `${left} <span class="st-arrow">→</span> <span class="${badgeClass}">${formatSegment(rightRaw)}</span>`;
    }

    return formatWithColon(escaped);
  }

  // BST state & animation trackers
  bstActiveEdges = new Set<string>();
  bstHighlightedVals = new Set<number>();
  bstFoundVal: number | null = null;
  bstNewVal: number | null = null;
  bstAnimInterval: any = null;
  bstAnimTimeout: any = null;

  // Algorithm Auto Run states
  bsAutoRunning = false;
  bsInterval: any = null;

  tpAutoRunning = false;
  tpInterval: any = null;

  swAutoRunning = false;
  swInterval: any = null;

  bsortAutoRunning = false;
  bsortInterval: any = null;

  qsortAutoRunning = false;
  qsortInterval: any = null;

  bfsAutoRunning = false;
  bfsInterval: any = null;

  dfsAutoRunning = false;
  dfsInterval: any = null;

  dpAutoRunning = false;
  dpInterval: any = null;

  // ==========================================
  // 1. STACK STATE
  // ==========================================
  maxStackCapacity = 7;
  pushInput = '';
  stackItems: StackItem[] = [
    { id: 1, value: '42' },
    { id: 2, value: '15' },
    { id: 3, value: '88' }
  ];
  stackStatus = "Status: Stack initialized with 3 elements. Current TOP element is '88'.";

  // ==========================================
  // 2. QUEUE STATE
  // ==========================================
  maxQueueCapacity = 6;
  queueInput = '';
  queueItems: QueueItem[] = [
    { id: 10, value: '10' },
    { id: 11, value: '25' },
    { id: 12, value: '70' }
  ];
  queueStatus = "Status: Queue initialized with 3 elements. FRONT is '10', REAR is '70'.";

  // ==========================================
  // 3. LINKED LIST STATE
  // ==========================================
  listInput = '';
  listNodes: LinkedListNode[] = [
    { id: 21, value: '12' },
    { id: 22, value: '45' },
    { id: 23, value: '88' }
  ];
  listStatus = 'Status: Linked list initialized: 12 -> 45 -> 88 -> null.';

  // ==========================================
  // 4. BST STATE
  // ==========================================
  bstInput: string | number = '';
  bstRoot: BSTTreeNode | null = null;
  bstNodes: BSTNodeVisual[] = [];
  bstEdges: BSTEdgeVisual[] = [];
  bstHeight = 3;
  bstStatus = 'Status: Balanced Binary Search Tree with Root = 50. Enter an integer to Insert(x) or Search(x).';

  // ==========================================
  // 5. MIN HEAP STATE
  // ==========================================
  heapInput: string | number = '';
  heapArray: number[] = [8, 15, 12, 24, 30, 19, 28];
  heapNodes: BSTNodeVisual[] = [];
  heapEdges: BSTEdgeVisual[] = [];
  heapHighlightedIdx = new Set<number>();
  heapSwappedIdx = new Set<number>();
  heapStatus = 'Status: Min-Heap initialized. Rootheap[0] = 8 is the minimum element.';

  // ==========================================
  // 6. HASH TABLE STATE
  // ==========================================
  hashBucketCount = 6;
  hashKeyInput = '';
  hashValInput = '';
  hashActiveBucket: number | null = null;
  hashBuckets: HashEntry[][] = [];
  hashTotalKeys = 0;
  hashStatus = 'Status: Hash Table with 6 buckets (Separate Chaining). Enter Key & Value to Put, Get, or Remove.';

  // ==========================================
  // 7. GRAPH STATE
  // ==========================================
  graphVertices: GraphVertexVisual[] = [
    { id: 0, x: 160, y: 75 },
    { id: 1, x: 400, y: 55 },
    { id: 2, x: 640, y: 75 },
    { id: 3, x: 160, y: 245 },
    { id: 4, x: 400, y: 265 },
    { id: 5, x: 640, y: 245 }
  ];
  graphEdgePairs: [number, number][] = [
    [0, 1],
    [0, 3],
    [1, 2],
    [1, 4],
    [2, 5],
    [3, 4],
    [4, 5]
  ];
  graphEdges: GraphEdgeItem[] = [];
  graphUInput: string | number = '';
  graphVInput: string | number = '';
  graphSelectedNode: number | null = null;
  graphHighlightedNodes = new Set<number>();
  graphActiveEdgeIds = new Set<string>();
  graphStatus = 'Status: Undirected Graph with 6 vertices (0..5) and 7 edges. Click any vertex or add/remove edges.';

  // ==========================================
  // 8. BINARY SEARCH STATE
  // ==========================================
  bsArray = [2, 7, 11, 18, 29, 42, 65, 88];
  bsTarget = 42;
  bsLeft = 0;
  bsRight = 7;
  bsMid = 3;
  bsStepIndex = 0;
  bsFound = false;
  bsStatus = 'Status: Searching for target 42 in sorted array [2, 7, 11, 18, 29, 42, 65, 88]. Click Step.';

  // ==========================================
  // 9. TWO POINTERS STATE
  // ==========================================
  tpArray = ['r', 'a', 'c', 'e', 'c', 'a', 'r'];
  tpLeft = 0;
  tpRight = 6;
  tpStatus = "Status: Left pointer at index 0 ('r'), Right pointer at index 6 ('r').";
  tpDone = false;

  // ==========================================
  // 10. SLIDING WINDOW STATE
  // ==========================================
  swArray = [2, 1, 5, 2, 3, 2];
  swWindowSize = 3;
  swStart = 0;
  swCurrentSum = 8;
  swMaxSum = 8;
  swStatus = 'Status: Window of size 3 at indices [0..2]. Sum = 2 + 1 + 5 = 8. Max = 8.';

  // ==========================================
  // 11. BUBBLE SORT STATE
  // ==========================================
  bsortArray = [48, 22, 65, 14, 55, 31, 19];
  bsortI = 0;
  bsortJ = 0;
  bsortSortedBound = 7;
  bsortSwappedInLastStep = false;
  bsortComparisons = 0;
  bsortSwaps = 0;
  bsortDone = false;
  bsortStatus = 'Status: Bubble Sort ready. Click Step Sort or Auto Run to compare adjacent pairs.';

  // ==========================================
  // 12. QUICK SORT STATE
  // ==========================================
  qsortInitial = [38, 16, 52, 24, 63, 11, 45, 29];
  qsortArray = [38, 16, 52, 24, 63, 11, 45, 29];
  qsortSteps: QuickSortStep[] = [];
  qsortStepIdx = 0;
  qsortLow = 0;
  qsortHigh = 7;
  qsortPivotIdx = 7;
  qsortI = 0;
  qsortJ = 0;
  qsortSortedIndices = new Set<number>();
  qsortDone = false;
  qsortStatus = 'Status: Quick Sort ready (Lomuto Partition). Click Step Partition or Auto Run.';

  // ==========================================
  // 13. BFS STATE
  // ==========================================
  bfsStartNode = 0;
  bfsSteps: TraversalStep[] = [];
  bfsStepIdx = 0;
  bfsCurrent: number | null = null;
  bfsQueue: number[] = [];
  bfsVisited: number[] = [];
  bfsActiveEdgeSet = new Set<string>();
  bfsDone = false;
  bfsStatus = 'Status: Breadth-First Search (BFS) ready from source node 0. Click Step BFS or Auto Run.';

  // ==========================================
  // 14. DFS STATE
  // ==========================================
  dfsStartNode = 0;
  dfsSteps: TraversalStep[] = [];
  dfsStepIdx = 0;
  dfsCurrent: number | null = null;
  dfsStack: number[] = [];
  dfsVisited: number[] = [];
  dfsActiveEdgeSet = new Set<string>();
  dfsDone = false;
  dfsStatus = 'Status: Depth-First Search (DFS) ready from source node 0. Click Step DFS or Auto Run.';

  // ==========================================
  // 15. DYNAMIC PROGRAMMING (TABULATION) STATE
  // ==========================================
  dpN = 7;
  dpTable: (number | null)[] = [1, 1, null, null, null, null, null, null];
  dpCurrIdx = 2;
  dpDone = false;
  dpFormulaText = 'Base cases initialized: dp[0] = 1, dp[1] = 1';
  dpStatus = 'Status: 1D DP Tabulation (Climbing Stairs / Fibonacci). Base cases dp[0]=1, dp[1]=1 ready.';

  ngOnInit(): void {
    this.initDefaultBST();
    this.rebuildHeapVisuals();
    this.initDefaultHashTable();
    this.rebuildGraphVisuals();
    this.initQuickSortSteps(this.qsortInitial);
    this.initBFSSteps(0);
    this.initDFSSteps(0);

    const routeTab = this.route.snapshot.data['tab'];
    if (routeTab) {
      this.activeMainTab = routeTab as 'visualizer' | 'curricula';
    } else if (this.router.url.includes('/curricula')) {
      this.activeMainTab = 'curricula';
    } else if (this.router.url.includes('/visualizer')) {
      this.activeMainTab = 'visualizer';
    }

    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'curricula') {
        this.activeMainTab = 'curricula';
      } else if (params['tab'] === 'visualizer') {
        this.activeMainTab = 'visualizer';
      }
      if (params['category']) {
        this.setCategory(params['category'] as VisualizerCategory);
      }
      if (params['topic']) {
        this.setTopic(params['topic'] as TopicId);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAllAutoRuns();
  }

  stopAllAutoRuns(): void {
    this.stopBSTAnimation();
    this.stopAutoBinarySearch();
    this.stopAutoTwoPointers();
    this.stopAutoSlidingWindow();
    this.stopAutoBubbleSort();
    this.stopAutoQuickSort();
    this.stopAutoBFS();
    this.stopAutoDFS();
    this.stopAutoDP();
  }

  setMainTab(tab: 'visualizer' | 'curricula'): void {
    this.activeMainTab = tab;
  }

  setCategory(cat: VisualizerCategory): void {
    this.stopAllAutoRuns();
    this.activeCategory = cat;
    if (cat === 'data-structures') {
      if (!DATA_STRUCTURE_TOPICS.includes(this.activeTopic)) {
        this.activeTopic = 'stack';
      }
    } else {
      if (!ALGORITHM_TOPICS.includes(this.activeTopic)) {
        this.activeTopic = 'binary-search';
      }
    }
  }

  setTopic(id: TopicId): void {
    this.stopAllAutoRuns();
    this.activeTopic = id;
    if (DATA_STRUCTURE_TOPICS.includes(id)) {
      this.activeCategory = 'data-structures';
    } else {
      this.activeCategory = 'algorithms';
    }
  }

  // ==========================================
  // 1. STACK METHODS
  // ==========================================
  pushStack(customVal?: string): void {
    if (this.stackItems.length >= this.maxStackCapacity) {
      this.stackStatus = `Stack Overflow: Container capacity (${this.maxStackCapacity} items) reached.`;
      return;
    }
    const val = (customVal !== undefined ? customVal : this.pushInput.trim()) || String(Math.floor(Math.random() * 90) + 10);
    this.stackItems.push({ id: Date.now() + Math.random(), value: val });
    this.pushInput = '';
    this.stackStatus = `push('${val}'): Element '${val}' appended to TOP (index ${this.stackItems.length - 1}).`;
  }

  popStack(): void {
    if (this.stackItems.length === 0) {
      this.stackStatus = 'Stack Underflow: Stack is empty, cannot pop element.';
      return;
    }
    const popped = this.stackItems[this.stackItems.length - 1];
    popped.isPopping = true;
    setTimeout(() => {
      this.stackItems.pop();
      const newTop = this.stackItems.length > 0 ? `'${this.stackItems[this.stackItems.length - 1].value}'` : 'null';
      this.stackStatus = `pop(): Removed '${popped.value}' from TOP. New TOP is ${newTop}.`;
    }, 180);
  }

  peekStack(): void {
    if (this.stackItems.length === 0) {
      this.stackStatus = 'peek(): Stack is empty.';
      return;
    }
    const topItem = this.stackItems[this.stackItems.length - 1];
    topItem.isPeeking = true;
    this.stackStatus = `peek(): TOP element is '${topItem.value}' (O(1)).`;
    setTimeout(() => { topItem.isPeeking = false; }, 1200);
  }

  updateTopStack(): void {
    if (this.stackItems.length === 0) {
      this.stackStatus = 'Cannot update: Stack is empty.';
      return;
    }
    const val = this.pushInput.trim();
    if (!val) {
      this.stackStatus = 'Please enter a value to update the TOP element.';
      return;
    }
    const topItem = this.stackItems[this.stackItems.length - 1];
    const oldVal = topItem.value;
    topItem.value = val;
    topItem.isUpdated = true;
    this.pushInput = '';
    this.stackStatus = `updateTop('${val}'): Updated TOP element from '${oldVal}' to '${val}'.`;
    setTimeout(() => { topItem.isUpdated = false; }, 1000);
  }

  clearStack(): void {
    this.stackItems = [];
    this.stackStatus = 'clear(): Stack reset to empty.';
  }

  pushRandomStack(): void {
    const randoms = ['42', '15', '99', '7', '108', '24', '63', '80'];
    this.pushStack(randoms[Math.floor(Math.random() * randoms.length)]);
  }

  get stackTopItem(): StackItem | null {
    return this.stackItems.length > 0 ? this.stackItems[this.stackItems.length - 1] : null;
  }

  // ==========================================
  // 2. QUEUE METHODS
  // ==========================================
  enqueue(customVal?: string): void {
    if (this.queueItems.length >= this.maxQueueCapacity) {
      this.queueStatus = `Queue Overflow: Max capacity (${this.maxQueueCapacity} slots) reached.`;
      return;
    }
    const val = (customVal !== undefined ? customVal : this.queueInput.trim()) || String(Math.floor(Math.random() * 80) + 10);
    this.queueItems.push({ id: Date.now() + Math.random(), value: val });
    this.queueInput = '';
    this.queueStatus = `enqueue('${val}'): Appended '${val}' to REAR. Length: ${this.queueItems.length}.`;
  }

  dequeue(): void {
    if (this.queueItems.length === 0) {
      this.queueStatus = 'Queue Underflow: Queue is empty, cannot dequeue.';
      return;
    }
    const removed = this.queueItems.shift();
    const newFront = this.queueItems.length > 0 ? `'${this.queueItems[0].value}'` : 'null';
    this.queueStatus = `dequeue(): Removed '${removed?.value}' from FRONT. New FRONT is ${newFront}.`;
  }

  peekQueue(): void {
    if (this.queueItems.length === 0) {
      this.queueStatus = 'peek(): Queue is empty.';
      return;
    }
    const frontItem = this.queueItems[0];
    frontItem.isPeeking = true;
    this.queueStatus = `peek(): FRONT element is '${frontItem.value}' (O(1)).`;
    setTimeout(() => { frontItem.isPeeking = false; }, 1200);
  }

  updateFrontQueue(): void {
    if (this.queueItems.length === 0) {
      this.queueStatus = 'Cannot update: Queue is empty.';
      return;
    }
    const val = this.queueInput.trim();
    if (!val) {
      this.queueStatus = 'Please enter a value to update the FRONT element.';
      return;
    }
    const frontItem = this.queueItems[0];
    const oldVal = frontItem.value;
    frontItem.value = val;
    frontItem.isUpdated = true;
    this.queueInput = '';
    this.queueStatus = `updateFront('${val}'): Updated FRONT from '${oldVal}' to '${val}'.`;
    setTimeout(() => { frontItem.isUpdated = false; }, 1000);
  }

  clearQueue(): void {
    this.queueItems = [];
    this.queueStatus = 'clear(): Queue reset to empty.';
  }

  // ==========================================
  // 3. LINKED LIST METHODS
  // ==========================================
  insertListHead(): void {
    if (this.listNodes.length >= 6) {
      this.listStatus = 'List max demo limit (6 nodes) reached.';
      return;
    }
    const val = this.listInput.trim() || String(Math.floor(Math.random() * 90) + 10);
    this.listNodes.unshift({ id: Date.now() + Math.random(), value: val });
    this.listInput = '';
    this.listStatus = `insertHead('${val}'): Created node '${val}' as new HEAD (O(1)).`;
  }

  appendListTail(): void {
    if (this.listNodes.length >= 6) {
      this.listStatus = 'List max demo limit (6 nodes) reached.';
      return;
    }
    const val = this.listInput.trim() || String(Math.floor(Math.random() * 90) + 10);
    this.listNodes.push({ id: Date.now() + Math.random(), value: val });
    this.listInput = '';
    this.listStatus = `appendTail('${val}'): Appended node '${val}' to TAIL (O(1)).`;
  }

  deleteListHead(): void {
    if (this.listNodes.length === 0) {
      this.listStatus = 'List is empty, cannot delete HEAD.';
      return;
    }
    const removed = this.listNodes.shift();
    this.listStatus = `deleteHead(): Removed node '${removed?.value}' from HEAD (O(1)).`;
  }

  deleteListTail(): void {
    if (this.listNodes.length === 0) {
      this.listStatus = 'List is empty, cannot delete TAIL.';
      return;
    }
    const removed = this.listNodes.pop();
    this.listStatus = `deleteTail(): Removed node '${removed?.value}' from TAIL.`;
  }

  clearList(): void {
    this.listNodes = [];
    this.listStatus = 'clear(): Linked list reset to empty (HEAD = null).';
  }

  // ==========================================
  // 4. BST METHODS
  // ==========================================
  private initDefaultBST(): void {
    this.bstRoot = {
      val: 50,
      left: {
        val: 30,
        left: { val: 20, left: null, right: null },
        right: { val: 40, left: null, right: null }
      },
      right: {
        val: 70,
        left: { val: 60, left: null, right: null },
        right: { val: 80, left: null, right: null }
      }
    };
    this.clearBSTHighlights();
    this.rebuildBSTVisuals();
  }

  private stopBSTAnimation(): void {
    if (this.bstAnimInterval) {
      clearInterval(this.bstAnimInterval);
      this.bstAnimInterval = null;
    }
    if (this.bstAnimTimeout) {
      clearTimeout(this.bstAnimTimeout);
      this.bstAnimTimeout = null;
    }
  }

  private clearBSTHighlights(): void {
    this.bstActiveEdges.clear();
    this.bstHighlightedVals.clear();
    this.bstFoundVal = null;
    this.bstNewVal = null;
  }

  private rebuildBSTVisuals(): void {
    const nodes: BSTNodeVisual[] = [];
    const edges: BSTEdgeVisual[] = [];
    let maxDepth = 0;

    const traverse = (
      node: BSTTreeNode | null,
      x: number,
      y: number,
      dx: number,
      level: number
    ) => {
      if (!node) return;
      if (level > maxDepth) maxDepth = level;

      nodes.push({
        val: node.val,
        x,
        y,
        level,
        isRoot: level === 0,
        highlight: this.bstHighlightedVals.has(node.val),
        isFound: this.bstFoundVal === node.val,
        isNew: this.bstNewVal === node.val
      });

      const nextY = y + 76;
      const nextDx = dx / 2;

      if (node.left) {
        const leftX = x - dx;
        const edgeId = `${node.val}-${node.left.val}`;
        edges.push({
          id: edgeId,
          x1: x,
          y1: y,
          x2: leftX,
          y2: nextY,
          active: this.bstActiveEdges.has(edgeId)
        });
        traverse(node.left, leftX, nextY, nextDx, level + 1);
      }

      if (node.right) {
        const rightX = x + dx;
        const edgeId = `${node.val}-${node.right.val}`;
        edges.push({
          id: edgeId,
          x1: x,
          y1: y,
          x2: rightX,
          y2: nextY,
          active: this.bstActiveEdges.has(edgeId)
        });
        traverse(node.right, rightX, nextY, nextDx, level + 1);
      }
    };

    traverse(this.bstRoot, 400, 36, 196, 0);
    this.bstNodes = nodes;
    this.bstEdges = edges;
    this.bstHeight = this.bstRoot ? maxDepth + 1 : 0;
  }

  insertBST(customVal?: number): void {
    const raw =
      customVal !== undefined
        ? String(customVal)
        : String(this.bstInput ?? '').trim();
    const val = parseInt(raw, 10);

    if (isNaN(val)) {
      this.bstStatus = 'Please enter a valid integer (e.g. 25, 35, 65, 90) to insert into the BST.';
      return;
    }
    if (val < -999 || val > 999) {
      this.bstStatus = 'Please enter an integer between -999 and 999.';
      return;
    }

    this.stopBSTAnimation();
    this.clearBSTHighlights();
    this.rebuildBSTVisuals();

    if (!this.bstRoot) {
      this.bstRoot = { val, left: null, right: null };
      this.bstNewVal = val;
      this.bstInput = '';
      this.rebuildBSTVisuals();
      this.bstStatus = `insert(${val}): Tree was empty. Created Root node ${val}.`;
      this.bstAnimTimeout = setTimeout(() => {
        this.clearBSTHighlights();
        this.rebuildBSTVisuals();
      }, 2500);
      return;
    }

    const steps: { nodeVal: number; edgeId?: string; message: string }[] = [];
    let curr: BSTTreeNode | null = this.bstRoot;
    let parent: BSTTreeNode = this.bstRoot;
    let depth = 0;

    while (curr) {
      if (val === curr.val) {
        this.bstHighlightedVals.add(curr.val);
        this.rebuildBSTVisuals();
        this.bstStatus = `insert(${val}): Value ${val} already exists in the BST. Duplicate ignored.`;
        this.bstAnimTimeout = setTimeout(() => {
          this.clearBSTHighlights();
          this.rebuildBSTVisuals();
        }, 2200);
        return;
      }

      parent = curr;
      if (val < curr.val) {
        const nextNode: BSTTreeNode | null = curr.left;
        const edgeId = nextNode ? `${curr.val}-${nextNode.val}` : undefined;
        steps.push({
          nodeVal: curr.val,
          edgeId,
          message: `insert(${val}): ${val} < ${curr.val} → move LEFT${nextNode ? ' to ' + nextNode.val : ' (empty spot)'}`
        });
        curr = nextNode;
      } else {
        const nextNode: BSTTreeNode | null = curr.right;
        const edgeId = nextNode ? `${curr.val}-${nextNode.val}` : undefined;
        steps.push({
          nodeVal: curr.val,
          edgeId,
          message: `insert(${val}): ${val} > ${curr.val} → move RIGHT${nextNode ? ' to ' + nextNode.val : ' (empty spot)'}`
        });
        curr = nextNode;
      }
      depth++;
    }

    if (depth > 4) {
      this.bstStatus = `Cannot insert ${val}: Maximum visual tree depth (5 levels) reached under node ${parent.val}.`;
      return;
    }

    this.bstInput = '';
    let stepIdx = 0;

    this.bstAnimInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        const s = steps[stepIdx];
        this.bstHighlightedVals.add(s.nodeVal);
        if (s.edgeId) {
          this.bstActiveEdges.add(s.edgeId);
        }
        this.bstStatus = s.message;
        this.rebuildBSTVisuals();
        stepIdx++;
      } else {
        this.stopBSTAnimation();
        const newNode: BSTTreeNode = { val, left: null, right: null };
        if (val < parent.val) {
          parent.left = newNode;
        } else {
          parent.right = newNode;
        }
        this.bstActiveEdges.add(`${parent.val}-${val}`);
        this.bstNewVal = val;
        this.rebuildBSTVisuals();
        this.bstStatus = `insert(${val}): Inserted node ${val} as ${val < parent.val ? 'LEFT' : 'RIGHT'} child of ${parent.val}!`;

        this.bstAnimTimeout = setTimeout(() => {
          this.clearBSTHighlights();
          this.rebuildBSTVisuals();
        }, 2800);
      }
    }, this.bstDelayMs);
  }

  insertRandomBST(): void {
    const candidates = [
      10, 25, 35, 45, 55, 65, 75, 90,
      5, 15, 22, 28, 32, 38, 42, 48, 52, 58, 62, 68, 72, 78, 85, 95
    ];
    const existing = new Set(this.bstNodes.map(n => n.val));
    const available = candidates.filter(c => !existing.has(c));
    if (available.length === 0) {
      this.bstStatus = 'All preset leaf positions are filled. Click Reset Tree or enter a custom integer.';
      return;
    }
    const pick = available[Math.floor(Math.random() * available.length)];
    this.insertBST(pick);
  }

  searchBST(customVal?: number): void {
    const raw =
      customVal !== undefined
        ? String(customVal)
        : String(this.bstInput ?? '').trim();
    const val = parseInt(raw, 10);

    if (isNaN(val)) {
      this.bstStatus = 'Please enter an integer in the input box to search (or click a quick search button).';
      return;
    }

    this.stopBSTAnimation();
    this.clearBSTHighlights();
    this.rebuildBSTVisuals();

    if (!this.bstRoot) {
      this.bstStatus = 'BST is empty. Insert nodes first.';
      return;
    }

    const steps: { nodeVal: number; edgeId?: string; message: string }[] = [];
    let curr: BSTTreeNode | null = this.bstRoot;
    let found = false;

    while (curr) {
      if (val === curr.val) {
        steps.push({
          nodeVal: curr.val,
          message: `search(${val}): ${val} == ${curr.val} → Node ${val} FOUND in BST!`
        });
        found = true;
        break;
      } else if (val < curr.val) {
        const nextNode: BSTTreeNode | null = curr.left;
        steps.push({
          nodeVal: curr.val,
          edgeId: nextNode ? `${curr.val}-${nextNode.val}` : undefined,
          message: `search(${val}): ${val} < ${curr.val} → traverse LEFT${nextNode ? ' to ' + nextNode.val : ' (null)'}`
        });
        curr = nextNode;
      } else {
        const nextNode: BSTTreeNode | null = curr.right;
        steps.push({
          nodeVal: curr.val,
          edgeId: nextNode ? `${curr.val}-${nextNode.val}` : undefined,
          message: `search(${val}): ${val} > ${curr.val} → traverse RIGHT${nextNode ? ' to ' + nextNode.val : ' (null)'}`
        });
        curr = nextNode;
      }
    }

    let stepIdx = 0;
    this.bstAnimInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        const s = steps[stepIdx];
        this.bstHighlightedVals.add(s.nodeVal);
        if (s.edgeId) {
          this.bstActiveEdges.add(s.edgeId);
        }
        if (stepIdx === steps.length - 1 && found) {
          this.bstFoundVal = val;
        }
        this.bstStatus = s.message;
        this.rebuildBSTVisuals();
        stepIdx++;
      } else {
        this.stopBSTAnimation();
        if (!found) {
          this.bstStatus = `search(${val}): Reached null branch. Value ${val} NOT found in BST.`;
        }
        this.bstAnimTimeout = setTimeout(() => {
          this.clearBSTHighlights();
          this.rebuildBSTVisuals();
        }, 3000);
      }
    }, this.bstDelayMs);
  }

  resetBST(): void {
    this.stopBSTAnimation();
    this.initDefaultBST();
    this.bstInput = '';
    this.bstStatus = 'Reset: Standard balanced BST (7 nodes) restored.';
  }

  // ==========================================
  // 5. MIN HEAP METHODS
  // ==========================================
  private rebuildHeapVisuals(): void {
    const nodes: BSTNodeVisual[] = [];
    const edges: BSTEdgeVisual[] = [];

    const buildIdx = (idx: number, x: number, y: number, dx: number, level: number) => {
      if (idx >= this.heapArray.length) return;
      nodes.push({
        val: this.heapArray[idx],
        x,
        y,
        level,
        isRoot: idx === 0,
        highlight: this.heapHighlightedIdx.has(idx),
        isNew: this.heapSwappedIdx.has(idx)
      });

      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;
      const nextY = y + 74;
      const nextDx = dx / 2;

      if (leftIdx < this.heapArray.length) {
        const leftX = x - dx;
        edges.push({
          id: `${idx}-${leftIdx}`,
          x1: x,
          y1: y,
          x2: leftX,
          y2: nextY,
          active: this.heapSwappedIdx.has(leftIdx) && this.heapSwappedIdx.has(idx)
        });
        buildIdx(leftIdx, leftX, nextY, nextDx, level + 1);
      }

      if (rightIdx < this.heapArray.length) {
        const rightX = x + dx;
        edges.push({
          id: `${idx}-${rightIdx}`,
          x1: x,
          y1: y,
          x2: rightX,
          y2: nextY,
          active: this.heapSwappedIdx.has(rightIdx) && this.heapSwappedIdx.has(idx)
        });
        buildIdx(rightIdx, rightX, nextY, nextDx, level + 1);
      }
    };

    buildIdx(0, 400, 36, 185, 0);
    this.heapNodes = nodes;
    this.heapEdges = edges;
  }

  insertHeap(customVal?: number): void {
    if (this.heapArray.length >= 15) {
      this.heapStatus = 'Heap capacity (15 nodes / 4 complete levels) reached.';
      return;
    }
    const raw = customVal !== undefined ? String(customVal) : String(this.heapInput ?? '').trim();
    const val = parseInt(raw, 10);
    if (isNaN(val)) {
      this.heapStatus = 'Please enter a valid integer (e.g. 5, 14, 21) to insert into Min-Heap.';
      return;
    }

    this.heapHighlightedIdx.clear();
    this.heapSwappedIdx.clear();
    this.heapArray.push(val);
    this.heapInput = '';

    let i = this.heapArray.length - 1;
    this.heapSwappedIdx.add(i);
    let swaps = 0;

    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heapArray[parent] > this.heapArray[i]) {
        const tmp = this.heapArray[parent];
        this.heapArray[parent] = this.heapArray[i];
        this.heapArray[i] = tmp;
        this.heapSwappedIdx.add(parent);
        i = parent;
        swaps++;
      } else {
        break;
      }
    }

    this.rebuildHeapVisuals();
    this.heapStatus = swaps > 0
      ? `insert(${val}): Appended & bubbled up ${swaps} level(s) to index ${i}. Current Min = ${this.heapArray[0]}.`
      : `insert(${val}): Appended at leaf index ${i} (heap property already satisfied).`;
    setTimeout(() => {
      this.heapSwappedIdx.clear();
      this.rebuildHeapVisuals();
    }, 2200);
  }

  extractMinHeap(): void {
    if (this.heapArray.length === 0) {
      this.heapStatus = 'Heap Underflow: Min-Heap is empty.';
      return;
    }
    this.heapHighlightedIdx.clear();
    this.heapSwappedIdx.clear();

    const minVal = this.heapArray[0];
    const last = this.heapArray.pop()!;
    if (this.heapArray.length > 0) {
      this.heapArray[0] = last;
      let i = 0;
      this.heapSwappedIdx.add(0);
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < this.heapArray.length && this.heapArray[left] < this.heapArray[smallest]) {
          smallest = left;
        }
        if (right < this.heapArray.length && this.heapArray[right] < this.heapArray[smallest]) {
          smallest = right;
        }
        if (smallest !== i) {
          const tmp = this.heapArray[i];
          this.heapArray[i] = this.heapArray[smallest];
          this.heapArray[smallest] = tmp;
          this.heapSwappedIdx.add(smallest);
          i = smallest;
        } else {
          break;
        }
      }
    }

    this.rebuildHeapVisuals();
    this.heapStatus = `extractMin(): Removed minimum ${minVal}. New root minimum is ${this.heapArray[0] ?? 'null'}.`;
    setTimeout(() => {
      this.heapSwappedIdx.clear();
      this.rebuildHeapVisuals();
    }, 2200);
  }

  peekMinHeap(): void {
    if (this.heapArray.length === 0) {
      this.heapStatus = 'peekMin(): Heap is empty.';
      return;
    }
    this.heapHighlightedIdx.clear();
    this.heapHighlightedIdx.add(0);
    this.rebuildHeapVisuals();
    this.heapStatus = `peekMin(): Root heap[0] = ${this.heapArray[0]} in O(1) time.`;
    setTimeout(() => {
      this.heapHighlightedIdx.clear();
      this.rebuildHeapVisuals();
    }, 1800);
  }

  insertRandomHeap(): void {
    const candidates = [3, 6, 9, 11, 14, 17, 21, 26, 33, 40];
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    this.insertHeap(pick);
  }

  resetHeap(): void {
    this.heapArray = [8, 15, 12, 24, 30, 19, 28];
    this.heapHighlightedIdx.clear();
    this.heapSwappedIdx.clear();
    this.rebuildHeapVisuals();
    this.heapStatus = 'Reset: Default 7-element Min-Heap restored.';
  }

  // ==========================================
  // 6. HASH TABLE METHODS
  // ==========================================
  private initDefaultHashTable(): void {
    this.hashBuckets = Array.from({ length: this.hashBucketCount }, () => []);
    const defaults: [string, string][] = [
      ['id', '1042'],
      ['role', 'admin'],
      ['lang', 'ts'],
      ['port', '8080']
    ];
    for (const [k, v] of defaults) {
      const idx = this.computeHash(k);
      this.hashBuckets[idx].push({ key: k, value: v });
    }
    this.updateHashCount();
  }

  private updateHashCount(): void {
    this.hashTotalKeys = this.hashBuckets.reduce((acc, b) => acc + b.length, 0);
  }

  private clearHashHighlights(): void {
    this.hashActiveBucket = null;
    for (const bucket of this.hashBuckets) {
      for (const entry of bucket) {
        entry.highlight = false;
        entry.isNew = false;
      }
    }
  }

  computeHash(key: string): number {
    let sum = 0;
    for (let i = 0; i < key.length; i++) {
      sum += key.charCodeAt(i);
    }
    return sum % this.hashBucketCount;
  }

  putHash(customKey?: string, customVal?: string): void {
    const key = (customKey !== undefined ? customKey : this.hashKeyInput).trim();
    const value = (customVal !== undefined ? customVal : this.hashValInput).trim() || String(Math.floor(Math.random() * 900) + 100);
    if (!key) {
      this.hashStatus = 'Please enter a Key (e.g. "user", "token", "cache") to insert.';
      return;
    }

    this.clearHashHighlights();
    const idx = this.computeHash(key);
    this.hashActiveBucket = idx;
    const bucket = this.hashBuckets[idx];
    const existing = bucket.find(e => e.key === key);

    if (existing) {
      existing.value = value;
      existing.highlight = true;
      this.hashStatus = `put('${key}', '${value}'): hash('${key}') % 6 = ${idx}. Updated existing key '${key}' in Bucket [${idx}].`;
    } else {
      bucket.push({ key, value, isNew: true });
      this.hashStatus = `put('${key}', '${value}'): hash('${key}') % 6 = ${idx}. Appended ('${key}': '${value}') to Bucket [${idx}].`;
    }

    this.hashKeyInput = '';
    this.hashValInput = '';
    this.updateHashCount();
  }

  getHash(customKey?: string): void {
    const key = (customKey !== undefined ? customKey : this.hashKeyInput).trim();
    if (!key) {
      this.hashStatus = 'Please enter a Key in the Key input to look up via get(key).';
      return;
    }
    this.clearHashHighlights();
    const idx = this.computeHash(key);
    this.hashActiveBucket = idx;
    const entry = this.hashBuckets[idx].find(e => e.key === key);
    if (entry) {
      entry.highlight = true;
      this.hashStatus = `get('${key}'): hash('${key}') % 6 = ${idx} → Found '${key}' = '${entry.value}' in O(1) average time!`;
    } else {
      this.hashStatus = `get('${key}'): hash('${key}') % 6 = ${idx} → Key '${key}' not found in Bucket [${idx}].`;
    }
  }

  removeHash(): void {
    const key = this.hashKeyInput.trim();
    if (!key) {
      this.hashStatus = 'Enter a Key in the Key input to remove from the Hash Table.';
      return;
    }
    this.clearHashHighlights();
    const idx = this.computeHash(key);
    this.hashActiveBucket = idx;
    const bucket = this.hashBuckets[idx];
    const pos = bucket.findIndex(e => e.key === key);
    if (pos !== -1) {
      bucket.splice(pos, 1);
      this.hashKeyInput = '';
      this.updateHashCount();
      this.hashStatus = `remove('${key}'): Removed key '${key}' from Bucket [${idx}].`;
    } else {
      this.hashStatus = `remove('${key}'): Key '${key}' not found in Bucket [${idx}].`;
    }
  }

  putRandomHash(): void {
    const pairs: [string, string][] = [
      ['host', 'localhost'],
      ['mode', 'dark'],
      ['tier', 'pro'],
      ['region', 'us-east'],
      ['ttl', '3600'],
      ['auth', 'jwt'],
      ['retry', '3'],
      ['node', 'v20']
    ];
    const pick = pairs[Math.floor(Math.random() * pairs.length)];
    this.putHash(pick[0], pick[1]);
  }

  clearHash(): void {
    this.hashBuckets = Array.from({ length: this.hashBucketCount }, () => []);
    this.hashActiveBucket = null;
    this.updateHashCount();
    this.hashStatus = 'clear(): All 6 hash buckets cleared.';
  }

  // ==========================================
  // 7. GRAPH METHODS
  // ==========================================
  private edgeKey(u: number, v: number): string {
    return u < v ? `${u}-${v}` : `${v}-${u}`;
  }

  private rebuildGraphVisuals(): void {
    this.graphEdges = this.graphEdgePairs.map(([u, v]) => {
      const vu = this.graphVertices[u];
      const vv = this.graphVertices[v];
      const id = this.edgeKey(u, v);
      return {
        id,
        u,
        v,
        x1: vu.x,
        y1: vu.y,
        x2: vv.x,
        y2: vv.y,
        active: this.graphActiveEdgeIds.has(id)
      };
    });
  }

  getNeighbors(u: number): number[] {
    const res: number[] = [];
    for (const [a, b] of this.graphEdgePairs) {
      if (a === u) res.push(b);
      else if (b === u) res.push(a);
    }
    return res.sort((x, y) => x - y);
  }

  selectGraphVertex(u: number): void {
    this.graphSelectedNode = u;
    this.graphHighlightedNodes.clear();
    this.graphActiveEdgeIds.clear();
    this.graphHighlightedNodes.add(u);
    const neighbors = this.getNeighbors(u);
    for (const n of neighbors) {
      this.graphHighlightedNodes.add(n);
      this.graphActiveEdgeIds.add(this.edgeKey(u, n));
    }
    this.rebuildGraphVisuals();
    this.graphStatus = `neighbors(${u}): Vertex ${u} is connected to [${neighbors.join(', ')}] (Degree = ${neighbors.length}).`;
  }

  addGraphEdge(customU?: number, customV?: number): void {
    const u = customU !== undefined ? customU : parseInt(String(this.graphUInput ?? '').trim(), 10);
    const v = customV !== undefined ? customV : parseInt(String(this.graphVInput ?? '').trim(), 10);

    if (isNaN(u) || isNaN(v) || u < 0 || u > 5 || v < 0 || v > 5 || u === v) {
      this.graphStatus = 'Please enter two distinct vertex IDs between 0 and 5 (e.g. u = 0, v = 4).';
      return;
    }

    const key = this.edgeKey(u, v);
    const exists = this.graphEdgePairs.some(([a, b]) => this.edgeKey(a, b) === key);
    if (exists) {
      this.graphStatus = `Edge (${u}, ${v}) already exists in the graph.`;
      return;
    }

    this.graphEdgePairs.push([Math.min(u, v), Math.max(u, v)]);
    this.graphHighlightedNodes.clear();
    this.graphActiveEdgeIds.clear();
    this.graphHighlightedNodes.add(u);
    this.graphHighlightedNodes.add(v);
    this.graphActiveEdgeIds.add(key);
    this.graphUInput = '';
    this.graphVInput = '';
    this.rebuildGraphVisuals();
    this.graphStatus = `addEdge(${u}, ${v}): Connected vertex ${u} and vertex ${v}. Total edges: ${this.graphEdgePairs.length}.`;
  }

  removeGraphEdge(): void {
    const u = parseInt(String(this.graphUInput ?? '').trim(), 10);
    const v = parseInt(String(this.graphVInput ?? '').trim(), 10);
    if (isNaN(u) || isNaN(v)) {
      this.graphStatus = 'Enter vertex IDs u and v (0..5) to remove edge (u, v).';
      return;
    }
    const key = this.edgeKey(u, v);
    const idx = this.graphEdgePairs.findIndex(([a, b]) => this.edgeKey(a, b) === key);
    if (idx === -1) {
      this.graphStatus = `removeEdge(${u}, ${v}): Edge (${u}, ${v}) does not exist.`;
      return;
    }
    this.graphEdgePairs.splice(idx, 1);
    this.graphHighlightedNodes.clear();
    this.graphActiveEdgeIds.clear();
    this.graphUInput = '';
    this.graphVInput = '';
    this.rebuildGraphVisuals();
    this.graphStatus = `removeEdge(${u}, ${v}): Removed undirected edge (${u}, ${v}).`;
  }

  addRandomGraphEdge(): void {
    const allPossible: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 6; j++) {
        const key = this.edgeKey(i, j);
        if (!this.graphEdgePairs.some(([a, b]) => this.edgeKey(a, b) === key)) {
          allPossible.push([i, j]);
        }
      }
    }
    if (allPossible.length === 0) {
      this.graphStatus = 'Graph is already a Complete Graph (K6) with all 15 edges!';
      return;
    }
    const [u, v] = allPossible[Math.floor(Math.random() * allPossible.length)];
    this.addGraphEdge(u, v);
  }

  resetGraph(): void {
    this.graphEdgePairs = [
      [0, 1],
      [0, 3],
      [1, 2],
      [1, 4],
      [2, 5],
      [3, 4],
      [4, 5]
    ];
    this.graphSelectedNode = null;
    this.graphHighlightedNodes.clear();
    this.graphActiveEdgeIds.clear();
    this.rebuildGraphVisuals();
    this.graphStatus = 'Reset: Default 6-vertex, 7-edge undirected graph restored.';
  }

  // ==========================================
  // 8. BINARY SEARCH METHODS
  // ==========================================
  toggleAutoBinarySearch(): void {
    if (this.bsAutoRunning) {
      this.stopAutoBinarySearch();
    } else {
      if (this.bsFound || this.bsLeft > this.bsRight) {
        this.resetBinarySearch(this.bsTarget);
      }
      this.bsAutoRunning = true;
      this.bsInterval = setInterval(() => {
        if (this.bsFound || this.bsLeft > this.bsRight) {
          this.stopAutoBinarySearch();
        } else {
          this.stepBinarySearch();
          if (this.bsFound || this.bsLeft > this.bsRight) {
            this.stopAutoBinarySearch();
          }
        }
      }, this.stepDelayMs);
    }
  }

  stopAutoBinarySearch(): void {
    this.bsAutoRunning = false;
    if (this.bsInterval) {
      clearInterval(this.bsInterval);
      this.bsInterval = null;
    }
  }

  stepBinarySearch(): void {
    if (this.bsFound || this.bsLeft > this.bsRight) {
      this.bsStatus = this.bsFound
        ? `Target ${this.bsTarget} found at index ${this.bsMid}!`
        : `Target ${this.bsTarget} not found in array.`;
      this.stopAutoBinarySearch();
      return;
    }

    this.bsMid = Math.floor((this.bsLeft + this.bsRight) / 2);
    const midVal = this.bsArray[this.bsMid];
    this.bsStepIndex++;

    if (midVal === this.bsTarget) {
      this.bsFound = true;
      this.bsStatus = `Step ${this.bsStepIndex}: arr[mid=${this.bsMid}] == ${this.bsTarget}. MATCH FOUND in O(log N) time!`;
      this.stopAutoBinarySearch();
    } else if (midVal < this.bsTarget) {
      this.bsStatus = `Step ${this.bsStepIndex}: arr[mid=${this.bsMid}] = ${midVal} < ${this.bsTarget}. Discard left half, move Left to ${this.bsMid + 1}.`;
      this.bsLeft = this.bsMid + 1;
    } else {
      this.bsStatus = `Step ${this.bsStepIndex}: arr[mid=${this.bsMid}] = ${midVal} > ${this.bsTarget}. Discard right half, move Right to ${this.bsMid - 1}.`;
      this.bsRight = this.bsMid - 1;
    }
  }

  resetBinarySearch(target = 42): void {
    this.stopAutoBinarySearch();
    this.bsTarget = target;
    this.bsLeft = 0;
    this.bsRight = this.bsArray.length - 1;
    this.bsMid = Math.floor((this.bsLeft + this.bsRight) / 2);
    this.bsStepIndex = 0;
    this.bsFound = false;
    this.bsStatus = `Reset: Searching for target ${target} across range [0..${this.bsArray.length - 1}]. Click Step or Auto Run.`;
  }

  // ==========================================
  // 9. TWO POINTERS METHODS
  // ==========================================
  toggleAutoTwoPointers(): void {
    if (this.tpAutoRunning) {
      this.stopAutoTwoPointers();
    } else {
      if (this.tpDone) {
        this.resetTwoPointers();
      }
      this.tpAutoRunning = true;
      this.tpInterval = setInterval(() => {
        if (this.tpDone) {
          this.stopAutoTwoPointers();
        } else {
          this.stepTwoPointers();
          if (this.tpDone) {
            this.stopAutoTwoPointers();
          }
        }
      }, this.stepDelayMs);
    }
  }

  stopAutoTwoPointers(): void {
    this.tpAutoRunning = false;
    if (this.tpInterval) {
      clearInterval(this.tpInterval);
      this.tpInterval = null;
    }
  }

  stepTwoPointers(): void {
    if (this.tpLeft >= this.tpRight) {
      this.tpDone = true;
      this.tpStatus = `Pointers converged at index ${this.tpLeft}. String 'racecar' is a valid PALINDROME!`;
      this.stopAutoTwoPointers();
      return;
    }
    const leftChar = this.tpArray[this.tpLeft];
    const rightChar = this.tpArray[this.tpRight];

    if (leftChar === rightChar) {
      this.tpLeft++;
      this.tpRight--;
      if (this.tpLeft < this.tpRight) {
        this.tpStatus = `Matched '${leftChar}' == '${rightChar}'. Left -> ${this.tpLeft}, Right -> ${this.tpRight}.`;
      } else {
        this.tpDone = true;
        this.tpStatus = `All boundary characters matched! String 'racecar' is a valid Palindrome (O(N) Time, O(1) Space).`;
        this.stopAutoTwoPointers();
      }
    } else {
      this.tpDone = true;
      this.tpStatus = `Mismatch: '${leftChar}' != '${rightChar}'.`;
      this.stopAutoTwoPointers();
    }
  }

  resetTwoPointers(): void {
    this.stopAutoTwoPointers();
    this.tpLeft = 0;
    this.tpRight = 6;
    this.tpDone = false;
    this.tpStatus = "Initial state: Left pointer at index 0 ('r'), Right pointer at index 6 ('r'). Click Step or Auto Run.";
  }

  // ==========================================
  // 10. SLIDING WINDOW METHODS
  // ==========================================
  toggleAutoSlidingWindow(): void {
    if (this.swAutoRunning) {
      this.stopAutoSlidingWindow();
    } else {
      const maxStart = this.swArray.length - this.swWindowSize;
      if (this.swStart >= maxStart) {
        this.resetSlidingWindow();
      }
      this.swAutoRunning = true;
      this.swInterval = setInterval(() => {
        const endReached = this.swStart >= this.swArray.length - this.swWindowSize;
        if (endReached) {
          this.stopAutoSlidingWindow();
        } else {
          this.stepSlidingWindow();
          if (this.swStart >= this.swArray.length - this.swWindowSize) {
            this.stopAutoSlidingWindow();
          }
        }
      }, this.stepDelayMs);
    }
  }

  stopAutoSlidingWindow(): void {
    this.swAutoRunning = false;
    if (this.swInterval) {
      clearInterval(this.swInterval);
      this.swInterval = null;
    }
  }

  stepSlidingWindow(): void {
    const maxStart = this.swArray.length - this.swWindowSize;
    if (this.swStart >= maxStart) {
      this.swStatus = `Sliding complete! Maximum subarray sum of window size ${this.swWindowSize} is ${this.swMaxSum}.`;
      this.stopAutoSlidingWindow();
      return;
    }
    this.swStart++;
    const end = this.swStart + this.swWindowSize - 1;
    this.swCurrentSum = 0;
    for (let i = this.swStart; i <= end; i++) {
      this.swCurrentSum += this.swArray[i];
    }
    if (this.swCurrentSum > this.swMaxSum) {
      this.swMaxSum = this.swCurrentSum;
    }
    this.swStatus = `Window slid to [${this.swStart}..${end}]. Current Sum = ${this.swCurrentSum}. Max Sum = ${this.swMaxSum}.`;
    if (this.swStart >= maxStart) {
      this.stopAutoSlidingWindow();
    }
  }

  resetSlidingWindow(): void {
    this.stopAutoSlidingWindow();
    this.swStart = 0;
    this.swCurrentSum = 8;
    this.swMaxSum = 8;
    this.swStatus = 'Status: Window of size 3 at indices [0..2]. Sum = 2 + 1 + 5 = 8. Max = 8.';
  }

  // ==========================================
  // 11. BUBBLE SORT METHODS
  // ==========================================
  toggleAutoBubbleSort(): void {
    if (this.bsortAutoRunning) {
      this.stopAutoBubbleSort();
    } else {
      if (this.bsortDone) {
        this.resetBubbleSort();
      }
      this.bsortAutoRunning = true;
      this.bsortInterval = setInterval(() => {
        if (this.bsortDone) {
          this.stopAutoBubbleSort();
        } else {
          this.stepBubbleSort();
          if (this.bsortDone) {
            this.stopAutoBubbleSort();
          }
        }
      }, this.stepDelayMs);
    }
  }

  stopAutoBubbleSort(): void {
    this.bsortAutoRunning = false;
    if (this.bsortInterval) {
      clearInterval(this.bsortInterval);
      this.bsortInterval = null;
    }
  }

  stepBubbleSort(): void {
    const n = this.bsortArray.length;
    if (this.bsortDone || this.bsortI >= n - 1) {
      this.bsortDone = true;
      this.bsortSortedBound = 0;
      this.bsortStatus = `Bubble Sort complete! Array sorted in ascending order after ${this.bsortComparisons} comparisons and ${this.bsortSwaps} swaps.`;
      this.stopAutoBubbleSort();
      return;
    }

    const a = this.bsortArray[this.bsortJ];
    const b = this.bsortArray[this.bsortJ + 1];
    this.bsortComparisons++;

    if (a > b) {
      this.bsortArray[this.bsortJ] = b;
      this.bsortArray[this.bsortJ + 1] = a;
      this.bsortSwaps++;
      this.bsortSwappedInLastStep = true;
      this.bsortStatus = `Compare idx [${this.bsortJ}] & [${this.bsortJ + 1}]: ${a} > ${b} → Swapped (${b}, ${a})!`;
    } else {
      this.bsortSwappedInLastStep = false;
      this.bsortStatus = `Compare idx [${this.bsortJ}] & [${this.bsortJ + 1}]: ${a} <= ${b} → Already in order.`;
    }

    this.bsortJ++;
    if (this.bsortJ >= n - 1 - this.bsortI) {
      this.bsortSortedBound = n - 1 - this.bsortI;
      this.bsortI++;
      this.bsortJ = 0;
      if (this.bsortI >= n - 1) {
        this.bsortDone = true;
        this.bsortSortedBound = 0;
        this.bsortStatus = `Bubble Sort complete! All ${n} elements sorted.`;
        this.stopAutoBubbleSort();
      }
    }
  }

  shuffleBubbleSort(): void {
    this.stopAutoBubbleSort();
    this.bsortArray = Array.from({ length: 7 }, () => Math.floor(Math.random() * 58) + 12);
    this.bsortI = 0;
    this.bsortJ = 0;
    this.bsortSortedBound = this.bsortArray.length;
    this.bsortComparisons = 0;
    this.bsortSwaps = 0;
    this.bsortDone = false;
    this.bsortStatus = 'Shuffled random array. Click Step Sort or Auto Run.';
  }

  resetBubbleSort(): void {
    this.stopAutoBubbleSort();
    this.bsortArray = [48, 22, 65, 14, 55, 31, 19];
    this.bsortI = 0;
    this.bsortJ = 0;
    this.bsortSortedBound = 7;
    this.bsortComparisons = 0;
    this.bsortSwaps = 0;
    this.bsortDone = false;
    this.bsortStatus = 'Reset: Bubble Sort initialized with [48, 22, 65, 14, 55, 31, 19].';
  }

  // ==========================================
  // 12. QUICK SORT METHODS
  // ==========================================
  private initQuickSortSteps(sourceArr: number[]): void {
    const arr = [...sourceArr];
    const steps: QuickSortStep[] = [];
    const sorted = new Set<number>();

    const record = (low: number, high: number, pivotIdx: number, iIdx: number, jIdx: number, message: string) => {
      steps.push({
        array: [...arr],
        low,
        high,
        pivotIdx,
        iIdx,
        jIdx,
        sortedIndices: Array.from(sorted),
        message
      });
    };

    const quickSortRec = (low: number, high: number) => {
      if (low > high) return;
      if (low === high) {
        sorted.add(low);
        record(low, high, low, low, low, `Single element arr[${low}] = ${arr[low]} is in its final sorted position.`);
        return;
      }

      const pivot = arr[high];
      let i = low;
      record(low, high, high, i, low, `Partition [${low}..${high}]: Selected pivot = ${pivot} at index ${high}.`);

      for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
          const tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
          record(low, high, high, i, j, `arr[${j}] = ${arr[i]} < pivot (${pivot}) → swap into left partition at index ${i}.`);
          i++;
        } else {
          record(low, high, high, i, j, `arr[${j}] = ${arr[j]} >= pivot (${pivot}) → keep in right partition.`);
        }
      }

      const tmp = arr[i];
      arr[i] = arr[high];
      arr[high] = tmp;
      sorted.add(i);
      record(low, high, i, i, high, `Placed pivot ${pivot} at final sorted index ${i}!`);

      quickSortRec(low, i - 1);
      quickSortRec(i + 1, high);
    };

    quickSortRec(0, arr.length - 1);
    this.qsortSteps = steps;
    this.qsortStepIdx = 0;
    this.qsortArray = [...sourceArr];
    this.qsortLow = 0;
    this.qsortHigh = sourceArr.length - 1;
    this.qsortPivotIdx = sourceArr.length - 1;
    this.qsortI = 0;
    this.qsortJ = 0;
    this.qsortSortedIndices.clear();
    this.qsortDone = false;
  }

  toggleAutoQuickSort(): void {
    if (this.qsortAutoRunning) {
      this.stopAutoQuickSort();
    } else {
      if (this.qsortDone) {
        this.resetQuickSort();
      }
      this.qsortAutoRunning = true;
      this.qsortInterval = setInterval(() => {
        if (this.qsortDone) {
          this.stopAutoQuickSort();
        } else {
          this.stepQuickSort();
          if (this.qsortDone) {
            this.stopAutoQuickSort();
          }
        }
      }, this.stepDelayMs);
    }
  }

  stopAutoQuickSort(): void {
    this.qsortAutoRunning = false;
    if (this.qsortInterval) {
      clearInterval(this.qsortInterval);
      this.qsortInterval = null;
    }
  }

  stepQuickSort(): void {
    if (this.qsortStepIdx >= this.qsortSteps.length) {
      this.qsortDone = true;
      this.qsortSortedIndices = new Set(this.qsortArray.map((_, idx) => idx));
      this.qsortStatus = 'Quick Sort complete! All partitions sorted in O(N log N) time.';
      this.stopAutoQuickSort();
      return;
    }

    const s = this.qsortSteps[this.qsortStepIdx];
    this.qsortArray = [...s.array];
    this.qsortLow = s.low;
    this.qsortHigh = s.high;
    this.qsortPivotIdx = s.pivotIdx;
    this.qsortI = s.iIdx;
    this.qsortJ = s.jIdx;
    this.qsortSortedIndices = new Set(s.sortedIndices);
    this.qsortStatus = s.message;
    this.qsortStepIdx++;

    if (this.qsortStepIdx >= this.qsortSteps.length) {
      this.qsortDone = true;
      this.qsortSortedIndices = new Set(this.qsortArray.map((_, idx) => idx));
      this.stopAutoQuickSort();
    }
  }

  shuffleQuickSort(): void {
    this.stopAutoQuickSort();
    const randomArr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 58) + 10);
    this.initQuickSortSteps(randomArr);
    this.qsortStatus = 'Shuffled new 8-element array for Quick Sort.';
  }

  resetQuickSort(): void {
    this.stopAutoQuickSort();
    this.initQuickSortSteps(this.qsortInitial);
    this.qsortStatus = 'Reset: Quick Sort ready with initial array. Click Step Partition or Auto Run.';
  }

  // ==========================================
  // 13. BFS METHODS
  // ==========================================
  private initBFSSteps(start: number): void {
    this.bfsStartNode = start;
    const steps: TraversalStep[] = [];
    const visited = new Set<number>([start]);
    const queue: number[] = [start];
    const activeEdges: string[] = [];

    steps.push({
      current: start,
      frontier: [...queue],
      visited: Array.from(visited),
      activeEdges: [...activeEdges],
      message: `Initialize BFS: Enqueue start vertex ${start} and mark ${start} as visited.`
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      const neighbors = this.getNeighbors(u);
      const newlyQueued: number[] = [];

      for (const v of neighbors) {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
          newlyQueued.push(v);
          activeEdges.push(this.edgeKey(u, v));
        }
      }

      steps.push({
        current: u,
        frontier: [...queue],
        visited: Array.from(visited),
        activeEdges: [...activeEdges],
        message: newlyQueued.length > 0
          ? `Dequeue ${u}: Discovered unvisited neighbor(s) [${newlyQueued.join(', ')}] → enqueued to FIFO Queue.`
          : `Dequeue ${u}: All neighbors of ${u} are already visited.`
      });
    }

    this.bfsSteps = steps;
    this.bfsStepIdx = 0;
    this.bfsCurrent = null;
    this.bfsQueue = [start];
    this.bfsVisited = [];
    this.bfsActiveEdgeSet.clear();
    this.bfsDone = false;
  }

  toggleAutoBFS(): void {
    if (this.bfsAutoRunning) {
      this.stopAutoBFS();
    } else {
      if (this.bfsDone) {
        this.resetBFS(this.bfsStartNode);
      }
      this.bfsAutoRunning = true;
      this.bfsInterval = setInterval(() => {
        if (this.bfsDone) {
          this.stopAutoBFS();
        } else {
          this.stepBFS();
          if (this.bfsDone) {
            this.stopAutoBFS();
          }
        }
      }, this.stepDelayMs);
    }
  }

  stopAutoBFS(): void {
    this.bfsAutoRunning = false;
    if (this.bfsInterval) {
      clearInterval(this.bfsInterval);
      this.bfsInterval = null;
    }
  }

  stepBFS(): void {
    if (this.bfsStepIdx >= this.bfsSteps.length) {
      this.bfsDone = true;
      this.bfsCurrent = null;
      this.bfsStatus = `BFS Traversal complete! Level-order visited sequence: [${this.bfsVisited.join(' → ')}].`;
      this.stopAutoBFS();
      return;
    }

    const s = this.bfsSteps[this.bfsStepIdx];
    this.bfsCurrent = s.current;
    this.bfsQueue = [...s.frontier];
    this.bfsVisited = [...s.visited];
    this.bfsActiveEdgeSet = new Set(s.activeEdges);
    this.bfsStatus = s.message;
    this.bfsStepIdx++;

    if (this.bfsStepIdx >= this.bfsSteps.length) {
      this.bfsDone = true;
      this.stopAutoBFS();
    }
  }

  resetBFS(start = 0): void {
    this.stopAutoBFS();
    this.initBFSSteps(start);
    this.bfsStatus = `Reset: BFS ready starting from vertex ${start}. Click Step BFS or Auto Run.`;
  }

  // ==========================================
  // 14. DFS METHODS
  // ==========================================
  private initDFSSteps(start: number): void {
    this.dfsStartNode = start;
    const steps: TraversalStep[] = [];
    const visited = new Set<number>();
    const callStack: number[] = [];
    const activeEdges: string[] = [];

    const dfsRec = (u: number, parent: number | null) => {
      visited.add(u);
      callStack.push(u);
      if (parent !== null) {
        activeEdges.push(this.edgeKey(parent, u));
      }
      steps.push({
        current: u,
        frontier: [...callStack],
        visited: Array.from(visited),
        activeEdges: [...activeEdges],
        message: parent === null
          ? `Start DFS(${u}): Push ${u} onto Call Stack and mark visited.`
          : `Traverse edge (${parent} → ${u}): Visit vertex ${u}, push ${u} onto Call Stack.`
      });

      const neighbors = this.getNeighbors(u);
      for (const v of neighbors) {
        if (!visited.has(v)) {
          dfsRec(v, u);
        }
      }

      callStack.pop();
      steps.push({
        current: callStack.length > 0 ? callStack[callStack.length - 1] : null,
        frontier: [...callStack],
        visited: Array.from(visited),
        activeEdges: [...activeEdges],
        message: `Backtrack from vertex ${u}: Pop ${u} from Call Stack.`
      });
    };

    dfsRec(start, null);
    this.dfsSteps = steps;
    this.dfsStepIdx = 0;
    this.dfsCurrent = null;
    this.dfsStack = [];
    this.dfsVisited = [];
    this.dfsActiveEdgeSet.clear();
    this.dfsDone = false;
  }

  toggleAutoDFS(): void {
    if (this.dfsAutoRunning) {
      this.stopAutoDFS();
    } else {
      if (this.dfsDone) {
        this.resetDFS(this.dfsStartNode);
      }
      this.dfsAutoRunning = true;
      this.dfsInterval = setInterval(() => {
        if (this.dfsDone) {
          this.stopAutoDFS();
        } else {
          this.stepDFS();
          if (this.dfsDone) {
            this.stopAutoDFS();
          }
        }
      }, this.stepDelayMs);
    }
  }

  stopAutoDFS(): void {
    this.dfsAutoRunning = false;
    if (this.dfsInterval) {
      clearInterval(this.dfsInterval);
      this.dfsInterval = null;
    }
  }

  stepDFS(): void {
    if (this.dfsStepIdx >= this.dfsSteps.length) {
      this.dfsDone = true;
      this.dfsCurrent = null;
      this.dfsStatus = `DFS Traversal complete! Depth-first visited sequence: [${this.dfsVisited.join(' → ')}].`;
      this.stopAutoDFS();
      return;
    }

    const s = this.dfsSteps[this.dfsStepIdx];
    this.dfsCurrent = s.current;
    this.dfsStack = [...s.frontier];
    this.dfsVisited = [...s.visited];
    this.dfsActiveEdgeSet = new Set(s.activeEdges);
    this.dfsStatus = s.message;
    this.dfsStepIdx++;

    if (this.dfsStepIdx >= this.dfsSteps.length) {
      this.dfsDone = true;
      this.stopAutoDFS();
    }
  }

  resetDFS(start = 0): void {
    this.stopAutoDFS();
    this.initDFSSteps(start);
    this.dfsStatus = `Reset: DFS ready starting from vertex ${start}. Click Step DFS or Auto Run.`;
  }

  // ==========================================
  // 15. DYNAMIC PROGRAMMING METHODS
  // ==========================================
  toggleAutoDP(): void {
    if (this.dpAutoRunning) {
      this.stopAutoDP();
    } else {
      if (this.dpDone) {
        this.resetDP();
      }
      this.dpAutoRunning = true;
      this.dpInterval = setInterval(() => {
        if (this.dpDone) {
          this.stopAutoDP();
        } else {
          this.stepDP();
          if (this.dpDone) {
            this.stopAutoDP();
          }
        }
      }, this.stepDelayMs);
    }
  }

  stopAutoDP(): void {
    this.dpAutoRunning = false;
    if (this.dpInterval) {
      clearInterval(this.dpInterval);
      this.dpInterval = null;
    }
  }

  stepDP(): void {
    if (this.dpCurrIdx > this.dpN) {
      this.dpDone = true;
      this.dpStatus = `Tabulation complete! dp[${this.dpN}] = ${this.dpTable[this.dpN]} computed in O(N) time without recursion overhead.`;
      this.stopAutoDP();
      return;
    }

    const i = this.dpCurrIdx;
    const prev1 = this.dpTable[i - 1] ?? 0;
    const prev2 = this.dpTable[i - 2] ?? 0;
    const val = prev1 + prev2;
    this.dpTable[i] = val;
    this.dpFormulaText = `dp[${i}] = dp[${i - 1}] (${prev1}) + dp[${i - 2}] (${prev2}) = ${val}`;
    this.dpStatus = `Step i = ${i}: Computed ${this.dpFormulaText}.`;
    this.dpCurrIdx++;

    if (this.dpCurrIdx > this.dpN) {
      this.dpDone = true;
      this.stopAutoDP();
    }
  }

  resetDP(): void {
    this.stopAutoDP();
    this.dpTable = [1, 1, null, null, null, null, null, null];
    this.dpCurrIdx = 2;
    this.dpDone = false;
    this.dpFormulaText = 'Base cases initialized: dp[0] = 1, dp[1] = 1';
    this.dpStatus = 'Reset: 1D DP Tabulation table initialized with base cases dp[0] = 1, dp[1] = 1.';
  }
}
