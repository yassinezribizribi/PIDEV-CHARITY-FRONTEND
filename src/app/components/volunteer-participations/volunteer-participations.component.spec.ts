import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteerParticipationsComponent } from './volunteer-participations.component';

describe('VolunteerParticipationsComponent', () => {
  let component: VolunteerParticipationsComponent;
  let fixture: ComponentFixture<VolunteerParticipationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteerParticipationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolunteerParticipationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
