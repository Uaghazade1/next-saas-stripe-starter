import { MagicLinkEmail } from "@/emails/magic-link-email";
import { EmailConfig } from "next-auth/providers/email";
import { Resend } from "resend";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

import { getUserByEmail } from "./user";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationRequest: EmailConfig["sendVerificationRequest"] =
  async ({ identifier, url, provider }) => {
    console.log("Starting email verification request...");
    console.log("Provider:", provider);
    console.log("URL:", url);

    const user = await getUserByEmail(identifier);
    console.log("User found:", user);

    const userVerified = user?.emailVerified ? true : false;
    const authSubject = userVerified
      ? `Sign-in link for ${siteConfig.name}`
      : "Activate your account";

    try {
      console.log("Attempting to send email...");
      console.log("From:", provider.from);
      console.log("To:", identifier);

      const { data, error } = await resend.emails.send({
        from: provider.from,
        to: identifier,
        subject: authSubject,
        react: MagicLinkEmail({
          firstName: user?.name || "there",
          actionUrl: url,
          mailType: userVerified ? "login" : "register",
          siteName: siteConfig.name,
        }),
        // Set this to prevent Gmail from threading emails.
        // More info: https://resend.com/changelog/custom-email-headers
        headers: {
          "X-Entity-Ref-ID": new Date().getTime() + "",
        },
      });

      if (error) {
        console.error("Resend API Error:", error);
        throw new Error(error.message);
      }

      if (!data) {
        console.error("No data returned from Resend");
        throw new Error("No data returned from Resend");
      }

      console.log("Email sent successfully:", data);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email.");
    }
  };
