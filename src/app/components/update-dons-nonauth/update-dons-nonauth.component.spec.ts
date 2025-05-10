import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDonsNonauthComponent } from './update-dons-nonauth.component';

describe('UpdateDonsNonauthComponent', () => {
  let component: UpdateDonsNonauthComponent;
  let fixture: ComponentFixture<UpdateDonsNonauthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateDonsNonauthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateDonsNonauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
