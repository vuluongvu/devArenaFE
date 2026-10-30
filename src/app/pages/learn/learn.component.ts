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
}

interface QueueItem {
  id: number;
  value: string;
  isFront?: boolean;
  isRear?: boolean;
}

interface OperationLog {
  id: number;
  time: string;
  type: 'push' | 'pop' | 'peek' | 'clear' | 'info';
  message: string;
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
  operationLogs: OperationLog[] = [
    { id: 1, time: '10:00:00', type: 'info', message: 'Stack initialized with 3 initial elements. LIFO (Last-In, First-Out) invariant active.' }
  ];
  activeCodeLang: 'typescript' | 'python' = 'typescript';

  // Stack Scenarios
  activeScenario: 'none' | 'brackets' | 'callstack' = 'none';
  scenarioStep = 0;
  scenarioDescription = '';
  scenarioInputTokens: string[] = [];

  readonly bracketSteps = [
    { action: 'push', token: '(', desc: "Encountered opening bracket '('. Push onto stack." },
    { action: 'push', token: '[', desc: "Encountered opening bracket '['. Push onto stack." },
    { action: 'push', token: '{', desc: "Encountered opening bracket '{'. Push onto stack." },
    { action: 'peek', token: '}', desc: "Encountered closing bracket '}'. Peek TOP: '{' matches correctly!" },
    { action: 'pop', token: '}', desc: "Matched pair '{ }'. Pop '{' from stack." },
    { action: 'peek', token: ']', desc: "Encountered closing bracket ']'. Peek TOP: '[' matches correctly!" },
    { action: 'pop', token: ']', desc: "Matched pair '[ ]'. Pop '[' from stack." },
    { action: 'peek', token: ')', desc: "Encountered closing bracket ')'. Peek TOP: '(' matches correctly!" },
    { action: 'pop', token: ')', desc: "Matched pair '( )'. Pop '(' from stack." },
    { action: 'info', token: '', desc: "Traversal finished. Stack is empty -> String is 100% VALID & BALANCED!" }
  ];

  readonly callStackSteps = [
    { action: 'push', token: 'main()', desc: "Program entry: push main() stack frame." },
    { action: 'push', token: 'parseInput()', desc: "main() calls parseInput(). New frame pushed to TOP." },
    { action: 'push', token: 'readBuffer()', desc: "parseInput() calls readBuffer(). readBuffer() is now active." },
    { action: 'pop', token: 'readBuffer()', desc: "readBuffer() returned data. Frame popped." },
    { action: 'pop', token: 'parseInput()', desc: "parseInput() completed. Frame popped." },
    { action: 'push', token: 'solveAlgorithm()', desc: "main() calls solveAlgorithm(). Frame pushed." },
    { action: 'pop', token: 'solveAlgorithm()', desc: "solveAlgorithm() returned result. Frame popped." },
    { action: 'pop', token: 'main()', desc: "main() returned 0. Call stack is empty." }
  ];

  // --- QUEUE VISUALIZER STATE ---
  maxQueueCapacity = 6;
  enqueueInput = '';
  queueItems: QueueItem[] = [
    { id: 10, value: 'Req-1' },
    { id: 11, value: 'Req-2' },
    { id: 12, value: 'Req-3' }
  ];

  // --- TWO POINTERS VISUALIZER STATE ---
  twoPointerArray: string[] = ['r', 'a', 'c', 'e', 'c', 'a', 'r'];
  leftPointer = 0;
  rightPointer = 6;
  twoPointerMessage = "Initial state: Left at index 0 ('r'), Right at index 6 ('r').";
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
  // STACK OPERATIONS
  // ==========================================
  pushStack(customVal?: string): void {
    if (this.stackItems.length >= this.maxStackCapacity) {
      this.addLog('info', `Stack Overflow Warning: Demo container maximum capacity (${this.maxStackCapacity}) reached.`);
      return;
    }

    const val = (customVal !== undefined ? customVal : this.pushInput.trim()) || String(Math.floor(Math.random() * 90) + 10);
    const newItem: StackItem = {
      id: Date.now() + Math.random(),
      value: val
    };

    this.stackItems.push(newItem);
    this.pushInput = '';
    this.addLog('push', `PUSH('${val}'): Placed at index ${this.stackItems.length - 1}. Top is now '${val}'.`);
  }

  popStack(): void {
    if (this.stackItems.length === 0) {
      this.addLog('info', 'Stack Underflow: Cannot pop from an empty stack.');
      return;
    }

    const popped = this.stackItems[this.stackItems.length - 1];
    popped.isPopping = true;

    setTimeout(() => {
      this.stackItems.pop();
      const newTop = this.stackItems.length > 0 ? this.stackItems[this.stackItems.length - 1].value : 'null (empty)';
      this.addLog('pop', `POP(): Removed '${popped.value}' from TOP. New Top is ${newTop}.`);
    }, 180);
  }

  peekStack(): void {
    if (this.stackItems.length === 0) {
      this.addLog('info', 'PEEK(): Stack is currently empty.');
      return;
    }

    const topItem = this.stackItems[this.stackItems.length - 1];
    topItem.isPeeking = true;
    this.addLog('peek', `PEEK(): Inspecting TOP element: '${topItem.value}' (O(1) time, stack unchanged).`);

    setTimeout(() => {
      topItem.isPeeking = false;
    }, 1200);
  }

