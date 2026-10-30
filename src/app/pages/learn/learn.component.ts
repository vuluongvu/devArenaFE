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

interface BSTNodeVisual {
  id: number;
  val: number;
  level: number;
  pos: number;
  highlight?: boolean;
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

  // BST Connecting Edges state
  bstActiveEdges = new Set<string>();

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
  bstInput = '';
  bstNodes: BSTNodeVisual[] = [
    { id: 1, val: 50, level: 0, pos: 50 },
    { id: 2, val: 30, level: 1, pos: 25 },
    { id: 3, val: 70, level: 1, pos: 75 },
    { id: 4, val: 20, level: 2, pos: 12 },
    { id: 5, val: 40, level: 2, pos: 38 },
    { id: 6, val: 60, level: 2, pos: 62 },
    { id: 7, val: 80, level: 2, pos: 88 }
  ];
  bstStatus = 'Status: Balanced Binary Search Tree with Root = 50. Left children < Parent < Right children.';

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
  insertBST(): void {
    const val = parseInt(this.bstInput.trim(), 10);
    if (isNaN(val)) {
      this.bstStatus = 'Please enter a valid integer to insert into BST.';
      return;
    }
    if (this.bstNodes.some(n => n.val === val)) {
      this.bstStatus = `Value ${val} already exists in the BST. Duplicate ignored.`;
      return;
    }
    if (this.bstNodes.length >= 10) {
      this.bstStatus = 'BST demo size reached.';
      return;
    }

    // Determine position based on root
    const level = val < 50 ? 2 : 2;
    const pos = val < 50 ? (val < 30 ? 6 : 44) : (val < 70 ? 56 : 94);
    this.bstNodes.push({ id: Date.now(), val, level, pos, highlight: true });
    this.bstInput = '';
    this.bstStatus = `insert(${val}): Placed node ${val} in BST following left < root < right invariant.`;
  }

  searchBST(customVal?: number): void {
    const val = customVal !== undefined ? customVal : parseInt(this.bstInput.trim(), 10);
    if (isNaN(val)) {
      this.bstStatus = 'Please enter an integer to search.';
      return;
    }
    this.bstNodes.forEach(n => n.highlight = false);
    this.bstActiveEdges.clear();

    // Determine path from root 50
    const pathNodes: number[] = [50];
    const pathEdges: string[] = [];

    if (val < 50) {
      pathEdges.push('50-30');
      pathNodes.push(30);
      if (val < 30) {
        pathEdges.push('30-20');
        pathNodes.push(20);
      } else if (val > 30) {
        pathEdges.push('30-40');
        pathNodes.push(40);
      }
    } else if (val > 50) {
      pathEdges.push('50-70');
      pathNodes.push(70);
      if (val < 70) {
        pathEdges.push('70-60');
        pathNodes.push(60);
      } else if (val > 70) {
        pathEdges.push('70-80');
        pathNodes.push(80);
      }
    }

    // Step-by-step path animation down the branches
    let step = 0;
    const interval = setInterval(() => {
      if (step < pathNodes.length) {
        const currNodeVal = pathNodes[step];
        const node = this.bstNodes.find(n => n.val === currNodeVal);
        if (node) node.highlight = true;
        if (step > 0) {
          this.bstActiveEdges.add(pathEdges[step - 1]);
        }
        step++;
      } else {
        clearInterval(interval);
        const found = pathNodes[pathNodes.length - 1] === val;
        this.bstStatus = found
          ? `search(${val}): Node ${val} FOUND in BST following branch traversal in O(log N)!`
          : `search(${val}): Traversal completed. Value ${val} NOT found in BST.`;
        setTimeout(() => {
          this.bstNodes.forEach(n => n.highlight = false);
          this.bstActiveEdges.clear();
        }, 3000);
      }
    }, 450);
  }

  resetBST(): void {
    this.bstActiveEdges.clear();
    this.bstNodes = [
      { id: 1, val: 50, level: 0, pos: 50 },
      { id: 2, val: 30, level: 1, pos: 25 },
      { id: 3, val: 70, level: 1, pos: 75 },
      { id: 4, val: 20, level: 2, pos: 12 },
      { id: 5, val: 40, level: 2, pos: 38 },
      { id: 6, val: 60, level: 2, pos: 62 },
      { id: 7, val: 80, level: 2, pos: 88 }
    ];
    this.bstStatus = 'Reset: Standard balanced BST restored.';
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
      }, 950);
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
      }, 950);
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
      }, 950);
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
