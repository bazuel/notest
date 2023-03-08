import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NTUser } from '@notest/common';
import { ShowFullScreenLoading } from '../../../shared/services/loading.service';
import { ShowNotification } from '../../../shared/components/notification/notification.component';
import { Router } from '@angular/router';

@Component({
  selector: 'nt-signin',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  user!: NTUser;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = {
      password: '',
      phone: '',
      email: '',
      name: '',
      roles: [],
      state: '',
      surname: ''
    } as unknown as NTUser;
  }

  @ShowFullScreenLoading()
  @ShowNotification('Verify your email', 'Send email was not possible. Try later')
  async doSignIn() {
    const result = await this.authService.signIn(this.user);
    if (result.ok) await this.router.navigateByUrl('/auth/login');
  }
}
