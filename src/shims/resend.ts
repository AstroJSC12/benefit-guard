interface SendEmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export class Resend {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  emails = {
    send: async (payload: SendEmailPayload) => {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Resend email request failed with status ${response.status}`);
      }

      return response.json();
    },
  };
}
