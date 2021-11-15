import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DrugAutoComponent } from './pages/drug-auto/drug-auto.component';
import { DrugManualComponent } from './pages/drug-manual/drug-manual.component';

const routes: Routes = [
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
    redirectTo: 'drug-manual',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
