import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComponent } from './component/user/user.component';
import { UserService } from './services/user.service';
import { RouterModule, Routes } from '@angular/router';
import { IsLogged } from '../shared/services/is-logged.guard';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserListComponent } from './component/user-list/user-list.component';
import { IsAdmin } from '../shared/services/is-admin.guard';

const userRoutes: Routes = [
  { path: 'user-form', component: UserComponent, canActivate: [IsLogged] },
  { path: 'user-list', component: UserListComponent, canActivate: [IsAdmin] }
];

@NgModule({
  declarations: [UserComponent, UserListComponent],
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
