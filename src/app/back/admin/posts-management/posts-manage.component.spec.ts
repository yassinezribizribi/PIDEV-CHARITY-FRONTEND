import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsManageComponent } from './posts-manage.component';

describe('PostsManageComponent', () => {
  let component: PostsManageComponent;
  let fixture: ComponentFixture<PostsManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
