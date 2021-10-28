import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from './materialModule';
import { DrugAutoComponent } from './pages/drug-auto/drug-auto.component';
import { DrugManualComponent } from './pages/drug-manual/drug-manual.component';

@NgModule({
  declarations: [AppComponent, DrugAutoComponent, DrugManualComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModules,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
