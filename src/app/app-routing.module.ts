import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { NavComponent } from './components/nav/nav.component';
import { AuthGuard } from './guard/auth.guard';
import { LoginComponent } from './login/login.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { DrugAutoComponent } from './pages/drug-auto/drug-auto.component';
import { DrugManualComponent } from './pages/drug-manual/drug-manual.component';

const routes: Routes = [
  {
    path: '',
    component: NavComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: 'drug-auto',
        component: DrugAutoComponent,
      },
      {
        path: 'drug-manual',
        component: DrugManualComponent,
      },
      {
        path: '',
        redirectTo: 'drug-auto',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '**',
    component: NotfoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
