import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthcareComponent } from './healthcare.component';

describe('ServicesComponent', () => {
  let component: HealthcareComponent;
  let fixture: ComponentFixture<HealthcareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthcareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthcareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
