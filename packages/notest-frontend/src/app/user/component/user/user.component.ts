import { Component, OnInit } from '@angular/core';
import { NTUser } from '@notest/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'nt-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user!: NTUser;
  password?: string;
  newPassword?: string;
  constructor(private userService: UserService) {}

  async ngOnInit() {
    this.user = await this.userService.getUserById();
  }
}
