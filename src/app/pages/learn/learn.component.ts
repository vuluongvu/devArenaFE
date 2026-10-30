import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
}

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, BadgeComponent],
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.css']
})
export class LearnComponent implements OnInit {
  private progressService = inject(ProgressService);
  private route = inject(ActivatedRoute);

  learningPaths = this.progressService.learningPaths;
  Math = Math;

  // View Navigation
  activeMainTab: 'visualizer' | 'curricula' = 'visualizer';
  activeDs: 'stack' | 'queue' | 'two-pointers' = 'stack';

  // --- STACK VISUALIZER STATE ---
  maxStackCapacity = 7;
  pushInput = '';
  stackItems: StackItem[] = [
    { id: 1, value: '42' },
    { id: 2, value: '15' },
    { id: 3, value: '88' }
  ];
  statusMessage = 'Status: Stack initialized with 3 elements. Current TOP element is 88.';

  // --- QUEUE VISUALIZER STATE ---
  maxQueueCapacity = 6;
  enqueueInput = '';
  queueItems: QueueItem[] = [
    { id: 10, value: '10' },
    { id: 11, value: '25' },
    { id: 12, value: '70' }
  ];

  // --- TWO POINTERS VISUALIZER STATE ---
  twoPointerArray: string[] = ['r', 'a', 'c', 'e', 'c', 'a', 'r'];
  leftPointer = 0;
  rightPointer = 6;
  twoPointerMessage = "Initial state: Left pointer at index 0 ('r'), Right pointer at index 6 ('r').";
  twoPointerDone = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'curricula') {
        this.activeMainTab = 'curricula';
      }
      if (params['ds']) {
        this.activeDs = params['ds'] as any;
      }
    });
  }

  // ==========================================
  // STACK OPERATIONS: Insert, Delete, Update, Read
  // ==========================================

  // Insert element at TOP (Push)
  pushStack(customVal?: string): void {
    if (this.stackItems.length >= this.maxStackCapacity) {
      this.statusMessage = `Stack Overflow: Container capacity (${this.maxStackCapacity} elements) reached.`;
      return;
    }

    const val = (customVal !== undefined ? customVal : this.pushInput.trim()) || String(Math.floor(Math.random() * 90) + 10);
    const newItem: StackItem = {
      id: Date.now() + Math.random(),
      value: val
    };

    this.stackItems.push(newItem);
    this.pushInput = '';
    this.statusMessage = `push('${val}'): Element '${val}' inserted at TOP (index ${this.stackItems.length - 1}).`;
  }

  // Delete element from TOP (Pop)
  popStack(): void {
    if (this.stackItems.length === 0) {
      this.statusMessage = 'Stack Underflow: Stack is empty, cannot pop element.';
      return;
    }

    const popped = this.stackItems[this.stackItems.length - 1];
    popped.isPopping = true;

    setTimeout(() => {
      this.stackItems.pop();
      const newTop = this.stackItems.length > 0 ? `'${this.stackItems[this.stackItems.length - 1].value}'` : 'null (empty)';
      this.statusMessage = `pop(): Removed '${popped.value}' from TOP. New TOP is ${newTop}.`;
    }, 180);
  }

  // Read element at TOP (Peek / Top)
  peekStack(): void {
    if (this.stackItems.length === 0) {
      this.statusMessage = 'peek(): Stack is currently empty.';
      return;
    }

    const topItem = this.stackItems[this.stackItems.length - 1];
    topItem.isPeeking = true;
    this.statusMessage = `peek(): TOP element is '${topItem.value}' (O(1) time complexity, stack unmodified).`;

    setTimeout(() => {
      topItem.isPeeking = false;
    }, 1200);
  }

  // Update value of element at TOP
  updateTopStack(): void {
    if (this.stackItems.length === 0) {
      this.statusMessage = 'Cannot update: Stack is empty.';
      return;
    }
    const val = this.pushInput.trim();
    if (!val) {
      this.statusMessage = 'Please enter a value in the input field to update the TOP element.';
      return;
    }

    const topItem = this.stackItems[this.stackItems.length - 1];
    const oldVal = topItem.value;
    topItem.value = val;
    topItem.isUpdated = true;
    this.pushInput = '';
    this.statusMessage = `updateTop('${val}'): Updated TOP element from '${oldVal}' to '${val}'.`;

    setTimeout(() => {
      topItem.isUpdated = false;
    }, 1000);
  }

  // Clear all elements
  clearStack(): void {
    this.stackItems = [];
    this.statusMessage = 'clear(): All elements removed. Stack reset to empty.';
  }

  // Push random integer
  pushRandom(): void {
    const randoms = ['42', '15', '99', '7', '108', '24', '63', '80'];
    const chosen = randoms[Math.floor(Math.random() * randoms.length)];
    this.pushStack(chosen);
  }

  // ==========================================
  // QUEUE OPERATIONS (Enqueue, Dequeue, Clear)
  // ==========================================
  enqueue(): void {
    if (this.queueItems.length >= this.maxQueueCapacity) {
      return;
    }
    const val = this.enqueueInput.trim() || String(Math.floor(Math.random() * 80) + 10);
    this.queueItems.push({ id: Date.now(), value: val });
    this.enqueueInput = '';
  }

  dequeue(): void {
    if (this.queueItems.length === 0) {
      return;
    }
    this.queueItems.shift();
  }

  clearQueue(): void {
    this.queueItems = [];
  }

  // ==========================================
  // TWO POINTERS OPERATIONS
  // ==========================================
  stepTwoPointers(): void {
    if (this.leftPointer >= this.rightPointer) {
      this.twoPointerDone = true;
      this.twoPointerMessage = `Pointers met at index ${this.leftPointer}. String is a valid Palindrome!`;
      return;
    }

    const leftChar = this.twoPointerArray[this.leftPointer];
    const rightChar = this.twoPointerArray[this.rightPointer];

    if (leftChar === rightChar) {
      this.leftPointer++;
      this.rightPointer--;
      if (this.leftPointer < this.rightPointer) {
        this.twoPointerMessage = `Matched '${leftChar}' == '${rightChar}'. Left pointer moved to ${this.leftPointer}, Right pointer moved to ${this.rightPointer}.`;
      } else {
        this.twoPointerDone = true;
        this.twoPointerMessage = `All boundary characters matched! String 'racecar' is a valid Palindrome (O(N) Time, O(1) Space).`;
      }
    } else {
      this.twoPointerDone = true;
      this.twoPointerMessage = `Mismatch: '${leftChar}' != '${rightChar}'.`;
    }
  }

  resetTwoPointers(): void {
    this.leftPointer = 0;
    this.rightPointer = 6;
    this.twoPointerDone = false;
    this.twoPointerMessage = "Initial state: Left pointer at index 0 ('r'), Right pointer at index 6 ('r').";
  }

  get stackTopItem(): StackItem | null {
    return this.stackItems.length > 0 ? this.stackItems[this.stackItems.length - 1] : null;
  }
}
