import { betterAuth } from "better-auth";
import { organization, twoFactor } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    },
  },
  plugins: [
    organization(),
    twoFactor(),
    passkey(),
  ],
});