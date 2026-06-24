import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlotMachine } from './slot-machine';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../environment/environment';
import { AuthService } from '../app/auth/auth.service';
import { routes } from '../app/app.routes';
import { provideRouter, Router } from '@angular/router';

describe('SlotMachine', () => {
  let component: SlotMachine;
  let fixture: ComponentFixture<SlotMachine>;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotMachine],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(routes),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SlotMachine);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);

    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/User`).flush({
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
    component.Bet = 10;
    component.ClickSpin();
    httpMock.expectOne(`${environment.apiUrl}/Slot?bet=10`).flush({
      userMoney: 1000,
      screen: [['$','$','$'],['$','$','$'],['$','$','$'],['$','$','$'],['$','$','$']],
      stopIndexes:[0, 0, 0, 0, 0],
    });
    expect(component.Name()).toBe('角子老虎機 哪有賭徒天天輸!');

  });

  it('should show balance', () => {
    expect(component.Money()).toBe(1000);
  });

  it('贏了',() =>{
    component.Bet = 10;
    component.ClickSpin();
    httpMock.expectOne(`${environment.apiUrl}/Slot?bet=10`).flush({
      userMoney: 1090,
      screen: [
        ['7','h','$'],
        ['$','$','$'],
        ['7','2','$'],
        ['$','$','$'],
        ['7','$','$']
      ],
      stopIndexes:[0, 0, 0, 0, 0],
    });
    expect(component.Money()).toBe(1000);
  });


  it('輸了', () => {
    component.Bet = 10;
    component.ClickSpin();
    httpMock.expectOne(`${environment.apiUrl}/Slot?bet=10`).flush({
      userMoney: 990,
      screen: [
        ['7', 'h', '$'],
        ['$', '$', '$'],
        ['7', '2', '$'],
        ['$', '$', '$'],
        ['7', '$', '$'],
      ],
      stopIndexes: [0, 0, 0, 0, 0],
    });
    expect(component.WinMoney()).toBe(0);
    expect(component.Money()).toBe(1000);
  });

  it('載入使用者名字', () =>{
    expect(component.UserName()).toBe(('Roy'));
  });

it('沒有錢了怎麼辦拉', ()=>{
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() =>{});
  component.Bet = 100000;
  component.ClickSpin();
  httpMock.expectOne(`${environment.apiUrl}/Slot?bet=100000`).flush(
    'No Money Get Out',
    {status: 400, statusText:'Bsd Request'}
  );

  expect(alertSpy).toHaveBeenCalledWith('No Money Get Out');
});
  it('登出後被清除token並跳回登入頁面', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    authService.SetToken('fake-token');

    component.ClickLogout();

    expect(authService.GetToken()).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

});


