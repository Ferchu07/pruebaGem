import { RestServiceConnection } from "../restServiceConnection";

export class LoginService extends RestServiceConnection {

  authUserCredentials = async (username: string, password: string, remindMe: boolean) => {
    this.response = await this.makeRequest({
      method: "POST",
      url: "/login",
      data: {
        authUrl: true,
        username,
        password,
        remindMe
      },
    });
    return this;
  };

  authUserGrantAccess = async (companyId: string, userId: string, loginCode: string) => {
    this.response = await this.makeRequest({
      method: "POST",
      url: "/login/grant-access",
      data: {
        authUrl: true,
        companyId,
        userId,
        loginCode
      },
    });
    return this;
  };

  /**
   * Request to send an email with the code to recover the account password:
   * 
   * @param username (string) (NOT NULL)
   * @returns response
   */
  sendEmailForgotPassword = async (username: string) => {
    this.response = await this.makeRequest({
      method: "POST",
      url: "/send-email",
      data: {
        authUrl: true,
        email: username,
      },
    });
    return this;
  };

  /**
   * Request to change the account password with the token provided:    
   * 
   * @param query_token (string) (NOT NULL)
   * @param password (string) (NOT NULL)
   * @param password_confirmation (string) (NOT NULL)
   * @returns response
   */
  resetForgotPassword = async (query_token: string, password: string, password_confirmation: string) => {
    this.response = await this.makeRequest({
      method: "POST",
      url: "/reset-password",
      data: {
        authUrl: true,
        queryToken: query_token,
        password: password,
        passwordConfirmation: password_confirmation,
      },
    });
    return this;
  };

  setInitialPassword = async (activationToken: string, password: string, repeatPassword: string) => {
    this.response = await this.makeRequest({
      method: "POST",
      url: "/set-initial-password",
      data: {
        authUrl: true,
        activationToken : activationToken,
        password : password,
        repeatPassword : repeatPassword,
      },
    });
    return this;
  };

}