import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeChangePopupComponent } from './life-change-popup.component';

describe('LifeChangePopupComponent', () => {
  let component: LifeChangePopupComponent;
  let fixture: ComponentFixture<LifeChangePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeChangePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LifeChangePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
