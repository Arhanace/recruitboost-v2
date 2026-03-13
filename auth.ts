import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signInSchema } from "@/lib/validators";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      checks: ["none"],
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        // Find or create user in database
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        if (!existing) {
          const [newUser] = await db
            .insert(users)
            .values({
              email: user.email,
              name: user.name || user.email,
              googleId: account.providerAccountId,
              image: user.image,
            })
            .returning({ id: users.id });
          user.id = newUser.id;
        } else {
          user.id = existing.id;
          // Update googleId if not set
          if (!existing.googleId) {
            await db
              .update(users)
              .set({ googleId: account.providerAccountId })
              .where(eq(users.id, existing.id));
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Fetch latest profile data from DB
      if (token.id) {
        try {
          const [dbUser] = await db
            .select({ sport: users.sport, graduationYear: users.graduationYear, name: users.name, image: users.image })
            .from(users)
            .where(eq(users.id, token.id as string))
            .limit(1);
          if (dbUser) {
            token.sport = dbUser.sport;
            token.graduationYear = dbUser.graduationYear;
            token.name = dbUser.name;
            token.picture = dbUser.image;
          }
        } catch {
          // DB query failed, keep existing token data
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.sport !== undefined) {
        session.user.sport = token.sport as string | null;
      }
      if (token?.graduationYear !== undefined) {
        session.user.graduationYear = token.graduationYear as number | null;
      }
      if (token?.picture !== undefined) {
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },
});
