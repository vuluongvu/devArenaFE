import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect collapsed state in DOM', () => {
    component.isCollapsed = false;
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sidebar-container')?.classList.contains('collapsed')).toBeFalse();

    component.isCollapsed = true;
    fixture.detectChanges();
    expect(el.querySelector('.sidebar-container')?.classList.contains('collapsed')).toBeTrue();
  });

  it('should emit toggleCollapse when toggle button is clicked', () => {
    spyOn(component.toggleCollapse, 'emit');
    const toggleBtn = fixture.nativeElement.querySelector('.sidebar-toggle-btn') as HTMLButtonElement;
    toggleBtn.click();
    expect(component.toggleCollapse.emit).toHaveBeenCalled();
  });
});
