import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { TokenService } from '../../../shared/services/token.service';
import { ShowFullScreenLoading } from '../../../shared/services/loading.service';
import { ShowNotification } from '../../../shared/components/notification/notification.component';
import { Router } from '@angular/router';

@Component({
  selector: 'nt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  passwordRepeated = '';
  showForgotPasswordPopup = false;
  showResetPasswordPopup = false;
  tokenForPasswordReset = '';
  capsOn = false;

  constructor(
    private authService: AuthService,
    private urlParamsService: UrlParamsService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = this.urlParamsService.get('token');
    const forgotPassword = this.urlParamsService.get('forgot-password');
    if (token) {
      this.showResetPasswordPopup = true;
      this.tokenForPasswordReset = token;
    }
    if (forgotPassword) {
      this.showForgotPasswordPopup = true;
    }
  }

  @ShowFullScreenLoading()
  @ShowNotification(
    'Login effettuato',
    'Non è stato possibile effettuare il login. Controlla le tue credenziali'
  )
  async doLogin() {
    const loginToken = (await this.authService.login(this.email, this.password)).token;
    this.tokenService.set(loginToken);
    const lastUrl = sessionStorage.getItem('last_url');
    window.location.href = lastUrl ?? '/';
  }

  @ShowFullScreenLoading()
  @ShowNotification(
    'Verifica la tua email',
    "Non è stato possibile inviare l'email. Riprova più tardi"
  )
  async onForgotPassword() {
    const result = await this.authService.forgotPassword(this.email);
    console.log('result: ', result);
  }

  @ShowFullScreenLoading()
  @ShowNotification(
    'Password aggiornata',
    'Non è stato possibile aggiornare la password. Riprova più tardi'
  )
  async onResetPassword() {
    const result = await this.authService.resetPassword(this.tokenForPasswordReset, this.password);
    if (result) {
      const email = this.tokenService.tokenData(this.tokenForPasswordReset).email;
      console.log(`logging in as ${email}`);
      this.email = email;
      setTimeout(() => {
        this.doLogin();
      }, 1500);
    }
  }

  async redirectToSignUp() {
    await this.router.navigateByUrl('/auth/registration');
  }
}
