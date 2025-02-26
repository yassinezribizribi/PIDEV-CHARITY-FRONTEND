import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaireEventsComponent } from './formulaire-events.component';

describe('FormulaireEventsComponent', () => {
  let component: FormulaireEventsComponent;
  let fixture: ComponentFixture<FormulaireEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulaireEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
