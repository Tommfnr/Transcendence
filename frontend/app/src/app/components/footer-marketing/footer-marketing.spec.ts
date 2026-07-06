import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterMarketing } from './footer-marketing';

describe('FooterMarketing', () => {
  let component: FooterMarketing;
  let fixture: ComponentFixture<FooterMarketing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterMarketing],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterMarketing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
