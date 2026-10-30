import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProblemService } from '../../core/services/problem.service';
import { SubmissionService } from '../../core/services/submission.service';
import { ThemeService } from '../../core/services/theme.service';
import { MonacoService } from '../../core/services/monaco.service';
import { Problem, SupportedLanguage } from '../../core/models/problem.model';
import {
  RunCodeDto,
  RunCodeResult,
  SubmitCodeDto,
  SubmissionEvaluationResult,
  SubmissionHistoryItem
} from '../../core/models/submission.model';

type LeftTab = 'description' | 'editorial' | 'submissions';
type ConsoleTab = 'testcases' | 'output' | 'result';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, BadgeComponent],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private problemService = inject(ProblemService);
  private submissionService = inject(SubmissionService);
  private monacoService = inject(MonacoService);
  themeService = inject(ThemeService);

  /**
   * The container lives inside `*ngIf="!isLoading && problem"`, so it only exists after the
   * problem has loaded. A setter lets us (re)initialize Monaco whenever the element appears.
   */
  @ViewChild('monacoContainer')
  set monacoContainer(ref: ElementRef<HTMLDivElement> | undefined) {
    this.monacoContainerRef = ref;
    if (!ref) {
      // Container removed from DOM (e.g. reloading problem) -> dispose stale editor
      if (this.editorInstance) {
        this.editorInstance.dispose();
        this.editorInstance = null;
      }
      return;
    }
    if (!this.editorInstance) {
      this.initMonacoEditor();
    }
  }
  monacoContainerRef?: ElementRef<HTMLDivElement>;
  private editorInstance: any = null;

  problem: Problem | null = null;
  slug = '';
  isLoading = true;
  errorMessage = '';

  // Workspace Tabs & Layout
  activeLeftTab: LeftTab = 'description';
  activeConsoleTab: ConsoleTab = 'testcases';
  isConsoleCollapsed = false;

  // Split-pane Resizing State
  splitRatio = 48; // Left pane percentage (48% left, 52% right)
  isResizingSplit = false;
  consoleHeight = 240; // Default console height in pixels
  isResizingConsole = false;
  private startY = 0;
  private startConsoleHeight = 0;

  // Language & Code State
  supportedLanguages: SupportedLanguage[] = ['TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'C'];
  selectedLanguage: SupportedLanguage = 'TypeScript';
  code = '';
  activeLineNumber = 1;
  activeColNumber = 1;

  // Testcases & Execution State
  selectedTestCaseIndex = 0;
  isCustomTestCase = false;
  customInput = '';
  
  // Execution Evaluation States
  isRunning = false;
  isSubmitting = false;
  runResult: RunCodeResult | null = null;
  submitResult: SubmissionEvaluationResult | null = null;
  submissionsList: SubmissionHistoryItem[] = [];

  // Feedback Toast
  toastMessage: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || 'two-sum';
      this.loadProblem(this.slug);
    });
  }

  ngAfterViewInit(): void {
    // Initialization is driven by the `monacoContainer` ViewChild setter.
  }

  ngOnDestroy(): void {
    if (this.editorInstance) {
      this.editorInstance.dispose();
      this.editorInstance = null;
    }
  }

  loadProblem(slug: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.problemService.getProblemBySlug(slug).subscribe({
      next: (data) => {
        if (data) {
          this.problem = data;
          this.initStarterCode();
        } else {
          this.errorMessage = 'Problem not found. Please select a valid challenge from the problem list.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load problem statement from server.';
        this.isLoading = false;
      }
    });

    this.submissionsList = this.submissionService.history().filter(s => s.problemSlug === slug);
  }

  initStarterCode(): void {
    if (!this.problem) return;
    this.code = this.getStarterCodeForLanguage(this.selectedLanguage);
    if (this.editorInstance) {
      this.editorInstance.setValue(this.code);
      const lang = this.monacoService.getMonacoLanguage(this.selectedLanguage);
      const model = this.editorInstance.getModel();
      if (model && (window as any).monaco) {
        (window as any).monaco.editor.setModelLanguage(model, lang);
      }
    }
  }

  onLanguageChange(): void {
    if (!this.problem) return;
    this.code = this.getStarterCodeForLanguage(this.selectedLanguage);
    if (this.editorInstance) {
      this.editorInstance.setValue(this.code);
      const lang = this.monacoService.getMonacoLanguage(this.selectedLanguage);
      const model = this.editorInstance.getModel();
      if (model && (window as any).monaco) {
        (window as any).monaco.editor.setModelLanguage(model, lang);
      }
    }
    this.showToast(`Switched language to ${this.selectedLanguage}`);
  }

  getStarterCodeForLanguage(lang: SupportedLanguage): string {
    if (!this.problem) return '// Write your solution here\n';
    if (this.problem.starterCode && this.problem.starterCode[lang]) {
      return this.problem.starterCode[lang]!;
    }
    if (lang === 'C') {
      return this.generateCStarter();
    }
    return '// Write your solution here\n';
  }

  private generateCStarter(): string {
    if (!this.problem) {
      return '#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n\n// Write your solution here\n';
    }
    if (this.problem.slug === 'two-sum') {
      return `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    *returnSize = 0;
    return NULL;
}`;
    } else if (this.problem.slug === 'valid-anagram') {
      return `bool isAnagram(char* s, char* t) {
    if (strlen(s) != strlen(t)) return false;
    int count[26] = {0};
    for (int i = 0; s[i] != '\\0'; i++) {
        count[s[i] - 'a']++;
        count[t[i] - 'a']--;
    }
    for (int i = 0; i < 26; i++) {
        if (count[i] != 0) return false;
    }
    return true;
}`;
    } else if (this.problem.slug === 'valid-palindrome') {
      return `bool isPalindrome(char* s) {
    int left = 0;
    int right = strlen(s) - 1;
    while (left < right) {
        while (left < right && !isalnum((unsigned char)s[left])) left++;
        while (left < right && !isalnum((unsigned char)s[right])) right--;
        if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`;
    }
    return `#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n#include <string.h>\n\n// Solution for ${this.problem.title}\n`;
  }

  getFileExtension(): string {
    switch (this.selectedLanguage) {
      case 'TypeScript': return 'ts';
      case 'JavaScript': return 'js';
      case 'Python': return 'py';
      case 'Java': return 'java';
      case 'C++': return 'cpp';
      case 'C': return 'c';
      default: return 'txt';
    }
  }

  /**
   * Initializes the real Monaco Editor instance with VS Code Dark+ defaults
   */
  private initMonacoEditor(): void {
    if (!this.monacoContainerRef) return;

    this.monacoService.initMonaco().then(m => {
      if (!this.monacoContainerRef || this.editorInstance) return;
      const container = this.monacoContainerRef.nativeElement;
      const lang = this.monacoService.getMonacoLanguage(this.selectedLanguage);

      this.editorInstance = m.editor.create(container, {
        value: this.code,
        language: lang,
        theme: 'vs-dark-modern',
        'semanticHighlighting.enabled': true,
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true
        },
        fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
        fontSize: 14.5,
        lineHeight: 22,
        automaticLayout: true,
        minimap: { enabled: false },
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        cursorStyle: 'line',
        cursorWidth: 2,
        tabSize: 4,
        insertSpaces: true,
        detectIndentation: false,
        folding: true,
        matchBrackets: 'always',
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        contextmenu: true,
        wordWrap: 'off',
        padding: { top: 12, bottom: 12 },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'auto',
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
          useShadows: false
        }
      });

      m.editor.setTheme('vs-dark-modern');

      // Track cursor position for status bar
      this.editorInstance.onDidChangeCursorPosition((e: any) => {
        this.activeLineNumber = e.position.lineNumber;
        this.activeColNumber = e.position.column;
      });

      // Keep code model synchronized with editor
      this.editorInstance.onDidChangeModelContent(() => {
        if (this.editorInstance) {
          this.code = this.editorInstance.getValue();
        }
      });

      // Keybinding inside Monaco: Ctrl+' or Cmd+' -> Run Code
      this.editorInstance.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.Quote, () => {
        this.runCode();
      });

      // Keybinding inside Monaco: Ctrl+Enter or Cmd+Enter -> Submit Code
      this.editorInstance.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.Enter, () => {
        this.submitCode();
      });

      // Ensure initial dimensions
      setTimeout(() => {
        if (this.editorInstance) {
          this.editorInstance.layout();
        }
      }, 50);
    }).catch(err => {
      console.error('Failed to initialize Monaco Editor:', err);
    });
  }

  getEditorialCode(): string {
    return this.problem?.solutionEditorial?.code[this.selectedLanguage] ||
      (this.selectedLanguage === 'C' ? this.problem?.solutionEditorial?.code['C++'] : null) ||
      '// Solution in this language coming soon\n';
  }

  // Resizable Split Panes (Left vs Right)
  startResizeSplit(event: MouseEvent): void {
    event.preventDefault();
    this.isResizingSplit = true;
  }

  // Resizable Bottom Console
  startResizeConsole(event: MouseEvent): void {
    event.preventDefault();
    this.isResizingConsole = true;
    this.startY = event.clientY;
    this.startConsoleHeight = this.consoleHeight;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isResizingSplit) {
      const containerWidth = window.innerWidth;
      const ratio = (event.clientX / containerWidth) * 100;
      if (ratio >= 25 && ratio <= 75) {
        this.splitRatio = Math.round(ratio * 10) / 10;
        if (this.editorInstance) {
          this.editorInstance.layout();
        }
      }
    } else if (this.isResizingConsole) {
      const deltaY = this.startY - event.clientY;
      const newHeight = this.startConsoleHeight + deltaY;
      if (newHeight >= 140 && newHeight <= 550) {
        this.consoleHeight = newHeight;
        if (this.editorInstance) {
          this.editorInstance.layout();
        }
      }
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (this.isResizingSplit || this.isResizingConsole) {
      this.isResizingSplit = false;
      this.isResizingConsole = false;
      if (this.editorInstance) {
        this.editorInstance.layout();
      }
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.editorInstance) {
      this.editorInstance.layout();
    }
  }

  // Global Keyboard Shortcuts
  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      this.submitCode();
    } else if ((event.metaKey || event.ctrlKey) && event.key === "'") {
      event.preventDefault();
      this.runCode();
    }
  }

  runCode(): void {
    if (!this.problem || this.isRunning || this.isSubmitting) return;

    if (this.editorInstance) {
      this.code = this.editorInstance.getValue();
    }

    this.isRunning = true;
    this.isConsoleCollapsed = false;
    this.activeConsoleTab = 'output';

    let currentInput = '';
    let expectedOutput = '';

    if (this.isCustomTestCase) {
      currentInput = this.customInput;
    } else if (this.problem.sampleTestCases[this.selectedTestCaseIndex]) {
      currentInput = this.problem.sampleTestCases[this.selectedTestCaseIndex].input;
      expectedOutput = this.problem.sampleTestCases[this.selectedTestCaseIndex].expectedOutput;
    }

    const dto: RunCodeDto = {
      language: this.selectedLanguage,
      sourceCode: this.code,
      input: currentInput
    };

    this.submissionService.runCode(dto, expectedOutput).subscribe({
      next: (res) => {
        this.runResult = res;
        this.isRunning = false;
        this.showToast(res.status === 'ACCEPTED' ? 'Execution passed' : 'Execution completed');
      },
      error: () => {
        this.runResult = {
          status: 'RUNTIME ERROR',
          stderr: 'Connection error during evaluation. Ensure local backend or sandbox is reachable.',
          executionTimeMs: 0,
          memoryUsedKb: 0
        };
        this.isRunning = false;
      }
    });
  }

  submitCode(): void {
    if (!this.problem || this.isRunning || this.isSubmitting) return;

    if (this.editorInstance) {
      this.code = this.editorInstance.getValue();
    }

    this.isSubmitting = true;
    this.isConsoleCollapsed = false;
    this.activeConsoleTab = 'result';

    const dto: SubmitCodeDto = {
      problemId: this.problem.id,
      language: this.selectedLanguage,
      sourceCode: this.code
    };

    this.submissionService.submitCode(dto, this.problem.slug, this.problem.title).subscribe({
      next: (res) => {
        this.submitResult = res;
        this.isSubmitting = false;

        if (res.status === 'ACCEPTED') {
          this.problemService.updateSolveStatus(this.problem!.slug, 'SOLVED');
          if (this.problem) this.problem.userStatus = 'SOLVED';
          this.showToast('Accepted! All test cases passed.');
        } else {
          this.problemService.updateSolveStatus(this.problem!.slug, 'ATTEMPTED');
          if (this.problem && this.problem.userStatus !== 'SOLVED') {
            this.problem.userStatus = 'ATTEMPTED';
          }
          this.showToast(`Evaluation completed: ${res.status}`);
        }

        this.submissionsList = this.submissionService.history().filter(s => s.problemSlug === this.slug);
      },
      error: () => {
        this.submitResult = {
          status: 'INTERNAL ERROR',
          passedTestCases: 0,
          totalTestCases: 5,
          message: 'Unable to communicate with the evaluation server.'
        };
        this.isSubmitting = false;
      }
    });
  }

  resetCode(): void {
    if (!this.problem) return;
    if (confirm('Reset your code to the default starter template?')) {
      this.code = this.getStarterCodeForLanguage(this.selectedLanguage);
      if (this.editorInstance) {
        this.editorInstance.setValue(this.code);
      }
      this.showToast('Code reset to default');
    }
  }

  copyEditorialCode(): void {
    if (!this.problem?.solutionEditorial?.code) return;
    const sol = this.getEditorialCode();
    navigator.clipboard.writeText(sol);
    this.showToast('Editorial solution copied to clipboard!');
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      if (this.toastMessage === msg) {
        this.toastMessage = null;
      }
    }, 2800);
  }
}
