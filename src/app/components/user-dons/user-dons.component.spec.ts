import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDonsComponent } from './user-dons.component';

describe('UserDonsComponent', () => {
  let component: UserDonsComponent;
  let fixture: ComponentFixture<UserDonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
