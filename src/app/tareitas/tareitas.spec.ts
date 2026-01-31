import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tareitas } from './tareitas';

describe('Tareitas', () => {
  let component: Tareitas;
  let fixture: ComponentFixture<Tareitas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tareitas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tareitas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
