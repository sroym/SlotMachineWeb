import { Component, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {forceAutocomplete} from "@angular/cli/src/utilities/environment-options";
import { getLocaleCurrencyName } from '@angular/common';

@Component({
  selector: 'app-slot-machine',
  imports: [FormsModule],
  templateUrl: './slot-machine.html',
  styleUrl: './slot-machine.css',
})
export class SlotMachine {
  public UserName = signal('');
  public Name = signal('角子老虎機');
  public WinMoney = signal(0);
  public Money = signal(0);
  public Screen = signal([[]]);
  public isSpin = signal(false);
  public TransposedScreen = signal<string[][]>([]);
  protected Bet: number = 0;

  private isLoading = false;

  constructor(private httpService: HttpClient) {}

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

    this.httpService.post(`http://localhost:5141/Slot?bet=${this.Bet}`, {}, {}).subscribe({
      next: (res: any) => {
        if (res.userMoney > currentMoney) {
          alert('恭喜中獎');
        }
        this.WinMoney.set(res.userMoney > currentMoney? res.userMoney - currentMoney :0);
        this.Money.set(res.userMoney);
        this.Screen.set(res.screen);
        this.TransposedScreen.set(this.Transpose(res.screen));
        if (!this.isSpin()) this.isSpin.set(true);
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
    this.httpService.get(`http://localhost:5141/User`, httpOptions).subscribe({
      next: (res: any) => {
        this.UserName.set(res.name);
        this.Money.set(res.userMoney);
      },

      error: (err) => {
        if (err.status == 400) alert(err.error);
      },
    });
  }

  private Transpose(screen: string[][]): string[][] {
    const rows = screen[0].length;
    const cols = screen.length;
    return Array.from({ length: rows }, (_, rowIndex) =>
      Array.from({ length: cols }, (_, colIndex) => screen[colIndex][rowIndex]),
    );
  }
}
