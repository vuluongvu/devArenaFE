import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProgressService } from '../../core/services/progress.service';
import { LearningPath } from '../../core/models/progress.model';

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

export type VisualizerCategory = 'data-structures' | 'algorithms';

export type TopicId =
  | 'stack'
  | 'queue'
  | 'linked-list'
  | 'bst'
  | 'binary-search'
  | 'two-pointers'
  | 'sliding-window';

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
  listStatus = "Status: Linked list initialized: 12 -> 45 -> 88 -> null.";

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
  // 5. BINARY SEARCH STATE
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
  // 6. TWO POINTERS STATE
  // ==========================================
  tpArray = ['r', 'a', 'c', 'e', 'c', 'a', 'r'];
  tpLeft = 0;
  tpRight = 6;
  tpStatus = "Status: Left pointer at index 0 ('r'), Right pointer at index 6 ('r').";
  tpDone = false;

  // ==========================================
  // 7. SLIDING WINDOW STATE
  // ==========================================
  swArray = [2, 1, 5, 2, 3, 2];
  swWindowSize = 3;
  swStart = 0;
  swCurrentSum = 8;
  swMaxSum = 8;
  swStatus = 'Status: Window of size 3 at indices [0..2]. Sum = 2 + 1 + 5 = 8. Max = 8.';

  ngOnInit(): void {
    this.initDefaultBST();

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
  }

  setMainTab(tab: 'visualizer' | 'curricula'): void {
    this.activeMainTab = tab;
  }

  setCategory(cat: VisualizerCategory): void {
    this.activeCategory = cat;
    if (cat === 'data-structures') {
      if (!['stack', 'queue', 'linked-list', 'bst'].includes(this.activeTopic)) {
        this.activeTopic = 'stack';
      }
    } else {
      if (!['binary-search', 'two-pointers', 'sliding-window'].includes(this.activeTopic)) {
        this.activeTopic = 'binary-search';
      }
    }
  }

  setTopic(id: TopicId): void {
    this.stopAllAutoRuns();
    this.activeTopic = id;
    if (['stack', 'queue', 'linked-list', 'bst'].includes(id)) {
      this.activeCategory = 'data-structures';
    } else {
      this.activeCategory = 'algorithms';
    }
  }

  // ==========================================
  // STACK METHODS
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
  // QUEUE METHODS
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
  // LINKED LIST METHODS
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
  // BST METHODS
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

    // Trace path to find insertion spot
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
    }, 850);
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
    }, 850);
  }

  resetBST(): void {
    this.stopBSTAnimation();
    this.initDefaultBST();
    this.bstInput = '';
    this.bstStatus = 'Reset: Standard balanced BST (7 nodes) restored.';
  }

  // ==========================================
  // BINARY SEARCH METHODS
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
      }, 1600);
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
  // TWO POINTERS METHODS
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
      }, 1600);
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
  // SLIDING WINDOW METHODS
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
      }, 1600);
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
}
