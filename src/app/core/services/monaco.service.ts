import { Injectable } from '@angular/core';
import type * as MonacoEditor from 'monaco-editor';
import { SupportedLanguage } from '../models/problem.model';

/** Type alias for the Monaco Editor namespace (AMD-loaded at runtime via window.monaco). */
type Monaco = typeof MonacoEditor;

@Injectable({
  providedIn: 'root'
})
export class MonacoService {
  private monacoPromise: Promise<Monaco> | null = null;
  public isLoaded = false;

  /**
   * Initializes and loads Monaco Editor using AMD loader.
   * Includes fallback to CDN if local assets cannot be served.
   */
  public initMonaco(): Promise<Monaco> {
    if (this.monacoPromise) {
      return this.monacoPromise;
    }

    if (typeof window !== 'undefined' && (window as any).monaco) {
      const existingMonaco = (window as any).monaco as Monaco;
      this.isLoaded = true;
      this.setupLanguageTokenizers(existingMonaco);
      this.setupCustomTheme(existingMonaco);
      this.setupCompilerOptions(existingMonaco);
      this.monacoPromise = Promise.resolve(existingMonaco);
      return this.monacoPromise;
    }

    this.monacoPromise = new Promise<Monaco>((resolve, reject) => {
      const loadEditorMain = (vsPath: string) => {
        const amdRequire = (window as any).require;
        amdRequire.config({
          paths: { vs: vsPath }
        });

        amdRequire(['vs/editor/editor.main'], () => {
          const monacoGlobal = (window as any).monaco as Monaco | undefined;
          if (monacoGlobal) {
            this.isLoaded = true;
            this.setupLanguageTokenizers(monacoGlobal);
            this.setupCustomTheme(monacoGlobal);
            this.setupCompilerOptions(monacoGlobal);
            resolve(monacoGlobal);
          } else {
            reject(new Error('Monaco Editor library failed to initialize on window.monaco.'));
          }
        }, (err: any) => {
          console.warn('Failed to load Monaco from ' + vsPath, err);
          if (vsPath !== 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.57.0/min/vs') {
            loadEditorMain('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.57.0/min/vs');
          } else {
            reject(err);
          }
        });
      };

      const onLoaderReady = () => {
        loadEditorMain('/assets/monaco/vs');
      };

      if ((window as any).require) {
        onLoaderReady();
        return;
      }

      // Inject loader.js script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '/assets/monaco/vs/loader.js';
      script.async = true;
      script.addEventListener('load', onLoaderReady);
      script.addEventListener('error', () => {
        console.warn('Local loader.js failed, falling back to CDN loader...');
        const cdnScript = document.createElement('script');
        cdnScript.type = 'text/javascript';
        cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.57.0/min/vs/loader.js';
        cdnScript.async = true;
        cdnScript.addEventListener('load', () => {
          loadEditorMain('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.57.0/min/vs');
        });
        cdnScript.addEventListener('error', (e) => reject(e));
        document.body.appendChild(cdnScript);
      });
      document.body.appendChild(script);
    });

    return this.monacoPromise;
  }

  /**
   * Maps DevArena SupportedLanguage to Monaco Editor language identifier.
   */
  public getMonacoLanguage(language: SupportedLanguage): string {
    switch (language) {
      case 'TypeScript':
        return 'typescript';
      case 'JavaScript':
        return 'javascript';
      case 'Python':
        return 'python';
      case 'Java':
        return 'java';
      case 'C++':
        return 'cpp';
      case 'C':
        return 'c';
      default:
        return 'plaintext';
    }
  }

