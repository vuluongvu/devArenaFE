import { TestBed } from '@angular/core/testing';
import { MonacoService } from './monaco.service';

describe('MonacoService', () => {
  let service: MonacoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MonacoService]
    });
    service = TestBed.inject(MonacoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map SupportedLanguage to Monaco language identifiers correctly', () => {
    expect(service.getMonacoLanguage('TypeScript')).toBe('typescript');
    expect(service.getMonacoLanguage('JavaScript')).toBe('javascript');
    expect(service.getMonacoLanguage('Python')).toBe('python');
    expect(service.getMonacoLanguage('Java')).toBe('java');
    expect(service.getMonacoLanguage('C++')).toBe('cpp');
    expect(service.getMonacoLanguage('C')).toBe('c');
  });

  it('should configure VS Code Dark Modern palette and register language tokenizers when initialized', async () => {
    const mockMonaco = {
      editor: {
        defineTheme: jasmine.createSpy('defineTheme'),
        create: jasmine.createSpy('create')
      },
      languages: {
        setMonarchTokensProvider: jasmine.createSpy('setMonarchTokensProvider'),
        registerTokensProviderFactory: jasmine.createSpy('registerTokensProviderFactory')
      }
    };
    (window as any).monaco = mockMonaco;

    const res = await service.initMonaco();
    expect(res).toBe(mockMonaco as any);
    expect(service.isLoaded).toBeTrue();
    expect(mockMonaco.editor.defineTheme).toHaveBeenCalledWith(
      'vs-dark-modern',
      jasmine.objectContaining({
        base: 'vs-dark',
        inherit: true
      })
    );
    expect(mockMonaco.languages.setMonarchTokensProvider).toHaveBeenCalledTimes(6);

    // Clean up mock
    delete (window as any).monaco;
  });
});
