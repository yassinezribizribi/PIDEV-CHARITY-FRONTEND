import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleNavbarComponent } from './single-navbar.component';

describe('SingleNavbarComponent', () => {
  let component: SingleNavbarComponent;
  let fixture: ComponentFixture<SingleNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
