import { TestBed } from '@angular/core/testing';

import { DemandeAnimalService } from './demande-animal.service';

describe('DemandeAnimalService', () => {
  let service: DemandeAnimalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandeAnimalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
