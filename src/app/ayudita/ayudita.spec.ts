import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ayudita } from './ayudita';

describe('Ayudita', () => {
  let component: Ayudita;
  let fixture: ComponentFixture<Ayudita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ayudita]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ayudita);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
