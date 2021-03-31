import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusLogComponent } from './status-log.component';

describe('StatusLogComponent', () => {
  let component: StatusLogComponent;
  let fixture: ComponentFixture<StatusLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatusLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
