import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenButtonComponent } from './token-button.component';

describe('TokenButtonComponent', () => {
  let component: TokenButtonComponent;
  let fixture: ComponentFixture<TokenButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
