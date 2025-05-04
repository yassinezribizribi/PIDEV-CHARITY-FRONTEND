import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CagnotteDetailsComponent } from './cagnotte-details.component';

describe('CagnotteDetailsComponent', () => {
  let component: CagnotteDetailsComponent;
  let fixture: ComponentFixture<CagnotteDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CagnotteDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CagnotteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
