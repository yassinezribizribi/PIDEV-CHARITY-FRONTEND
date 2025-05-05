import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface EmailTemplate {
  to: string;
  subject: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly BASE_URL = environment.apiUrl;

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('\n\n');
      console.log('%c ========== EMAIL SENT ========== ', 'background: #4CAF50; color: white; font-size: 16px; font-weight: bold; padding: 4px 8px;');
      console.log('%cTo: ' + template.to, 'color: #2196F3; font-weight: bold;');
      console.log('%cSubject: ' + template.subject, 'color: #2196F3; font-weight: bold;');
      console.log('%c----------------------------------------', 'color: #666');
      console.log('%cBody:', 'color: #2196F3; font-weight: bold;');
      console.log(template.body);
      console.log('%c----------------------------------------', 'color: #666');
      console.log('%c ================================== ', 'background: #4CAF50; color: white; font-size: 16px; font-weight: bold; padding: 4px 8px;');
      console.log('\n\n');
      
      if (!environment.production) {
        alert(`Email sent to ${template.to}!\n\nPlease check your browser console (F12) to see the full email content.`);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  getJobApplicationAcceptedTemplate(application: any, jobOffer: any): EmailTemplate {
    const loginUrl = `${environment.baseUrl}/login`;
    const logoUrl = `${environment.baseUrl}/assets/images/logo-dark.png`;
    
    return {
      to: application.applicant.email,
      subject: 'Congratulations! Your Job Application Has Been Accepted',
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { max-width: 200px; height: auto; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 8px; }
            .button { 
              display: inline-block;
              padding: 12px 24px;
              background-color: #2f55d4;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Solidarity & Refugee Platform" class="logo">
            </div>
            <div class="content">
              <h1 style="color: #2f55d4; margin-bottom: 20px;">Congratulations!</h1>
              <p>Dear ${application.applicant.firstName},</p>
              <p>We are delighted to inform you that your application for the position of <strong>${jobOffer.title}</strong> has been accepted!</p>
              
              <h2 style="color: #2f55d4; font-size: 18px; margin-top: 25px;">Next Steps</h2>
              <ul>
                <li>Our team will contact you shortly with additional details about the position</li>
                <li>Please ensure your contact information is up to date</li>
                <li>Review any attached documents or requirements</li>
              </ul>
              
              <h2 style="color: #2f55d4; font-size: 18px; margin-top: 25px;">Position Details</h2>
              <p><strong>Job Title:</strong> ${jobOffer.title}</p>
              <p><strong>Start Date:</strong> To be discussed</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" class="button">View Your Application</a>
              </div>
              
              <p>If you have any questions or need to update your information, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>The Solidarity & Refugee Team</p>
            </div>
            <div class="footer">
              <p>This email was sent by the Solidarity & Refugee Platform. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  getVerificationEmailTemplate(association: any): EmailTemplate {
    const loginUrl = `${environment.baseUrl}/login`;
    const logoUrl = `${environment.baseUrl}/assets/images/logo-dark.png`;
    
    return {
      to: association.subscriber ? association.subscriber.email : association.email,
      subject: 'Your Association Account Has Been Verified',
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { max-width: 200px; height: auto; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 8px; }
            .button { 
              display: inline-block;
              padding: 12px 24px;
              background-color: #2f55d4;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Solidarity & Refugee Platform" class="logo">
            </div>
            <div class="content">
              <h2 style="color: #2f55d4; margin-bottom: 20px;">Congratulations!</h2>
              <p>Dear ${association.associationName},</p>
              <p>We are pleased to inform you that your association account has been verified successfully.</p>
              <p>You can now log in to your account using:</p>
              <ul>
                <li>Email: ${association.subscriber ? association.subscriber.email : association.email}</li>
                <li>Password: The password you created during registration</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" class="button">Login to Your Account</a>
              </div>
              <p>If you've forgotten your password, you can reset it using the "Forgot Password" link on the login page.</p>
              <p>Best regards,<br>The Solidarity & Refugee Team</p>
            </div>
            <div class="footer">
              <p>This email was sent by the Solidarity & Refugee Platform. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  getRejectionEmailTemplate(association: any): EmailTemplate {
    const loginUrl = `${environment.baseUrl}/login`;
    const logoUrl = `${environment.baseUrl}/assets/images/logo-dark.png`;
    
    return {
      to: association.subscriber ? association.subscriber.email : association.email,
      subject: 'Your Association Account Has Been Rejected',
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { max-width: 200px; height: auto; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 8px; }
            .button { 
              display: inline-block;
              padding: 12px 24px;
              background-color: #d9534f;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Solidarity & Refugee Platform" class="logo">
            </div>
            <div class="content">
              <h2 style="color: #d9534f; margin-bottom: 20px;">We're Sorry</h2>
              <p>Dear ${association.associationName},</p>
              <p>After careful consideration, we regret to inform you that your association account did not meet our verification criteria and has been rejected.</p>
              <p>If you believe this is a mistake or if you have additional information to support your application, please contact our support team.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" class="button">Contact Support</a>
              </div>
              <p>Best regards,<br>The Solidarity & Refugee Team</p>
            </div>
            <div class="footer">
              <p>This email was sent by the Solidarity & Refugee Platform. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  sendVerificationEmail(email: string, associationName: string): Promise<boolean> {
    // Build a minimal association object that contains the needed properties
    const association = {
      subscriber: { email },
      associationName
    };
    const template = this.getVerificationEmailTemplate(association);
    return this.sendEmail(template);
  }

  sendRejectionEmail(email: string, associationName: string): Promise<boolean> {
    const association = {
      subscriber: { email },
      associationName
    };
    const template = this.getRejectionEmailTemplate(association);
    return this.sendEmail(template);
  }

  sendJobApplicationAcceptedEmail(application: any, jobOffer: any): Promise<boolean> {
    const template = this.getJobApplicationAcceptedTemplate(application, jobOffer);
    return this.sendEmail(template);
  }
}
