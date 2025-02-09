import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutTwoComponent } from './about-two.component';

describe('AboutTwoComponent', () => {
  let component: AboutTwoComponent;
  let fixture: ComponentFixture<AboutTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutTwoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
