import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDonationComponent } from './edit-donation.component';

describe('EditDonationComponent', () => {
  let component: EditDonationComponent;
  let fixture: ComponentFixture<EditDonationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDonationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDonationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
