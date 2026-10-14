import nodemailer from "nodemailer";

export type Mailer = {
  sendMail: (opts: {
    to: string;
    subject: string;
    text: string;
  }) => Promise<void>;
};

export const createMailer = (): Mailer => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 1025);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? "Vidya <noreply@vidya.local>";

  if (!host) {
    // Dev fallback: log OTP emails to the API console when SMTP is unset.
    return {
      async sendMail({ to, subject, text }) {
        console.info("[mailer:console]", { to, subject, text });
      },
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  return {
    async sendMail({ to, subject, text }) {
      await transporter.sendMail({ from, to, subject, text });
    },
  };
};

export const sendOtpEmail = async (
  mailer: Mailer,
  opts: { to: string; otp: string; purpose: "VERIFY_EMAIL" | "RESET_PASSWORD" }
): Promise<void> => {
  const isVerify = opts.purpose === "VERIFY_EMAIL";
  const subject = isVerify
    ? "Verify your Vidya account"
    : "Reset your Vidya password";
  const action = isVerify ? "verify your email" : "reset your password";
  const text = [
    `Your Vidya one-time code is: ${opts.otp}`,
    "",
    `Use this code to ${action}.`,
    "It expires in 10 minutes and can be used only once.",
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  await mailer.sendMail({ to: opts.to, subject, text });
};
