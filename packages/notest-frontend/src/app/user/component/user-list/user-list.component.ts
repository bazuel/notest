import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { NTRoleLabelsMap, NTUser } from '@notest/common';
import { Router } from '@angular/router';
import { ShowFullScreenLoading } from '../../../shared/services/loading.service';

@Component({
  selector: 'nt-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  constructor(private userService: UserService, private router: Router) {}

  users: NTUser[] = [];

  @ShowFullScreenLoading()
  async ngOnInit() {
    this.users = await this.userService.getUsers();
  }

  openUser(userId: string) {
    this.router.navigateByUrl(`/user/user-form?id=${userId}`);
  }

  protected readonly NTRoleLabelsMap = NTRoleLabelsMap;

  openNewUser() {
    this.router.navigateByUrl('/user/user-form');
  }
}
