import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeChangePopupComponent } from './life-change-popup.component';

describe('LifeChangePopupComponent', () => {
  let component: LifeChangePopupComponent;
  let fixture: ComponentFixture<LifeChangePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ LifeChangePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeChangePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
