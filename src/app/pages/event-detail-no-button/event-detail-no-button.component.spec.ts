import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetailNoButtonComponent } from './event-detail-no-button.component';

describe('EventDetailNoButtonComponent', () => {
  let component: EventDetailNoButtonComponent;
  let fixture: ComponentFixture<EventDetailNoButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDetailNoButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventDetailNoButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
