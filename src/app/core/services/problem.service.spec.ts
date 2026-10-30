import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProblemService } from './problem.service';

describe('ProblemService', () => {
  let service: ProblemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProblemService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProblemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return problems list', (done) => {
    service.getProblems().subscribe(problems => {
      expect(problems.length).toBeGreaterThan(0);
      expect(problems[0].slug).toBe('two-sum');
      done();
    });
  });

  it('should filter problems by difficulty', (done) => {
    service.getProblems({ difficulty: 'EASY' }).subscribe(problems => {
      const allEasy = problems.every(p => p.difficulty === 'EASY');
      expect(allEasy).toBeTrue();
      done();
    });
  });

  it('should find problem by slug', (done) => {
    service.getProblemBySlug('two-sum').subscribe(prob => {
      expect(prob).toBeTruthy();
      expect(prob?.title).toBe('Two Sum');
      done();
    });
  });
});
