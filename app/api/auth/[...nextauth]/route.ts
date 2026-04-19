import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

// Type augmentation to extend Session to include user id
declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id?: string;
	}
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: adapter as any });

/**
 * NextAuth Configuration
 *
 * This configures authentication with:
 * - Credentials Provider: Email/password authentication
 * - Prisma Adapter: Syncs sessions/tokens with database
 * - Callbacks: Customizes session and JWT tokens
 */
const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma) as any, // Type assertion for compatibility
	providers: [
		CredentialsProvider({
			// Display name for the provider (shown in sign-in UI)
			name: "Credentials",
			// Fields presented in sign-in form
			credentials: {
				email: {
					label: "Email",
					type: "email",
					placeholder: "user@example.com",
				},
				password: { label: "Password", type: "password" },
			},
			/**
			 * Authorize function: validates credentials against database
			 * Called when user submits login form
			 */
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email and password are required");
				}

				// Find user by email
				const account = await prisma.account.findUnique({
					where: { email: credentials.email },
				});

				if (!account || !account.passwordHash) {
					throw new Error("Invalid email or password");
				}

				// Compare provided password with stored hash
				const isPasswordValid = await compare(
					credentials.password,
					account.passwordHash
				);

				if (!isPasswordValid) {
					throw new Error("Invalid email or password");
				}

				// Return user object (must include 'id')
				return {
					id: account.id,
					email: account.email,
					name: account.username,
					image: account.avatarUrl,
				};
			},
		}),
	],
	/**
	 * Session strategy: JWT tokens stored in HTTP-only cookies
	 * NextAuth automatically manages session lifecycle
	 */
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	/**
	 * JWT callback: runs when JWT token is created/updated
	 * Used to add custom claims to the token
	 */
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.name = user.name;
			}
			return token;
		},
		/**
		 * Session callback: runs when session is accessed
		 * Customizes what data is available to client via useSession()
		 */
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.name = token.name as string;
			}
			return session;
		},
	},
	pages: {
		signIn: "/", // Redirect to home on sign-in
		error: "/", // Redirect errors to home
	},
	secret: process.env.NEXTAUTH_SECRET,
};

// Export handlers for GET and POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Export for use in other files (e.g., middleware)
export default authOptions;
