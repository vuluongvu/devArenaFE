import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProgressService } from '../../core/services/progress.service';

interface StackElement {
  id: number;
  value: string;
  isPeeking?: boolean;
  isPopping?: boolean;
}

interface GuidedStep {
  token: string;
  action: 'push' | 'pop' | 'peek' | 'success';
  title: string;
  explanation: string;
}

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

  learningPaths = this.progressService.learningPaths;
  Math = Math;

  // Tabs & Modes
  activeMainTab: 'visualizer' | 'curricula' = 'visualizer';
  activeDs: 'stack' | 'queue' | 'two-pointers' = 'stack';
  interactionMode: 'sandbox' | 'guided' = 'sandbox';

  // --- STACK STATE ---
  maxCapacity = 6;
  pushInputValue = '';
  stackItems: StackElement[] = [
    { id: 1, value: '10' },
    { id: 2, value: '25' },
    { id: 3, value: '77' }
  ];
  statusMessage = "Stack đang có 3 phần tử. Đỉnh (TOP) hiện tại là 77. Bấm 'Push' hoặc 'Pop' để tương tác.";
  lastActionType: 'push' | 'pop' | 'peek' | 'clear' | 'none' = 'none';

  // --- GUIDED SCENARIO STATE (LeetCode #8: Valid Parentheses) ---
  guidedTokens = ['(', '[', '{', '}', ']', ')'];
  guidedStepIndex = 0;
  isAutoPlaying = false;
  private autoPlayTimer: any = null;

  readonly guidedSteps: GuidedStep[] = [
    {
      token: '(',
      action: 'push',
      title: "Gặp ngoặc mở '('",
      explanation: "Quy tắc: Khi gặp ngoặc mở, ta đẩy (Push) vào Stack để chờ cặp ngoặc đóng tương ứng."
    },
    {
      token: '[',
      action: 'push',
      title: "Gặp ngoặc mở '['",
      explanation: "Tiếp tục đẩy '[' vào Stack. Hiện tại '[' nằm ở ĐỈNH (TOP)."
    },
    {
      token: '{',
      action: 'push',
      title: "Gặp ngoặc mở '{'",
      explanation: "Đẩy '{' vào Stack. '{' trở thành đỉnh mới nhất."
    },
    {
      token: '}',
      action: 'peek',
      title: "Gặp ngoặc đóng '}'",
      explanation: "Kiểm tra đỉnh Stack (Peek): Đỉnh là '{' -> Khớp hoàn hảo với '}'! Ta lấy '{' ra (Pop)."
    },
    {
      token: ']',
      action: 'peek',
      title: "Gặp ngoặc đóng ']'",
      explanation: "Kiểm tra đỉnh Stack: Đỉnh là '[' -> Khớp với ']'! Ta lấy '[' ra (Pop)."
    },
    {
      token: ')',
      action: 'peek',
      title: "Gặp ngoặc đóng ')'",
      explanation: "Kiểm tra đỉnh Stack: Đỉnh là '(' -> Khớp với ')'! Ta lấy '(' ra (Pop)."
    },
    {
      token: 'DONE',
      action: 'success',
      title: "Hoàn thành duyệt chuỗi!",
      explanation: "Stack rỗng hoàn toàn -> Chuỗi ngoặc '([{}])' HỢP LỆ (BALANCED)! Bạn đã nắm trọn thuật toán bài LeetCode #8!"
    }
  ];

  // --- QUEUE STATE ---
  queueItems: string[] = ['Khách 1', 'Khách 2', 'Khách 3'];
  queueMessage = "Queue hoạt động theo nguyên lý FIFO: Vào trước sẽ ra trước.";

  // --- TWO POINTERS STATE ---
  tpArray = ['r', 'a', 'c', 'e', 'c', 'a', 'r'];
  leftPtr = 0;
  rightPtr = 6;
  tpMessage = "Hai con trỏ Left & Right bắt đầu từ 2 đầu mút chuỗi 'racecar'.";
  tpFinished = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'curricula') {
        this.activeMainTab = 'curricula';
      }
      if (params['ds']) {
        this.activeDs = params['ds'];
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  selectDs(ds: 'stack' | 'queue' | 'two-pointers'): void {
    this.activeDs = ds;
    this.stopAutoPlay();
  }

  setInteractionMode(mode: 'sandbox' | 'guided'): void {
    this.interactionMode = mode;
    this.stopAutoPlay();
    if (mode === 'guided') {
      this.resetGuided();
    } else {
      this.statusMessage = "Đã chuyển về chế độ tự do. Bạn có thể tự thêm/bớt phần tử tùy thích.";
    }
  }

  // ==========================================
  // STACK SANDBOX METHODS
  // ==========================================
  pushRandom(): void {
    const randomVal = String(Math.floor(Math.random() * 90) + 10);
    this.pushItem(randomVal);
  }

  pushCustom(): void {
    const val = this.pushInputValue.trim();
    if (!val) {
      this.pushRandom();
      return;
    }
    this.pushItem(val);
    this.pushInputValue = '';
  }

  private pushItem(val: string): void {
    if (this.stackItems.length >= this.maxCapacity) {
      this.statusMessage = `⚠️ Stack đã đầy (tối đa ${this.maxCapacity} phần tử trong demo). Hãy Pop bớt ra trước nhé!`;
      return;
    }

    const newItem: StackElement = {
      id: Date.now() + Math.random(),
      value: val
    };

    this.stackItems.push(newItem);
    this.lastActionType = 'push';
    this.statusMessage = `✅ Đã PUSH phần tử '${val}' vào đỉnh Stack (Index ${this.stackItems.length - 1}). Thao tác mất thời gian O(1).`;
  }

  popItem(): void {
    if (this.stackItems.length === 0) {
      this.statusMessage = "⚠️ Stack đang rỗng (Stack Underflow)! Không thể lấy thêm phần tử nào nữa.";
      return;
    }

    const popped = this.stackItems[this.stackItems.length - 1];
    popped.isPopping = true;
    this.lastActionType = 'pop';

    setTimeout(() => {
      this.stackItems.pop();
      const currentTop = this.topItem ? `'${this.topItem.value}'` : 'Rỗng';
      this.statusMessage = `🔻 Đã POP phần tử '${popped.value}' ra khỏi đỉnh. Đỉnh mới hiện tại là: ${currentTop}. Thao tác mất O(1).`;
    }, 180);
  }

  peekItem(): void {
    if (this.stackItems.length === 0) {
      this.statusMessage = "ℹ️ Stack rỗng, không có phần tử nào ở đỉnh.";
      return;
    }

    const top = this.topItem;
    if (top) {
      top.isPeeking = true;
      this.lastActionType = 'peek';
      this.statusMessage = `👁️ PEEK: Đỉnh Stack hiện tại là '${top.value}'. Dữ liệu trong Stack không bị thay đổi (O(1)).`;
      setTimeout(() => {
        top.isPeeking = false;
      }, 1000);
    }
  }

  clearStack(): void {
    this.stackItems = [];
    this.lastActionType = 'clear';
    this.statusMessage = "🔄 Đã dọn sạch Stack về trạng thái rỗng.";
  }

  get topItem(): StackElement | null {
    return this.stackItems.length > 0 ? this.stackItems[this.stackItems.length - 1] : null;
  }

  // ==========================================
  // GUIDED LESSON METHODS
  // ==========================================
  resetGuided(): void {
    this.stopAutoPlay();
    this.guidedStepIndex = 0;
    this.stackItems = [];
    this.statusMessage = "Bắt đầu kịch bản kiểm tra chuỗi ngoặc '([{}])'. Bấm 'Bước tiếp theo' để xem cách Stack giải quyết!";
  }

  nextGuidedStep(): void {
    if (this.guidedStepIndex >= this.guidedSteps.length) {
      this.statusMessage = "Kịch bản đã hoàn thành! Bấm 'Bắt đầu lại' nếu muốn xem lại.";
      this.stopAutoPlay();
      return;
    }

    const step = this.guidedSteps[this.guidedStepIndex];

    if (step.action === 'push') {
      this.stackItems.push({
        id: Date.now() + Math.random(),
        value: step.token
      });
      this.lastActionType = 'push';
    } else if (step.action === 'peek') {
      // Pop the matching pair
      const popped = this.stackItems.pop();
      this.lastActionType = 'pop';
    } else if (step.action === 'success') {
      this.lastActionType = 'peek';
    }

    this.statusMessage = `${step.title}: ${step.explanation}`;
    this.guidedStepIndex++;

    if (this.guidedStepIndex >= this.guidedSteps.length) {
      this.stopAutoPlay();
    }
  }

  toggleAutoPlay(): void {
    if (this.isAutoPlaying) {
      this.stopAutoPlay();
    } else {
      this.isAutoPlaying = true;
      if (this.guidedStepIndex >= this.guidedSteps.length) {
        this.resetGuided();
      }
      this.autoPlayTimer = setInterval(() => {
        if (this.guidedStepIndex < this.guidedSteps.length) {
          this.nextGuidedStep();
        } else {
          this.stopAutoPlay();
        }
      }, 1200);
    }
  }

  private stopAutoPlay(): void {
    this.isAutoPlaying = false;
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  // ==========================================
  // QUEUE METHODS
  // ==========================================
  enqueueQuick(): void {
    if (this.queueItems.length >= 5) {
      this.queueMessage = "Hàng đợi đã đầy trong bản mô phỏng.";
      return;
    }
    const val = `Khách ${this.queueItems.length + 1}`;
    this.queueItems.push(val);
    this.queueMessage = `Đã thêm (Enqueue) '${val}' vào cuối hàng đợi (REAR).`;
  }

  dequeueQuick(): void {
    if (this.queueItems.length === 0) {
      this.queueMessage = "Hàng đợi rỗng!";
      return;
    }
    const removed = this.queueItems.shift();
    this.queueMessage = `Đã phục vụ & lấy (Dequeue) '${removed}' ra từ đầu hàng đợi (FRONT).`;
  }

  // ==========================================
  // TWO POINTERS METHODS
  // ==========================================
  stepTwoPointers(): void {
    if (this.leftPtr >= this.rightPtr) {
      this.tpFinished = true;
      this.tpMessage = `🎉 Hai con trỏ đã gặp nhau ở giữa! Mọi ký tự đối xứng đều trùng khớp. 'racecar' là PALINDROME!`;
      return;
    }

    const lChar = this.tpArray[this.leftPtr];
    const rChar = this.tpArray[this.rightPtr];

    if (lChar === rChar) {
      this.leftPtr++;
      this.rightPtr--;
      if (this.leftPtr < this.rightPtr) {
        this.tpMessage = `✅ Ký tự '${lChar}' ở vị trí ${this.leftPtr - 1} khớp với '${rChar}' ở vị trí ${this.rightPtr + 1}. Thu hẹp tiếp...`;
      } else {
        this.tpFinished = true;
        this.tpMessage = `🎉 Hoàn thành kiểm tra! Chuỗi 'racecar' là Palindrome hợp lệ (Thời gian O(N), Bộ nhớ O(1)).`;
      }
    }
  }

  resetTwoPointers(): void {
    this.leftPtr = 0;
    this.rightPtr = 6;
    this.tpFinished = false;
    this.tpMessage = "Đã đặt lại 2 con trỏ về 2 đầu mút ban đầu.";
  }
}
