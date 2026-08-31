import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail } from "@/modules/user/user.repository";
import crypto from "node:crypto";

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) return false;

  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  const originalBuffer = Buffer.from(originalHash, "hex");
  const hashBuffer = Buffer.from(hash, "hex");

  if (originalBuffer.length !== hashBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalBuffer, hashBuffer);
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "HaatBari Login",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        // =========================
        // ADMIN LOGIN
        // =========================
        if (
          email === process.env.ADMIN_EMAIL?.toLowerCase() &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "admin",
            firstName: "HaatBari",
            lastName: "Admin",
            email: process.env.ADMIN_EMAIL,
            role: "admin",
          };
        }

        // =========================
        // BUYER LOGIN
        // =========================
        const user = await findUserByEmail(email);

        if (!user) return null;

        const valid = verifyPassword(credentials.password, user.passwordHash);

        if (!valid) return null;

        return {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: "buyer",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phone = token.phone;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Admin → admin dashboard
      if (url.includes("/admin")) {
        return `${baseUrl}/admin`;
      }

      return `${baseUrl}/account`;
    },
  },

  pages: {
    signIn: "/account/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
