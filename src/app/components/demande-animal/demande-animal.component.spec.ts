import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeAnimalComponent } from './demande-animal.component';

describe('DemandeAnimalComponent', () => {
  let component: DemandeAnimalComponent;
  let fixture: ComponentFixture<DemandeAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeAnimalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeAnimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
