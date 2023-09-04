import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DevtoolSummaryComponent} from './devtool-summary.component';

describe('DevtoolSessionComponent', () => {
  let component: DevtoolSummaryComponent;
  let fixture: ComponentFixture<DevtoolSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DevtoolSummaryComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DevtoolSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
