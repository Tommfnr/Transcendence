import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderMarketing } from './header-marketing';

describe('HeaderMarketing', () => {
  let component: HeaderMarketing;
  let fixture: ComponentFixture<HeaderMarketing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderMarketing],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderMarketing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
