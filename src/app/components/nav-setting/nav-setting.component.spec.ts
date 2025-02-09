import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavSettingComponent } from './nav-setting.component';

describe('NavSettingComponent', () => {
  let component: NavSettingComponent;
  let fixture: ComponentFixture<NavSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