  clearStack(): void {
    this.stackItems = [];
    this.activeScenario = 'none';
    this.addLog('clear', 'CLEAR(): All elements removed. Stack reset to empty.');
  }

  pushRandom(): void {
    const randoms = ['42', '15', '99', '7', '108', '24', '63', 'A', 'X'];
    const chosen = randoms[Math.floor(Math.random() * randoms.length)];
    this.pushStack(chosen);
  }

  // ==========================================
  // SCENARIO SIMULATIONS
  // ==========================================
  startScenario(type: 'brackets' | 'callstack'): void {
    this.activeScenario = type;
    this.scenarioStep = 0;
    this.stackItems = [];

    if (type === 'brackets') {
      this.scenarioInputTokens = ['(', '[', '{', '}', ']', ')'];
      this.scenarioDescription = "Simulating problem #8: Valid Parentheses on string '([{}])'. Step through each token!";
      this.addLog('info', "Scenario Started: Balanced Brackets Validation '([{}])'");
    } else {
      this.scenarioInputTokens = ['main()', 'parseInput()', 'readBuffer()', 'solveAlgorithm()'];
      this.scenarioDescription = "Simulating call stack frame allocation during nested function execution.";
      this.addLog('info', "Scenario Started: Call Stack Frame Allocation");
    }
  }

  nextScenarioStep(): void {
    const steps = this.activeScenario === 'brackets' ? this.bracketSteps : this.callStackSteps;
    if (this.scenarioStep >= steps.length) {
      this.scenarioDescription = "Scenario completed! Feel free to reset or try custom operations.";
      return;
    }

    const current = steps[this.scenarioStep];
    this.scenarioDescription = current.desc;

    if (current.action === 'push') {
      this.pushStack(current.token);
    } else if (current.action === 'pop') {
      this.popStack();
    } else if (current.action === 'peek') {
      this.peekStack();
    } else {
      this.addLog('info', current.desc);
    }

    this.scenarioStep++;
  }

  resetScenario(): void {
    this.activeScenario = 'none';
    this.scenarioStep = 0;
    this.scenarioDescription = '';
    this.stackItems = [
      { id: 1, value: '42' },
      { id: 2, value: '15' },
      { id: 3, value: '88' }
    ];
    this.addLog('info', 'Scenario stopped. Restored interactive playground.');
  }

  // ==========================================
  // QUEUE OPERATIONS
  // ==========================================
  enqueue(): void {
    if (this.queueItems.length >= this.maxQueueCapacity) {
      this.addLog('info', 'Queue Full: Maximum capacity reached.');
      return;
    }
    const val = this.enqueueInput.trim() || `Req-${Math.floor(Math.random() * 80) + 10}`;
    this.queueItems.push({ id: Date.now(), value: val });
    this.enqueueInput = '';
    this.addLog('push', `ENQUEUE('${val}'): Added to REAR. Length: ${this.queueItems.length}.`);
  }

  dequeue(): void {
    if (this.queueItems.length === 0) {
      this.addLog('info', 'Queue Empty: Cannot dequeue.');
      return;
    }
    const removed = this.queueItems.shift();
    this.addLog('pop', `DEQUEUE(): Removed '${removed?.value}' from FRONT. FIFO invariant satisfied.`);
  }

  clearQueue(): void {
    this.queueItems = [];
    this.addLog('clear', 'Queue cleared.');
  }

  // ==========================================
  // TWO POINTERS OPERATIONS
  // ==========================================
  stepTwoPointers(): void {
    if (this.leftPointer >= this.rightPointer) {
      this.twoPointerDone = true;
      this.twoPointerMessage = `Pointers met at index ${this.leftPointer}. The string is a PALINDROME!`;
      return;
    }

    const leftChar = this.twoPointerArray[this.leftPointer];
    const rightChar = this.twoPointerArray[this.rightPointer];

    if (leftChar === rightChar) {
      this.leftPointer++;
      this.rightPointer--;
      if (this.leftPointer < this.rightPointer) {
        this.twoPointerMessage = `Matched '${leftChar}' == '${rightChar}'. Left pointer moved to ${this.leftPointer}, Right pointer to ${this.rightPointer}.`;
      } else {
        this.twoPointerDone = true;
        this.twoPointerMessage = `All boundary characters matched! String 'racecar' is a valid PALINDROME! (O(N) Time, O(1) Space)`;
      }
    } else {
      this.twoPointerDone = true;
      this.twoPointerMessage = `Mismatch: '${leftChar}' != '${rightChar}'. Not a palindrome.`;
    }
  }

  resetTwoPointers(): void {
    this.leftPointer = 0;
    this.rightPointer = 6;
    this.twoPointerDone = false;
    this.twoPointerMessage = "Initial state: Left at index 0 ('r'), Right at index 6 ('r').";
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================
  private addLog(type: OperationLog['type'], message: string): void {
    const time = new Date().toTimeString().split(' ')[0];
    this.operationLogs.unshift({
      id: Date.now() + Math.random(),
      time,
      type,
      message
    });
    if (this.operationLogs.length > 20) {
      this.operationLogs.pop();
    }
  }

  get stackTopItem(): StackItem | null {
    return this.stackItems.length > 0 ? this.stackItems[this.stackItems.length - 1] : null;
  }
}
