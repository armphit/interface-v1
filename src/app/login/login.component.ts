import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { HttpsService } from '../services/https.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public inputGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  constructor(private http: HttpsService, private formBuilder: FormBuilder) {
    // this.authService.signOut();
    // console.log(1234);
  }

  ngOnInit() {}

  signInWithGoogle(): void {
    // this.authService
    //   .signIn(GoogleLoginProvider.PROVIDER_ID)
    //   .then((x) => {
    //     this.service.alertLog('success', 'Login Success');
    //     sessionStorage.setItem('APP_TOKEN', x.idToken);
    //     this.service.navRouter('/');
    //   })
    //   .catch(yourHandler);
  }

  signInWithFB(): void {
    // this.authService
    //   .signIn(FacebookLoginProvider.PROVIDER_ID)
    //   .then((x) => console.log(x));
  }

  public submitInput() {
    let data = {
      email: this.inputGroup.value.name,
      password: this.inputGroup.value.password,
    };

    // let login: any = await this.http.loginNodejs('login', data);
    // if (login.response.token) {
    //   sessionStorage.setItem('APP_TOKEN', login.response.token);
    //   this.http.alertLog('success', 'Login Success.');
    //   this.http.navRouter('/');
    // } else {
    //   this.http.alertLog('error', 'Login failure.');
    // }

    this.http
      .loginNodejs('login', data)
      .then((login: any) => {
        if (login.connect == true) {
          sessionStorage.setItem('APP_TOKEN', login.response.token);
          this.http.alertLog('success', 'Login Success.');
          this.http.navRouter('/');
        } else {
          this.http.alertLog('error', 'Login failure.');
        }
      })
      .catch((error) => {
        this.http.alertLog('error', 'Login failure.');
      });
  }
}
