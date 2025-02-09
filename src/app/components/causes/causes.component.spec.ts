import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CausesComponent } from './causes.component';

describe('CausesComponent', () => {
  let component: CausesComponent;
  let fixture: ComponentFixture<CausesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CausesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CausesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
