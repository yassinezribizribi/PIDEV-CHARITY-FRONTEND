import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportRefugeesComponent } from './support-refugees-forum.component';

describe('SupportRefugeesForumComponent', () => {
  let component: SupportRefugeesComponent;
  let fixture: ComponentFixture<SupportRefugeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportRefugeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportRefugeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});