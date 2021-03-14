import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatureLogComponent } from './creature-log.component';

describe('CreatureLogComponent', () => {
  let component: CreatureLogComponent;
  let fixture: ComponentFixture<CreatureLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatureLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatureLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
