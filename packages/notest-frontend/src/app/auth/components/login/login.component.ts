import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { TokenService } from '../../../shared/services/token.service';
import { ShowFullScreenLoading } from '../../../shared/services/loading.service';
import { ShowNotification } from '../../../shared/components/notification/notification.component';
import { Router } from '@angular/router';
import { HttpService } from '../../../shared/services/http.service';

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
  showCustomBackendPopup = false;
  customBackendUrl = '';
  tokenForPasswordReset = '';
  capsOn = false;
  backendIsCustom = false;

  constructor(
    private authService: AuthService,
    private urlParamsService: UrlParamsService,
    private tokenService: TokenService,
    private router: Router,
    protected httpService: HttpService
  ) {}

  async ngOnInit() {
    const token = this.urlParamsService.get('token');
    const forgotPassword = this.urlParamsService.get('forgot-password');
    if (token) {
      this.showResetPasswordPopup = true;
      this.tokenForPasswordReset = token;
    }
    if (forgotPassword) {
      this.showForgotPasswordPopup = true;
    }
    this.updateBackendInfo();
  }

  @ShowFullScreenLoading()
  @ShowNotification(
    'Login effettuato',
    'Non è stato possibile effettuare il login. Controlla le tue credenziali o <b>il server utilizzato</b>'
  )
  async doLogin() {
    let loginToken;
    await this.authService
      .login(this.email, this.password)
      .then((res) => (loginToken = res.token))
      .catch((e) => {
        this.showCustomBackendPopup = true;
        throw e;
      });
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

  async onCustomBackendUrlChange(switched: boolean) {
    if (switched) this.customBackendUrl = await this.httpService.getCustomBackendUrl();
    else this.httpService.setCustomBackendUrl('');
  }

  async redirectToSignUp() {
    await this.router.navigateByUrl('/auth/registration');
  }

  async updateBackendInfo() {
    this.backendIsCustom = await this.httpService.backendIsCustom();
    if (this.backendIsCustom) this.customBackendUrl = await this.httpService.getCustomBackendUrl();
  }
}
