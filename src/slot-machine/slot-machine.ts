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
        if (res.userMoney > currentMoney) {
          let bet = +this.Bet;
          alert('恭喜中獎');
          this.WinMoney.set(res.userMoney > currentMoney ? res.userMoney - currentMoney + bet : 0);
        }

        this.Money.set(res.userMoney);
        const result = this.transpose(res.screen);
        this.StartStopAnimation(res.screen);
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
  private rollingInterval: any = null;
  private readonly SYMBOLS = ['7', '$', 'K', 'Q', 'J'];
  private readonly CELL_HEIGHT = 60;
  private readonly VISIBLE_ROWS = 3;

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
      const symbols = Array.from(
        { length: 20 },
        () => this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)],
      );
      this.buildReel(i, symbols);
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

  private StartStopAnimation(result: string[][]) {
    clearInterval(this.rollingInterval);

    result.forEach((col, colIndex) => {
      setTimeout(() => {
        const symbols = [
          ...col,
          ...Array.from(
            { length: 17 },
            () => this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)],
          ),
        ];
        this.buildReel(colIndex, symbols);
        const inner = document.getElementById('reel-' + colIndex) as HTMLElement;
        if (!inner) return;
        inner.style.transform = `translateY(-${17 * this.CELL_HEIGHT}px)`;
        setTimeout(() => {
          inner.style.transition = 'transform 0.8s ease-out';
          inner.style.transform = 'translateY(0px)';
        }, 50);
      }, colIndex * 500);
    });
  }
}
