import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrongRouteComponent } from './404.component';

describe('404Component', () => {
  let component: WrongRouteComponent;
  let fixture: ComponentFixture<WrongRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrongRouteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WrongRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
