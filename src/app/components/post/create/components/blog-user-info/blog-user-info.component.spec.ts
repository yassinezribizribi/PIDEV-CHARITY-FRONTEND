import { ComponentFixture, TestBed } from '@angular/core/testing'

import { BlogUserInfoComponent } from './blog-user-info.component'

describe('BlogUserInfoComponent', () => {
  let component: BlogUserInfoComponent
  let fixture: ComponentFixture<BlogUserInfoComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogUserInfoComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(BlogUserInfoComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
