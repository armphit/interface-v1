import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-drug-manual',
  templateUrl: './drug-manual.component.html',
  styleUrls: ['./drug-manual.component.scss'],
})
export class DrugManualComponent implements OnInit {
  selectedItem: any = '1';
  constructor() {}

  ngOnInit(): void {}
}
