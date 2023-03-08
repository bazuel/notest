import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RegistrationComponent } from './components/registration/registration.component';
import { NotestSharedModule } from '../notest-shared/notest-shared.module';
import { RegistrationSuccessComponent } from './components/registration/registration-success.component';

const authRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'registration-success', component: RegistrationSuccessComponent }
];

@NgModule({
  declarations: [LoginComponent, RegistrationComponent, RegistrationSuccessComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(authRoutes),
    FormsModule,
    SharedModule,
    NotestSharedModule
  ]
})
export class AuthModule {}
