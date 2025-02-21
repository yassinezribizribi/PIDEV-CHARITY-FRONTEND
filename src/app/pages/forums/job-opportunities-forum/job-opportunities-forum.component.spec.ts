import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobOpportunitiesForumComponent } from './job-opportunities-forum.component';

describe('JobOpportunitiesForumComponent', () => {
  let component: JobOpportunitiesForumComponent;
  let fixture: ComponentFixture<JobOpportunitiesForumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOpportunitiesForumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobOpportunitiesForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
