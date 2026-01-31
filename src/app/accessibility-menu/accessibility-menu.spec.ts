import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityMenu } from './accessibility-menu';

describe('AccessibilityMenu', () => {
  let component: AccessibilityMenu;
  let fixture: ComponentFixture<AccessibilityMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessibilityMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessibilityMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