  /**
   * Configures TypeScript / JavaScript compiler options for high-quality IntelliSense.
   */
  private setupCompilerOptions(m: Monaco): void {
    const ts = (m.languages as any)?.typescript;
    if (ts?.typescriptDefaults) {
      ts.typescriptDefaults.setCompilerOptions({
        target: 99, // ESNext
        allowNonTextExtensions: true,
        noEmit: true
      });

      ts.javascriptDefaults?.setCompilerOptions({
        target: 99,
        allowNonTextExtensions: true,
        noEmit: true
      });

      ts.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false
      });
    }
  }

  /**
   * Registers enhanced Monarch tokenizers for TypeScript, JavaScript, Python, Java, C++, and C
   * so that function declarations, function/method calls, built-in types, user-defined types/interfaces,
   * properties, variables/parameters, keywords, strings, numbers, comments, and operators receive
   * distinct token scopes matching VS Code Dark+.
   */
  private setupLanguageTokenizers(m: Monaco): void {
    if (!m.languages?.setMonarchTokensProvider) {
      return;
    }

    const registerGrammar = (langId: string, languageDef: MonacoEditor.languages.IMonarchLanguage) => {
      if (m.languages.registerTokensProviderFactory) {
        m.languages.registerTokensProviderFactory(langId, {
          create: () => languageDef
        });
      }
      m.languages.setMonarchTokensProvider(langId, languageDef);
    };

    const tsJsTokenizer: MonacoEditor.languages.IMonarchLanguage = {
      defaultToken: '',
      tokenPostfix: '.ts',
      keywords: [
        'abstract', 'as', 'asserts', 'async', 'await', 'break', 'case', 'catch',
        'class', 'const', 'constructor', 'continue', 'debugger', 'declare', 'default',
        'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally',
        'for', 'from', 'function', 'get', 'global', 'if', 'implements', 'import',
        'in', 'infer', 'instanceof', 'interface', 'is', 'keyof', 'let', 'module',
        'namespace', 'new', 'null', 'of', 'out', 'override', 'package', 'private',
        'protected', 'public', 'readonly', 'require', 'return', 'satisfies', 'set',
        'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'type',
        'typeof', 'undefined', 'unique', 'var', 'while', 'with', 'yield'
      ],
      typeKeywords: [
        'any', 'bigint', 'boolean', 'never', 'number', 'object', 'string',
        'symbol', 'unknown', 'void'
      ],
      operators: [
        '<=', '>=', '==', '!=', '===', '!==', '=>', '+', '-', '**',
        '*', '/', '%', '++', '--', '<<', '</', '>>', '>>>', '&',
        '|', '^', '!', '~', '&&', '||', '??', '?', ':', '=',
        '+=', '-=', '*=', '**=', '/=', '%=', '<<=', '>>=', '>>>=',
        '&=', '|=', '^=', '@'
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
      digits: /\d+(_+\d+)*/,
      octaldigits: /[0-7]+(_+[0-7]+)*/,
      binarydigits: /[0-1]+(_+[0-1]+)*/,
      hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
      regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
      regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,
      tokenizer: {
        root: [
          [/[{}]/, 'delimiter.bracket'],
          { include: 'common' }
        ],
        common: [
          { include: '@whitespace' },

          // Explicit function declaration: `function twoSum`
          [/\b(function)(\s+)([a-zA-Z_$][\w$]*)/, ['keyword', '', 'entity.name.function']],

          // Explicit type / interface / class / enum declaration: `interface PairResult`
          [/\b(interface|type|class|enum)(\s+)([a-zA-Z_$][\w$]*)/, ['keyword', '', 'entity.name.type']],

          // Method call after dot: `map.has(`, `console.log(`, `Math.max(`
          [/(\.)(\s*)([a-zA-Z_$][\w$]*)(?=\s*(?:<[^>]+>\s*)?\()/, ['delimiter', '', 'support.function']],

          // Property access after dot: `nums.length`, `node.val`
          [/(\.)(\s*)([a-zA-Z_$][\w$]*)/, ['delimiter', '', 'variable.other.property']],

          // PascalCase types, interfaces, and built-in classes: `Map`, `Set`, `Array`, `Promise`, `ListNode`
          [/[A-Z][\w$]*/, 'entity.name.type'],

          // Function or method call / shorthand method definition: `twoSum(`, `helper(`
          [
            /#?[a-z_$][\w$]*(?=\s*(?:<[^>]+>\s*)?\()/,
            {
              cases: {
                '@keywords': 'keyword',
                '@typeKeywords': 'support.type',
                '@default': 'entity.name.function'
              }
            }
          ],

          // Keywords, built-in types, and variables/parameters
          [
            /#?[a-z_$][\w$]*/,
            {
              cases: {
                '@typeKeywords': 'support.type',
                '@keywords': 'keyword',
                '@default': 'variable'
              }
            }
          ],

          // Regular expressions
          [
            /\/(?=([^\\\/]|\\.)+\/([dgimsuy]*)(\s*)(\.|;|,|\)|\]|\}|$))/,
            { token: 'regexp', bracket: '@open', next: '@regexp' }
          ],

          // Delimiters and operators
          [/[()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/!(?=([^=]|$))/, 'operator'],
          [
            /@symbols/,
            {
              cases: {
                '@operators': 'operator',
                '@default': 'delimiter'
              }
            }
          ],

          // Numbers
          [/(@digits)[eE]([\-+]?(@digits))?/, 'number.float'],
          [/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, 'number.float'],
          [/0[xX](@hexdigits)n?/, 'number.hex'],
          [/0[oO]?(@octaldigits)n?/, 'number.octal'],
          [/0[bB](@binarydigits)n?/, 'number.binary'],
          [/(@digits)n?/, 'number'],

          // Punctuation
          [/[;,.]/, 'delimiter'],

          // Strings
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string_double'],
          [/'/, 'string', '@string_single'],
          [/`/, 'string', '@string_backtick']
        ],
        whitespace: [
          [/[ \t\r\n]+/, ''],
          [/\/\*\*(?!\/)/, 'comment.doc', '@jsdoc'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment']
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],
        jsdoc: [
          [/[^\/*]+/, 'comment.doc'],
          [/\*\//, 'comment.doc', '@pop'],
          [/[\/*]/, 'comment.doc']
        ],
        regexp: [
          [/(\{)(\d+(?:,\d*)?)(\})/, ['regexp.escape.control', 'regexp.escape.control', 'regexp.escape.control']],
          [/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/, ['regexp.escape.control', { token: 'regexp.escape.control', next: '@regexrange' }]],
          [/(\()(\?:|\?=|\?!)/, ['regexp.escape.control', 'regexp.escape.control']],
          [/[()]/, 'regexp.escape.control'],
          [/@regexpctl/, 'regexp.escape.control'],
          [/[^\\\/]/, 'regexp'],
          [/@regexpesc/, 'regexp.escape'],
          [/\\\./, 'regexp.invalid'],
          [/(\/)([dgimsuy]*)/, [{ token: 'regexp', bracket: '@close', next: '@pop' }, 'keyword']]
        ],
        regexrange: [
          [/-/, 'regexp.escape.control'],
          [/\^/, 'regexp.invalid'],
          [/@regexpesc/, 'regexp.escape'],
          [/[^\]]/, 'regexp'],
          [/\]/, { token: 'regexp.escape.control', next: '@pop', bracket: '@close' }]
        ],
        string_double: [
          [/[^\\"]+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/"/, 'string', '@pop']
        ],
        string_single: [
          [/[^\\']+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/'/, 'string', '@pop']
        ],
        string_backtick: [
          [/\$\{/, { token: 'delimiter.bracket', next: '@bracketCounting' }],
          [/[^\\`$]+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/`/, 'string', '@pop']
        ],
        bracketCounting: [
          [/\{/, 'delimiter.bracket', '@bracketCounting'],
          [/\}/, 'delimiter.bracket', '@pop'],
          { include: 'common' }
        ]
      }
    };

    const pythonTokenizer: MonacoEditor.languages.IMonarchLanguage = {
      defaultToken: '',
      tokenPostfix: '.python',
      keywords: [
        'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
        'break', 'case', 'class', 'continue', 'def', 'del', 'elif', 'else',
        'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in',
        'is', 'lambda', 'match', 'nonlocal', 'not', 'or', 'pass', 'raise',
        'return', 'self', 'cls', 'try', 'while', 'with', 'yield'
      ],
      typeKeywords: [
        'int', 'float', 'complex', 'bool', 'str', 'bytes', 'bytearray',
        'list', 'tuple', 'dict', 'set', 'frozenset', 'object', 'type',
        'List', 'Dict', 'Set', 'Tuple', 'Optional', 'Union', 'Any',
        'Callable', 'Iterable', 'Sequence'
      ],
      operators: [
        '<=', '>=', '==', '!=', '+', '-', '*', '**', '/', '//', '%', '@',
        '<<', '>>', '&', '|', '^', '~', ':=', '<', '>', '=', '+=', '-=',
        '*=', '/=', '//=', '%=', '**=', '&=', '|=', '^=', '>>=', '<<=', '->'
      ],
      symbols: /[=><!~?:&|+\-*\/\^%@]+/,
      tokenizer: {
        root: [
          { include: '@whitespace' },
          [/\b(def)(\s+)([a-zA-Z_]\w*)/, ['keyword', '', 'entity.name.function']],
          [/\b(class)(\s+)([a-zA-Z_]\w*)/, ['keyword', '', 'entity.name.type']],
          [/(\.)(\s*)([a-zA-Z_]\w*)(?=\s*\()/, ['delimiter', '', 'support.function']],
          [/(\.)(\s*)([a-zA-Z_]\w*)/, ['delimiter', '', 'variable.other.property']],
          [/@[a-zA-Z_]\w*/, 'entity.name.function'],
          [
            /[A-Z]\w*/,
            {
              cases: {
                '@keywords': 'keyword',
                '@typeKeywords': 'support.type',
                '@default': 'entity.name.type'
              }
            }
          ],
          [
            /[a-z_]\w*(?=\s*\()/,
            {
              cases: {
                '@keywords': 'keyword',
                '@typeKeywords': 'support.type',
                '@default': 'entity.name.function'
              }
            }
          ],
          [
            /[a-zA-Z_]\w*/,
            {
              cases: {
                '@typeKeywords': 'support.type',
                '@keywords': 'keyword',
                '@default': 'variable'
              }
            }
          ],
          { include: '@numbers' },
          { include: '@strings' },
          [/[,:;]/, 'delimiter'],
          [/[{}\[\]()]/, '@brackets'],
          [
            /@symbols/,
            {
              cases: {
                '@operators': 'operator',
                '@default': 'delimiter'
              }
            }
          ]
        ],
        whitespace: [
          [/\s+/, ''],
          [/(^#.*$)/, 'comment'],
          [/#.*$/, 'comment'],
          [/'''/, 'string', '@endDocString'],
          [/"""/, 'string', '@endDblDocString']
        ],
        endDocString: [
          [/[^']+/, 'string'],
          [/\\'/, 'string'],
          [/'''/, 'string', '@popall'],
          [/'/, 'string']
        ],
        endDblDocString: [
          [/[^"]+/, 'string'],
          [/\\"/, 'string'],
          [/"""/, 'string', '@popall'],
          [/"/, 'string']
        ],
        numbers: [
          [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, 'number.hex'],
          [/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, 'number']
        ],
        strings: [
          [/'$/, 'string', '@popall'],
          [/f'{1,3}/, 'string', '@stringBody'],
          [/'/, 'string', '@stringBody'],
          [/"$/, 'string', '@popall'],
          [/f"{1,3}/, 'string', '@dblStringBody'],
          [/"/, 'string', '@dblStringBody']
        ],
        stringBody: [
          [/[^\\']+$/, 'string', '@popall'],
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape'],
          [/'/, 'string', '@popall'],
          [/\\$/, 'string']
        ],
        dblStringBody: [
          [/[^\\"]+$/, 'string', '@popall'],
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@popall'],
          [/\\$/, 'string']
        ]
      }
    };

    const javaTokenizer: MonacoEditor.languages.IMonarchLanguage = {
      defaultToken: '',
      tokenPostfix: '.java',
      keywords: [
        'abstract', 'assert', 'break', 'case', 'catch', 'class', 'const',
        'continue', 'default', 'do', 'else', 'enum', 'extends', 'false',
        'final', 'finally', 'for', 'goto', 'if', 'implements', 'import',
        'instanceof', 'interface', 'native', 'new', 'null', 'package',
        'private', 'protected', 'public', 'record', 'return', 'sealed',
        'static', 'strictfp', 'super', 'switch', 'synchronized', 'this',
        'throw', 'throws', 'transient', 'true', 'try', 'volatile', 'while',
        'yield'
      ],
      typeKeywords: [
        'boolean', 'byte', 'char', 'double', 'float', 'int', 'long',
        'short', 'void', 'var'
      ],
      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^',
        '%', '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
        '^=', '%=', '<<=', '>>=', '>>>='
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
      digits: /\d+(_+\d+)*/,
      octaldigits: /[0-7]+(_+[0-7]+)*/,
      binarydigits: /[0-1]+(_+[0-1]+)*/,
      hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
      tokenizer: {
        root: [
          { include: '@whitespace' },
          [/\b(class|interface|enum|record)(\s+)([a-zA-Z_$][\w$]*)/, ['keyword', '', 'entity.name.type']],
          [/(\.)(\s*)([a-zA-Z_$][\w$]*)(?=\s*\()/, ['delimiter', '', 'support.function']],
          [/(\.)(\s*)([a-zA-Z_$][\w$]*)/, ['delimiter', '', 'variable.other.property']],
          [/@\s*[a-zA-Z_$][\w$]*/, 'entity.name.type'],
          [/[A-Z][\w$]*/, 'entity.name.type'],
          [
            /[a-z_$][\w$]*(?=\s*\()/,
            {
              cases: {
                '@keywords': 'keyword',
                '@typeKeywords': 'support.type',
                '@default': 'entity.name.function'
              }
            }
          ],
          [
            /[a-zA-Z_$][\w$]*/,
            {
              cases: {
                '@typeKeywords': 'support.type',
                '@keywords': 'keyword',
                '@default': 'variable'
              }
            }
          ],
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [
            /@symbols/,
            {
              cases: {
                '@operators': 'operator',
                '@default': 'delimiter'
              }
            }
          ],
          [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
          [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
          [/0[xX](@hexdigits)[Ll]?/, 'number.hex'],
          [/0(@octaldigits)[Ll]?/, 'number.octal'],
          [/0[bB](@binarydigits)[Ll]?/, 'number.binary'],
          [/(@digits)[fFdD]/, 'number.float'],
          [/(@digits)[lL]?/, 'number'],
          [/[;,.]/, 'delimiter'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          [/'[^\\']'/, 'string'],
          [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
          [/'/, 'string.invalid']
        ],
        whitespace: [
          [/[ \t\r\n]+/, ''],
          [/\/\*\*(?!\/)/, 'comment.doc', '@javadoc'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment']
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],
        javadoc: [
          [/[^\/*]+/, 'comment.doc'],
          [/\*\//, 'comment.doc', '@pop'],
          [/[\/*]/, 'comment.doc']
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/"/, 'string', '@pop']
        ]
      }
    };

    const cppTokenizer: MonacoEditor.languages.IMonarchLanguage = {
      defaultToken: '',
      tokenPostfix: '.cpp',
      keywords: [
        'alignas', 'alignof', 'and', 'asm', 'break', 'case', 'catch', 'class',
        'const', 'consteval', 'constexpr', 'constinit', 'const_cast', 'continue',
        'decltype', 'default', 'delete', 'do', 'dynamic_cast', 'else', 'enum',
        'explicit', 'export', 'extern', 'false', 'final', 'for', 'friend',
        'goto', 'if', 'inline', 'mutable', 'namespace', 'new', 'noexcept',
        'not', 'nullptr', 'NULL', 'operator', 'or', 'override', 'private',
        'protected', 'public', 'register', 'reinterpret_cast', 'requires',
        'restrict', 'return', 'sizeof', 'static', 'static_assert', 'static_cast',
        'struct', 'switch', 'template', 'this', 'thread_local', 'throw',
        'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'using',
        'virtual', 'volatile', 'while'
      ],
      typeKeywords: [
        'bool', 'char', 'char8_t', 'char16_t', 'char32_t', 'wchar_t',
        'double', 'float', 'int', 'long', 'short', 'signed', 'unsigned',
        'void', 'auto', 'size_t', 'ssize_t', 'ptrdiff_t', 'int8_t', 'int16_t',
        'int32_t', 'int64_t', 'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t',
        'string', 'vector', 'map', 'unordered_map', 'set', 'unordered_set',
        'multimap', 'multiset', 'pair', 'tuple', 'queue', 'priority_queue',
        'stack', 'deque', 'list', 'array', 'bitset', 'optional', 'variant',
        'FILE'
      ],
      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^',
        '%', '<<', '>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
        '%=', '<<=', '>>=', '->', '::'
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      escapes: /\\(?:[0abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
      integersuffix: /([uU](ll|LL|l|L)|(ll|LL|l|L)?[uU]?)/,
      floatsuffix: /[fFlL]?/,
      tokenizer: {
        root: [
          [/^\s*#\s*include/, { token: 'keyword.directive.include', next: '@include' }],
          [/^\s*#\s*\w+/, 'keyword.directive'],
          { include: '@whitespace' },
          [/\b(class|struct|enum|union|typename)(\s+)([a-zA-Z_]\w*)/, ['keyword', '', 'entity.name.type']],
          [/(\.|->|::)(\s*)([a-zA-Z_]\w*)(?=\s*\()/, ['delimiter', '', 'support.function']],
          [/(\.|->)(\s*)([a-zA-Z_]\w*)/, ['delimiter', '', 'variable.other.property']],
          [
            /[A-Z]\w*/,
            {
              cases: {
                '@keywords': 'keyword',
                '@typeKeywords': 'support.type',
                '@default': 'entity.name.type'
              }
            }
          ],
          [
            /[a-z_]\w*(?=\s*\()/,
            {
              cases: {
                '@keywords': 'keyword',
                '@typeKeywords': 'support.type',
                '@default': 'entity.name.function'
              }
            }
          ],
          [
            /[a-zA-Z_]\w*/,
            {
              cases: {
                '@typeKeywords': 'support.type',
                '@keywords': 'keyword',
                '@default': 'variable'
              }
            }
          ],
          [/[{}()<>\[\]]/, '@brackets'],
          [
            /@symbols/,
            {
              cases: {
                '@operators': 'operator',
                '@default': 'delimiter'
              }
            }
          ],
          [/\d*\d+[eE]([\-+]?\d+)?(@floatsuffix)/, 'number.float'],
          [/\d*\.\d+([eE][\-+]?\d+)?(@floatsuffix)/, 'number.float'],
          [/0[xX][0-9a-fA-F']*[0-9a-fA-F](@integersuffix)/, 'number.hex'],
          [/0[0-7']*[0-7](@integersuffix)/, 'number.octal'],
          [/0[bB][0-1']*[0-1](@integersuffix)/, 'number.binary'],
          [/\d[\d']*\d(@integersuffix)/, 'number'],
          [/\d(@integersuffix)/, 'number'],
          [/[;,.]/, 'delimiter'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          [/'[^\\']'/, 'string'],
          [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
          [/'/, 'string.invalid']
        ],
        whitespace: [
          [/[ \t\r\n]+/, ''],
          [/\/\*\*(?!\/)/, 'comment.doc', '@doccomment'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment']
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],
        doccomment: [
          [/[^\/*]+/, 'comment.doc'],
          [/\*\//, 'comment.doc', '@pop'],
          [/[\/*]/, 'comment.doc']
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/"/, 'string', '@pop']
        ],
        include: [
          [
            /(\s*)(<)([^<>]*)(>)/,
            ['', 'delimiter', 'string', { token: 'delimiter', next: '@pop' }]
          ],
          [
            /(\s*)(")([^"]*)(")/,
            ['', 'string', 'string', { token: 'string', next: '@pop' }]
          ]
        ]
      }
    };

    registerGrammar('typescript', tsJsTokenizer);
    registerGrammar('javascript', { ...tsJsTokenizer, tokenPostfix: '.js' });
    registerGrammar('python', pythonTokenizer);
    registerGrammar('java', javaTokenizer);
    registerGrammar('cpp', cppTokenizer);
    registerGrammar('c', { ...cppTokenizer, tokenPostfix: '.c' });
  }

  /**
   * Configures the VS Code Dark Modern theme (`vs-dark-modern`) with authentic token rules and UI chrome colors:
   * - Editor Background: #1F1F1F (Dark Modern canvas)
   * - Editor Foreground: #CCCCCC (Dark Modern default text)
   * - Line Numbers: #6E7681 (active: #CCCCCC)
   * - Line Highlight: #2A2D2E4D (subtle, borderless)
   * - Keywords: #C586C0 (soft purple)
   * - Function names: #DCDCAA (warm yellow)
   * - Variables, parameters & properties: #9CDCFE (light blue)
   * - Types & interfaces: #4EC9B0 (teal)
   * - Strings: #CE9178 (warm muted orange)
   * - Numbers: #B5CEA8 (soft green)
   * - Comments: #6A9955 (olive green, italic)
   * - Operators & delimiters: #D4D4D4 (light neutral gray)
   * - Bracket pair colors: #FFD700, #DA70D6, #179FFF
   */
  private setupCustomTheme(m: Monaco): void {
    const darkModernTheme: MonacoEditor.editor.IStandaloneThemeData = {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Default editor text & background
        { token: '', foreground: 'CCCCCC', background: '1F1F1F' },
        { token: 'source', foreground: 'CCCCCC' },

        // Control flow & special keywords (#C586C0 - soft purple)
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'keyword.control', foreground: 'C586C0' },
        { token: 'keyword.flow', foreground: 'C586C0' },
        { token: 'keyword.directive', foreground: 'C586C0' },
        { token: 'keyword.directive.include', foreground: 'C586C0' },
        { token: 'storage.modifier', foreground: 'C586C0' },
        { token: 'modifier', foreground: 'C586C0' },

        // Function names - declarations, calls, methods (#DCDCAA - warm yellow)
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'function.declaration', foreground: 'DCDCAA' },
        { token: 'function.call', foreground: 'DCDCAA' },
        { token: 'method', foreground: 'DCDCAA' },
        { token: 'method.declaration', foreground: 'DCDCAA' },
        { token: 'entity.name.function', foreground: 'DCDCAA' },
        { token: 'support.function', foreground: 'DCDCAA' },
        { token: 'member.function', foreground: 'DCDCAA' },

        // Types, interfaces, classes & built-in types (#4EC9B0 - teal)
        { token: 'type', foreground: '4EC9B0' },
        { token: 'type.identifier', foreground: '4EC9B0' },
        { token: 'type.builtin', foreground: '4EC9B0' },
        { token: 'interface', foreground: '4EC9B0' },
        { token: 'class', foreground: '4EC9B0' },
        { token: 'enum', foreground: '4EC9B0' },
        { token: 'struct', foreground: '4EC9B0' },
        { token: 'typeParameter', foreground: '4EC9B0' },
        { token: 'namespace', foreground: '4EC9B0' },
        { token: 'entity.name.type', foreground: '4EC9B0' },
        { token: 'entity.name.class', foreground: '4EC9B0' },
        { token: 'support.type', foreground: '4EC9B0' },
        { token: 'storage.type', foreground: '4EC9B0' },

        // Variables, parameters & properties (#9CDCFE - light blue)
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'variable.name', foreground: '9CDCFE' },
        { token: 'variable.parameter', foreground: '9CDCFE' },
        { token: 'variable.predefined', foreground: '9CDCFE' },
        { token: 'variable.property', foreground: '9CDCFE' },
        { token: 'variable.other', foreground: '9CDCFE' },
        { token: 'variable.other.property', foreground: '9CDCFE' },
        { token: 'parameter', foreground: '9CDCFE' },
        { token: 'property', foreground: '9CDCFE' },
        { token: 'enumMember', foreground: '9CDCFE' },
        { token: 'identifier', foreground: '9CDCFE' },

        // Strings (#CE9178 - muted warm orange)
        { token: 'string', foreground: 'CE9178' },
        { token: 'string.quote', foreground: 'CE9178' },
        { token: 'string.escape', foreground: 'D7BA7D' },
        { token: 'string.template', foreground: 'CE9178' },
        { token: 'regexp', foreground: 'D16969' },

        // Numbers (#B5CEA8 - soft green)
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'number.float', foreground: 'B5CEA8' },
        { token: 'number.hex', foreground: 'B5CEA8' },
        { token: 'number.octal', foreground: 'B5CEA8' },
        { token: 'number.binary', foreground: 'B5CEA8' },

        // Comments (#6A9955 - muted olive green)
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'comment.line', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'comment.block', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'comment.doc', foreground: '6A9955', fontStyle: 'italic' },

        // Operators and punctuation (#D4D4D4 - light gray)
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'keyword.operator', foreground: 'D4D4D4' },
        { token: 'delimiter', foreground: 'D4D4D4' },
        { token: 'delimiter.bracket', foreground: 'D4D4D4' },
        { token: 'delimiter.parenthesis', foreground: 'D4D4D4' },
        { token: 'delimiter.square', foreground: 'D4D4D4' },
        { token: 'delimiter.curly', foreground: 'D4D4D4' },
        { token: 'delimiter.angle', foreground: 'D4D4D4' },
        { token: 'punctuation', foreground: 'D4D4D4' }
      ],
      colors: {
        'editor.background': '#1F1F1F',
        'editor.foreground': '#CCCCCC',
        'editorLineNumber.foreground': '#6E7681',
        'editorLineNumber.activeForeground': '#CCCCCC',
        'editor.lineHighlightBackground': '#2A2D2E4D',
        'editor.lineHighlightBorder': '#00000000',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editor.selectionHighlightBackground': '#ADD6FF26',
        'editor.findMatchBackground': '#9E6A03',
        'editorCursor.foreground': '#AEAFAD',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editorWhitespace.foreground': '#3B3A32',
        'editorWidget.background': '#202020',
        'editorWidget.border': '#313131',
        'editorSuggestWidget.background': '#202020',
        'editorSuggestWidget.border': '#313131',
        'editorSuggestWidget.selectedBackground': '#0078D44D',
        'editorSuggestWidget.highlightForeground': '#4DAAFC',
        'editorHoverWidget.background': '#202020',
        'editorHoverWidget.border': '#313131',
        'editorBracketHighlight.foreground1': '#FFD700',
        'editorBracketHighlight.foreground2': '#DA70D6',
        'editorBracketHighlight.foreground3': '#179FFF',
        'focusBorder': '#0078D4'
      }
    };

    // Register theme under VS Code Dark Modern names as well as devarena-dark alias
    m.editor.defineTheme('vs-dark-modern', darkModernTheme);
    m.editor.defineTheme('dark-modern', darkModernTheme);
    m.editor.defineTheme('devarena-dark', darkModernTheme);
  }
}
