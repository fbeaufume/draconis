import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeChangeLogComponent } from './life-change-log.component';

describe('LifeChangeLogComponent', () => {
  let component: LifeChangeLogComponent;
  let fixture: ComponentFixture<LifeChangeLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeChangeLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LifeChangeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
