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
  activeCodeLang: 'cpp' | 'java' | 'python' = 'cpp';
  statusMessage = 'Trạng thái: Ngăn xếp đang có 3 phần tử. Đỉnh hiện tại là 88.';

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
  twoPointerMessage = "Khởi tạo: Con trỏ L tại 0 ('r'), con trỏ R tại 6 ('r').";
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
  // STACK OPERATIONS: Thêm, Sửa, Xóa, Xem
  // ==========================================

  // Thêm phần tử vào đỉnh (Push)
  pushStack(customVal?: string): void {
    if (this.stackItems.length >= this.maxStackCapacity) {
      this.statusMessage = `Stack Overflow: Đã đầy dung lượng bộ nhớ mô phỏng (${this.maxStackCapacity} phần tử).`;
      return;
    }

    const val = (customVal !== undefined ? customVal : this.pushInput.trim()) || String(Math.floor(Math.random() * 90) + 10);
    const newItem: StackItem = {
      id: Date.now() + Math.random(),
      value: val
    };

    this.stackItems.push(newItem);
    this.pushInput = '';
    this.statusMessage = `Push('${val}'): Đã thêm phần tử '${val}' vào đỉnh ngăn xếp.`;
  }

  // Xóa phần tử khỏi đỉnh (Pop)
  popStack(): void {
    if (this.stackItems.length === 0) {
      this.statusMessage = 'Stack Underflow: Ngăn xếp đang rỗng, không thể xóa phần tử.';
      return;
    }

    const popped = this.stackItems[this.stackItems.length - 1];
    popped.isPopping = true;

    setTimeout(() => {
      this.stackItems.pop();
      const newTop = this.stackItems.length > 0 ? `'${this.stackItems[this.stackItems.length - 1].value}'` : 'null (rỗng)';
      this.statusMessage = `Pop(): Đã xóa phần tử '${popped.value}' khỏi đỉnh. Đỉnh mới là ${newTop}.`;
    }, 180);
  }

  // Xem phần tử ở đỉnh (Peek / Top)
  peekStack(): void {
    if (this.stackItems.length === 0) {
      this.statusMessage = 'Peek(): Ngăn xếp đang rỗng.';
      return;
    }

    const topItem = this.stackItems[this.stackItems.length - 1];
    topItem.isPeeking = true;
    this.statusMessage = `Peek(): Phần tử ở đỉnh hiện tại là '${topItem.value}' (O(1)).`;

    setTimeout(() => {
      topItem.isPeeking = false;
    }, 1200);
  }

  // Sửa giá trị phần tử ở đỉnh
  updateTopStack(): void {
    if (this.stackItems.length === 0) {
      this.statusMessage = 'Không thể sửa: Ngăn xếp đang rỗng.';
      return;
    }
    const val = this.pushInput.trim();
    if (!val) {
      this.statusMessage = 'Vui lòng nhập giá trị vào ô để sửa phần tử đỉnh.';
      return;
    }

    const topItem = this.stackItems[this.stackItems.length - 1];
    const oldVal = topItem.value;
    topItem.value = val;
    topItem.isUpdated = true;
    this.pushInput = '';
    this.statusMessage = `Sửa đỉnh: Đã cập nhật phần tử đỉnh từ '${oldVal}' thành '${val}'.`;

    setTimeout(() => {
      topItem.isUpdated = false;
    }, 1000);
  }

  // Xóa toàn bộ phần tử
  clearStack(): void {
    this.stackItems = [];
    this.statusMessage = 'Clear(): Đã xóa toàn bộ phần tử trong ngăn xếp.';
  }

  // Thêm phần tử ngẫu nhiên
  pushRandom(): void {
    const randoms = ['42', '15', '99', '7', '108', '24', '63', '80'];
    const chosen = randoms[Math.floor(Math.random() * randoms.length)];
    this.pushStack(chosen);
  }

  // ==========================================
  // QUEUE OPERATIONS (Thêm, Xóa, Xóa sạch)
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
      this.twoPointerMessage = `Hai con trỏ đã gặp nhau tại index ${this.leftPointer}. Chuỗi đối xứng hợp lệ (Palindrome)!`;
      return;
    }

    const leftChar = this.twoPointerArray[this.leftPointer];
    const rightChar = this.twoPointerArray[this.rightPointer];

    if (leftChar === rightChar) {
      this.leftPointer++;
      this.rightPointer--;
      if (this.leftPointer < this.rightPointer) {
        this.twoPointerMessage = `Trùng khớp '${leftChar}' == '${rightChar}'. Con trỏ L dịch sang ${this.leftPointer}, R dịch sang ${this.rightPointer}.`;
      } else {
        this.twoPointerDone = true;
        this.twoPointerMessage = `Tất cả ký tự đối xứng khớp nhau! Chuỗi 'racecar' là Palindrome (O(N) thời gian, O(1) không gian).`;
      }
    } else {
      this.twoPointerDone = true;
      this.twoPointerMessage = `Không khớp: '${leftChar}' != '${rightChar}'.`;
    }
  }

  resetTwoPointers(): void {
    this.leftPointer = 0;
    this.rightPointer = 6;
    this.twoPointerDone = false;
    this.twoPointerMessage = "Khởi tạo: Con trỏ L tại 0 ('r'), con trỏ R tại 6 ('r').";
  }

  get stackTopItem(): StackItem | null {
    return this.stackItems.length > 0 ? this.stackItems[this.stackItems.length - 1] : null;
  }
}
