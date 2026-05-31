import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlotMachine } from './slot-machine';
import { provideHttpClient } from '@angular/common/http';
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
  });

  it('SpinAgain', () => {
    expect(component.Name()).toBe('角子老虎機');
    component.ClickSpin();
    httpMock.expectOne('http://localhost:5141/Slot?bet=0').flush({
      userMoney: 1000,
      screen: [['$','$','$'],['$','$','$'],['$','$','$'],['$','$','$'],['$','$','$']]
    });
    expect(component.Name()).toBe('角子老虎機 哪有賭徒天天輸!');

  });

  it('should show balance', () => {
    expect(component.Money()).toBe(1000);
  });

  it('贏了',() =>{
    component.Bet = 10;
    component.ClickSpin();
    httpMock.expectOne('http://localhost:5141/Slot?bet=10').flush({
      userMoney: 1090,
      screen: [
        ['7','h','$'],
        ['$','$','$'],
        ['7','2','$'],
        ['$','$','$'],
        ['7','$','$']
      ]
    });
    expect(component.WinMoney()).toBe(100);
    expect(component.Money()).toBe(1090);
    expect(component.TransposedScreen()).toEqual([
      ['7', '$', '7', '$', '7'],
      ['$', '$', '2', '$', 'h'],
      ['$', '$', '$', '$', '$']
    ]);
  });


  it('輸了', () => {
    component.Bet = 10;
    component.ClickSpin();
    httpMock.expectOne('http://localhost:5141/Slot?bet=10').flush({
      userMoney: 990,
      screen: [
        ['7', 'h', '$'],
        ['$', '$', '$'],
        ['7', '2', '$'],
        ['$', '$', '$'],
        ['7', '$', '$'],
      ],
    });
    expect(component.WinMoney()).toBe(0);
    expect(component.Money()).toBe(990);
  });

  it('載入使用者名字', () =>{
    expect(component.UserName()).toBe(('Roy'));
  });

it('沒有錢了怎麼辦拉', ()=>{
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() =>{});
  component.Bet = 100000;
  component.ClickSpin();
  httpMock.expectOne('http://localhost:5141/Slot?bet=100000').flush(
    'No Money Get Out',
    {status: 400, statusText:'Bsd Request'}
  );

  expect(alertSpy).toHaveBeenCalledWith('No Money Get Out');
});

});


