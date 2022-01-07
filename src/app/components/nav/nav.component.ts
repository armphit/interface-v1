import { Component, OnInit } from '@angular/core';
import { HttpsService } from 'src/app/services/https.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  navLinks = [
    { path: '/drug-auto', label: 'AUTO' },
    { path: '/drug-manual', label: 'MANUAL' },
  ];
  constructor(private service: HttpsService) {}

  ngOnInit(): void {}
  signOut(): void {
    this.service.alertLog('error', 'Logout Success');
    sessionStorage.removeItem('APP_TOKEN');
    this.service.navRouter('/login');
  }
}
