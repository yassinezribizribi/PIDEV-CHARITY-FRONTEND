import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportRefugeesForumComponent } from './support-refugees-forum.component';

describe('SupportRefugeesForumComponent', () => {
  let component: SupportRefugeesForumComponent;
  let fixture: ComponentFixture<SupportRefugeesForumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportRefugeesForumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportRefugeesForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});