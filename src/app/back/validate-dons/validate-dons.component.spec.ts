import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateDonsComponent } from './validate-dons.component';

describe('ValidateDonsComponent', () => {
  let component: ValidateDonsComponent;
  let fixture: ComponentFixture<ValidateDonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateDonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateDonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
