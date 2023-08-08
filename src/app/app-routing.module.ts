import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgriculturalComponent } from './components/agricultural/agricultural.component';
import { NonAgriculturalComponent } from './components/non-agricultural/non-agricultural.component';
import { TruckComponent } from './components/truck/truck.component';

const routes: Routes = [
  { path:'agricultural', component: AgriculturalComponent},
  { path:'non-agricultural', component: NonAgriculturalComponent},
  { path:'truck', component: TruckComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
