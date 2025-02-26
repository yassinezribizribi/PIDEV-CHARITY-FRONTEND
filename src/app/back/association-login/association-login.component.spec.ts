import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationLoginComponent } from './association-login.component';

describe('AssociationLoginComponent', () => {
  let component: AssociationLoginComponent;
  let fixture: ComponentFixture<AssociationLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociationLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
