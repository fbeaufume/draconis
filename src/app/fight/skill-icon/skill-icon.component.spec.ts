import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillIconComponent } from './skill-icon.component';

describe('SkillIconComponent', () => {
  let component: SkillIconComponent;
  let fixture: ComponentFixture<SkillIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkillIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
