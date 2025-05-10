import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProphetComponent } from './prophet.component';

describe('ProphetComponent', () => {
  let component: ProphetComponent;
  let fixture: ComponentFixture<ProphetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProphetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProphetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
