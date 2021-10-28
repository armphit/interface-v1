import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'interface-v1';

  navLinks = [
    { path: '/drug-auto', label: 'AUTO' },
    { path: '/drug-manual', label: 'MANUAL' },
  ];
}
