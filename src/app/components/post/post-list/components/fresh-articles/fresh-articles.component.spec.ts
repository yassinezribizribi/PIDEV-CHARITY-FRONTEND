import { ComponentFixture, TestBed } from '@angular/core/testing'

import { FreshArticlesComponent } from './fresh-articles.component'

describe('FreshArticlesComponent', () => {
  let component: FreshArticlesComponent
  let fixture: ComponentFixture<FreshArticlesComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreshArticlesComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(FreshArticlesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
