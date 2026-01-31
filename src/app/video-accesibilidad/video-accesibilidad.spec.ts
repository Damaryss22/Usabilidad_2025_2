import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoAccesibilidad } from './video-accesibilidad';

describe('VideoAccesibilidad', () => {
  let component: VideoAccesibilidad;
  let fixture: ComponentFixture<VideoAccesibilidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoAccesibilidad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoAccesibilidad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
