import { Component } from '@angular/core';
import { HttpsService } from './services/https.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'interface-v1';
  constructor(public https: HttpsService) {}
  navLinks = [
    { path: '/drug-auto', label: 'AUTO' },
    { path: '/drug-manual', label: 'MANUAL' },
  ];
}
