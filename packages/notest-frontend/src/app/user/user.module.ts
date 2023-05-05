import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComponent } from './component/user/user.component';
import { UserService } from './services/user.service';
import { RouterModule, Routes } from '@angular/router';
import { IsLogged } from '../shared/services/is-logged.guard';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const userRoutes: Routes = [
  { path: 'settings', component: UserComponent, canActivate: [IsLogged] }
];

@NgModule({
  declarations: [UserComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(userRoutes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [UserService]
})
export class UserModule {}
