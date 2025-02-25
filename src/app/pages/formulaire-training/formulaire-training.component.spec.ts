import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaireTrainingComponent } from './formulaire-training.component';

describe('FormulaireTrainingComponent', () => {
  let component: FormulaireTrainingComponent;
  let fixture: ComponentFixture<FormulaireTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireTrainingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulaireTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
