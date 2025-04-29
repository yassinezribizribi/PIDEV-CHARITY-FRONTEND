import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusChangeDialogComponent } from './status-change-dialog.component';

describe('StatusChangeDialogComponent', () => {
  let component: StatusChangeDialogComponent;
  let fixture: ComponentFixture<StatusChangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusChangeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
