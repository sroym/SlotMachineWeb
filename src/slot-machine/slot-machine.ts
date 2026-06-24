import { afterNextRender, Component, signal, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {environment} from '../environment/environment';
import { AuthService } from '../app/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-slot-machine',
  imports: [FormsModule],
  templateUrl: './slot-machine.html',
  styleUrl: './slot-machine.scss',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class SlotMachine {
  public UserName = signal('');
  public Name = signal('角子老虎機');
  public WinMoney = signal(0);
  public Money = signal(0);
  Bet: number = 0;

  private isLoading = false;

  constructor(
    private httpService: HttpClient,
    private authService: AuthService,
    private router: Router,
  ) {
    afterNextRender(()=>{
      this.InitReels();
    })
  }

  ngOnInit() {
    this.SetUserInfo();
  }

  public ClickSpin() {
    this.WinMoney.set(0);
    if (this.isLoading) return;
    if(this.Bet<=0){
      alert('請先下注');
      return;
    }
    this.CallSpinApi();
    this.StartRolling();
    // rxjs
    let message = this.Name();
    let AddMessage = ' 哪有賭徒天天輸!';
    if (message.includes(AddMessage)) return;
    message += AddMessage;
    this.Name.set(message);
  }

  private CallSpinApi() {
    this.isLoading = true;
    const currentMoney = this.Money();

    this.httpService.post(`${environment.apiUrl}/Slot?bet=${this.Bet}`, {}, {}).subscribe({
      next: (res: any) => {
        this.StartStopAnimation(res.screen, res.stopIndexes,() => {
          this.WinMoney.set(0);
          this.Money.set(res.userMoney);
          if (res.userMoney > currentMoney) {
            let bet = +this.Bet;
            this.WinMoney.set(res.userMoney - currentMoney + bet);
            alert('恭喜中獎');
          }
          this.isLoading = false;
        });
      },
      error: (err) => {
        if (err.status == 400) alert(err.error);
        clearInterval(this.rollingInterval);
        this.isLoading = false;
      },
      complete: () => {
      },
    });
  }


  private SetUserInfo() {
    this.httpService.get(`${environment.apiUrl}/User`).subscribe({
      next: (res: any) => {
        this.UserName.set(res.name);
        this.Money.set(res.userMoney);
      },

      error: (err) => {
        if (err.status == 400) alert(err.error);
      },
    });
  }

  public ClickLogout() {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }
  private rollingInterval: any = null;
  private readonly REEL_STRIP = ['J', '$', 'K', '$', 'Q', '$'];
  private readonly CELL_HEIGHT = 60;

  private buildReel(colIndex: number, symbols: string[]) {
    const inner = document.getElementById('reel-' + colIndex) as HTMLElement;
    if (!inner) return;
    inner.innerHTML = '';
    inner.style.transition = 'none';
    inner.style.transform = 'translateY(0px)';
    symbols.forEach((sym) => {
      const cell = document.createElement('div');
      cell.className = 'reel-cell';
      cell.textContent = sym;
      inner.appendChild(cell);
    });
  }

  private InitReels() {
    for (let i = 0; i < 5; i++) {
      this.buildReel(i, this.REEL_STRIP)
    }
  }

  private StartRolling() {
    const positions = [0, 0, 0, 0, 0];
    const maxScroll = 17 * this.CELL_HEIGHT;

    this.rollingInterval = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        const inner = document.getElementById('reel-' + i) as HTMLElement;
        if (!inner) continue;
        positions[i] = (positions[i] + 8) % maxScroll;
        inner.style.transform = `translateY(${positions[i]}px)`;
      }
    }, 16);
  }

  private StartStopAnimation(result: string[][], stopIndexes: number[], onComplete?: () => void) {
  clearInterval(this.rollingInterval);

  result.forEach((col, colIndex) => {
    setTimeout(() => {
      const stopIndex = stopIndexes[colIndex];
      const symbols = [
        ...this.REEL_STRIP.slice(stopIndex),
        ...this.REEL_STRIP.slice(0, stopIndex),
        ...this.REEL_STRIP,
      ];
      this.buildReel(colIndex, symbols);
      const inner = document.getElementById('reel-' + colIndex) as HTMLElement;
      if (!inner) return;
      inner.style.transform = `translateY(-${(symbols.length - 3) * this.CELL_HEIGHT}px)`;
      setTimeout(() => {
        inner.style.transition = 'transform 0.8s ease-out';
        inner.style.transform = 'translateY(0px)';
        if (colIndex === result.length - 1) {
          setTimeout(() => onComplete?.(), 800);
        }
      }, 50);
    }, colIndex * 500);
  });
}
}
