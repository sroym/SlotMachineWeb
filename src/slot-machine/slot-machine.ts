import { Component, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-slot-machine',
  imports: [FormsModule],
  templateUrl: './slot-machine.html',
  styleUrl: './slot-machine.css',
})
export class SlotMachine {
  public Name = signal('角子老虎機');
  public Money = signal(0);
  public Screen = signal([[]]);
  public isSpin = signal(false);
  protected Bet: number = 0;

  constructor(private httpService: HttpClient) {}

  public ClickSpin() {
    this.CallSpinApi();
    let message = this.Name();
    let AddMessage = ' 開張啦!';
    if (message.includes(AddMessage)) return;
    message += AddMessage;
    this.Name.set(message);
  }

  private CallSpinApi() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }),
    };
    this.httpService
      .post(`http://localhost:5141/Slot?bet=${this.Bet}`, {}, httpOptions)
      .subscribe((res: any) => {
        this.Money.set(res.winMoney);
        this.Screen.set(res.screen);
        if(this.Money() > 0) alert('恭喜中獎');
        if(!this.isSpin())this.isSpin.set(true);
      });
  }

  protected readonly screen = screen;
}
