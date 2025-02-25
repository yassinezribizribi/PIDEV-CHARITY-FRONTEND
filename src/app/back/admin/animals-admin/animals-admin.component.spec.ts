import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalsAdminComponent } from './animals-admin.component';

describe('AnimalsAdminComponent', () => {
  let component: AnimalsAdminComponent;
  let fixture: ComponentFixture<AnimalsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
