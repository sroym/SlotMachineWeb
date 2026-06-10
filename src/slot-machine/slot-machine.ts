import { Component, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {environment} from '../environment/environment';
import {forceAutocomplete} from "@angular/cli/src/utilities/environment-options";
import { getLocaleCurrencyName } from '@angular/common';
import { AuthService } from '../app/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-slot-machine',
  imports: [FormsModule],
  templateUrl: './slot-machine.html',
  styleUrl: './slot-machine.css',
  standalone: true,
})
export class SlotMachine {
  public UserName = signal('');
  public Name = signal('角子老虎機');
  public WinMoney = signal(0);
  public Money = signal(0);
  public TransposedScreen = signal<string[][]>([]);
  public realWinMoney = signal(0);
  Bet: number = 0;

  private isLoading = false;

  constructor(private httpService: HttpClient, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.SetUserInfo();
  }

  public ClickSpin() {
    this.CallSpinApi();
    // rxjs
    let message = this.Name();
    let AddMessage = ' 哪有賭徒天天輸!';
    if (message.includes(AddMessage)) return;
    message += AddMessage;
    this.Name.set(message);
  }

  private CallSpinApi() {
    if (this.isLoading) return;
    this.isLoading = true;

    const currentMoney = this.Money();

    this.httpService.post(`${environment.apiUrl}/Slot?bet=${this.Bet}`, {}, {}).subscribe({
      next: (res: any) => {
        if (res.userMoney > currentMoney) {
          let bet = +this.Bet;
          alert('恭喜中獎');
          this.WinMoney.set(res.userMoney > currentMoney ? res.userMoney - currentMoney + bet : 0);
        }
        console.log(
          'currentMoney:',
          currentMoney,
          'res.userMoney:',
          res.userMoney,
          'this.bet:',
          this.Bet,
        );
        console.log(typeof this.Bet);
        this.Money.set(res.userMoney);
        this.TransposedScreen.set(this.transpose(res.screen));
      },
      error: (err) => {
        if (err.status == 400) alert(err.error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private SetUserInfo() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }),
    };
    this.httpService.get(`${environment.apiUrl}/User`, httpOptions).subscribe({
      next: (res: any) => {
        this.UserName.set(res.name);
        this.Money.set(res.userMoney);
      },

      error: (err) => {
        if (err.status == 400) alert(err.error);
      },
    });
  }

  private transpose(screen: string[][]): string[][] {
    const rows = screen.length;
    const cols = screen[0].length;

    return Array.from({ length: cols }, (_, colIndex) =>
      Array.from({ length: rows }, (_, rowIndex) => {
        if (colIndex === 1) {
          return screen[rows - 1 - rowIndex][colIndex];
        }

        return screen[rowIndex][colIndex];
      }),
    );
  }

  public ClickLogout() {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }
}
