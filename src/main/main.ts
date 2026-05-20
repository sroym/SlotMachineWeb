import { Component } from '@angular/core';
import { SlotMachine } from '../slot-machine/slot-machine';

@Component({
  selector: 'app-main',
  imports: [SlotMachine],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {}
