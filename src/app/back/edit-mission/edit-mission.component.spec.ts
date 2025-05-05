import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMissionComponent } from './edit-mission.component';

describe('EditMissionComponent', () => {
  let component: EditMissionComponent;
  let fixture: ComponentFixture<EditMissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
