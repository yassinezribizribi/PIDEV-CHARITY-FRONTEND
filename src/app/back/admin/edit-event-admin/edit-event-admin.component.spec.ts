import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEventAdminComponent } from './edit-event-admin.component';

describe('EditEventAdminComponent', () => {
  let component: EditEventAdminComponent;
  let fixture: ComponentFixture<EditEventAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEventAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditEventAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
