import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddanimaladminComponent } from './addanimaladmin.component';

describe('AddanimaladminComponent', () => {
  let component: AddanimaladminComponent;
  let fixture: ComponentFixture<AddanimaladminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddanimaladminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddanimaladminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
