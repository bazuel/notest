import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagesService {
  email = {
    welcomeSubject: 'Welcome to NoTest',
    welcomeBody(name: any, link: string) {
      return `
            Hi ${name},
            welcome to NoTest.
            
            We don't want to bother you. Please confirm your email, and we are done:
            
            <br>
            ${link}
                        
            <br>
            That's all.
            
            <br>
            See you later at NoTest.
            `;
    }
  };
  passwordForgot = {
    emailSubject: 'NoTest: password reset',
    emailBody(link: string) {
      return `
              Please click on the link below to reset your password:
              
              <br>
              ${link}
              
              <br>
              That's all.
              
              <br>
              See you later at NoTest
            `;
    }
  };
}
