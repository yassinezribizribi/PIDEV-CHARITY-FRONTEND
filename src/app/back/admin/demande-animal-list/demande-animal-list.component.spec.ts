import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeAnimalListComponent } from './demande-animal-list.component';

describe('DemandeAnimalListComponent', () => {
  let component: DemandeAnimalListComponent;
  let fixture: ComponentFixture<DemandeAnimalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeAnimalListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeAnimalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
