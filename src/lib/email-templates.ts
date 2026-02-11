const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #f8fafc;
    color: #0f172a;
  }
  .wrapper {
    width: 100%;
    padding: 24px 12px;
    box-sizing: border-box;
  }
  .card {
    max-width: 560px;
    margin: 0 auto;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
  }
  .brand {
    margin: 0 0 8px;
    color: #0f766e;
    font-size: 24px;
    font-weight: 700;
  }
  .title {
    margin: 0 0 12px;
    font-size: 20px;
    font-weight: 600;
    color: #0f172a;
  }
  .text {
    margin: 0 0 16px;
    line-height: 1.6;
    color: #334155;
  }
  .button {
    display: inline-block;
    padding: 12px 20px;
    background: #0f766e;
    border-radius: 8px;
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 600;
  }
  .muted {
    margin-top: 20px;
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
    word-break: break-all;
  }
`;

function wrapTemplate(content: string) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">${content}</div>
        </div>
      </body>
    </html>
  `;
}

export function buildVerificationEmailTemplate(verificationLink: string) {
  return wrapTemplate(`
    <h1 class="brand">BenefitGuard</h1>
    <h2 class="title">Verify your account</h2>
    <p class="text">Thanks for signing up. Please confirm your email address to keep your account secure.</p>
    <p><a class="button" href="${verificationLink}">Verify Email</a></p>
    <p class="muted">If the button does not work, copy and paste this link into your browser:<br/>${verificationLink}</p>
  `);
}

export function buildPasswordResetEmailTemplate(resetLink: string) {
  return wrapTemplate(`
    <h1 class="brand">BenefitGuard</h1>
    <h2 class="title">Reset your password</h2>
    <p class="text">We received a request to reset your password. Use the button below to choose a new one. This link expires in 1 hour.</p>
    <p><a class="button" href="${resetLink}">Reset Password</a></p>
    <p class="muted">If the button does not work, copy and paste this link into your browser:<br/>${resetLink}</p>
  `);
}
