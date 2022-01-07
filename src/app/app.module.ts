import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from './materialModule';
import { DrugAutoComponent } from './pages/drug-auto/drug-auto.component';
import { DrugManualComponent } from './pages/drug-manual/drug-manual.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { LoginComponent } from './login/login.component';

import { NavModule } from './components/nav/nav.module';
import { ngxLoadingAnimationTypes, NgxLoadingModule } from 'ngx-loading';
import { NotfoundComponent } from './notfound/notfound.component';

@NgModule({
  declarations: [
    AppComponent,
    DrugAutoComponent,
    DrugManualComponent,
    LoginComponent,
    NotfoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModules,
    NgSelectModule,
    NavModule,
    NgxLoadingModule.forRoot({
      animationType: ngxLoadingAnimationTypes.circleSwish,
      backdropBackgroundColour: 'rgba(0,0,0,0.3)',
      fullScreenBackdrop: false,
      backdropBorderRadius: '0px',
      primaryColour: '#2C397E',
      secondaryColour: '#2C397E',
      tertiaryColour: '#2C397E',
    }),
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
