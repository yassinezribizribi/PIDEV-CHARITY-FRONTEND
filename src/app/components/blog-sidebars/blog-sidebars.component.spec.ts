import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogSidebarsComponent } from './blog-sidebars.component';

describe('BlogSidebarsComponent', () => {
  let component: BlogSidebarsComponent;
  let fixture: ComponentFixture<BlogSidebarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogSidebarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogSidebarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
