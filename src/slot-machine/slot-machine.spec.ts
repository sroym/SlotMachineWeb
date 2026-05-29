import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotMachine } from './slot-machine';
import {provideHttpClient} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('SlotMachine', () => {
  let component: SlotMachine;
  let fixture: ComponentFixture<SlotMachine>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotMachine],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SlotMachine);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock.expectOne('http://localhost:5141/User').flush({
      name: 'Roy',
      userMoney: 1000
    });
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  })

  it('SpinAgain', () => {
    expect(component.Name()).toBe('角子老虎機');
    component.ClickSpin();
    expect(component.Name()).toBe('角子老虎機 哪有賭徒天天輸!');
  });
  it('should show balance', () => {
    expect(component.Money()).toBe(0);
  });

});
