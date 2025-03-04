import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEventAdminComponent } from './view-event-admin.component';

describe('ViewEventAdminComponent', () => {
  let component: ViewEventAdminComponent;
  let fixture: ComponentFixture<ViewEventAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEventAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEventAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
