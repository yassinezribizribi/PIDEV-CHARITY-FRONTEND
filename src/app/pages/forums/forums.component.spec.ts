import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumsComponent } from './forums.component';

describe('ForumsComponent', () => {
  let component: ForumsComponent;
  let fixture: ComponentFixture<ForumsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
