import "dayjs/locale/it";
import dayjs from "dayjs";
import { messageService } from "../../services/message.service";

export class TokenService {
  static TOKEN = "NOTEST_TOKEN";
  static TOKEN_TEMP = "NOTEST_TOKEN_TEMP";

  get temporaryToken() {
    return localStorage.getItem(TokenService.TOKEN_TEMP);
  }

  has() {
    return (
      sessionStorage.getItem(TokenService.TOKEN) != null ||
      localStorage.getItem(TokenService.TOKEN) != null
    );
  }

  async getToken() {
    const response = await messageService.sendMessage<{ value: string }>(
      "get-storage",
      { key: TokenService.TOKEN },
      true
    );
    console.log("get token response");
    return response.value;
  }

  set token(value: string) {
    messageService.sendMessage("set-storage", {
      key: TokenService.TOKEN,
      value,
    });
  }

  setTemporaryToken(token: string) {
    localStorage.setItem(
      TokenService.TOKEN_TEMP,
      localStorage.getItem(TokenService.TOKEN)!
    );
    sessionStorage.setItem(TokenService.TOKEN, token);
  }

  restoreTemporaryToken(input) {
    if (!localStorage.getItem(TokenService.TOKEN_TEMP))
      throw new Error("Token not available");
    this.token = localStorage.getItem(TokenService.TOKEN_TEMP);
    localStorage.removeItem(TokenService.TOKEN_TEMP);
    sessionStorage.removeItem(TokenService.TOKEN);
  }

  async hasRole(roleName: string) {
    const roles = await this.roles();
    return roles.indexOf(roleName) >= 0;
  }

  async roles(): Promise<string[]> {
    const tdata = await this.tokenData();
    const roles = tdata && tdata.roles ? tdata.roles : [];
    return roles;
  }

  isImpersonated() {
    return !!this.impersonatedBy();
  }

  async impersonatedBy() {
    let impersonating = "";
    if (localStorage.getItem(TokenService.TOKEN_TEMP))
      impersonating = (
        await this.tokenData(localStorage.getItem(TokenService.TOKEN_TEMP)!)
      )?.sub;
    return impersonating;
  }

  logout() {
    this.token = "";
  }

  login(token: string) {
    this.token = token;
  }

  async username(): Promise<string | undefined> {
    return (await this.tokenData())?.sub;
  }

  async isExpired(): Promise<boolean> {
    const token = await this.tokenData();
    if (token) {
      const tokenExp = dayjs(token.exp * 1000);
      return dayjs().isAfter(tokenExp);
    }
    return true;
  }

  async tokenData(token?: string) {
    const t = token ?? (await this.getToken());
    const tdata = t ? JSON.parse(atob(t!.split(".")[1])) : null;
    return tdata;
  }

  async logged() {
    return !(await this.isExpired());
  }
}

export const tokenService = new TokenService();
