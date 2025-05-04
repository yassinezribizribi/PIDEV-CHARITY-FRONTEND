import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterAssociationComponent } from './register-association.component';

describe('RegisterAssociationComponent', () => {
  let component: RegisterAssociationComponent;
  let fixture: ComponentFixture<RegisterAssociationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterAssociationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterAssociationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
