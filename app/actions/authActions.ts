"use server"; // Indica que todas as funções neste ficheiro são executadas apenas no servidor por segurança, assim nunca expõe a lógica de base de dados ao cliente.

import { hash } from "bcryptjs";
import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: adapter as any });

/**
 * Server Action: Register a new user
 *
 * This function:
 * 1. Hashes the password using bcrypt
 * 2. Creates the user (Account) in the database
 * 3. Creates initial Score records for all games (chess, checkers, sueca)
 *
 * @param username - User's display name
 * @param email - User's email (must be unique)
 * @param password - Plain text password (will be hashed)
 * @returns Object with success/error status
 */
export async function registerUser(
	username: string,
	email: string,
	password: string
): Promise<{ success: boolean; message: string; userId?: string }> {
	try {
		// Validate input
		if (!username || !email || !password) {
			return { success: false, message: "Missing required fields" };
		}

		// Check if user already exists
		const existingUser = await prisma.account.findFirst({
			where: {
				OR: [{ email }, { username }],
			},
		});

		if (existingUser) {
			return {
				success: false,
				message: "Email or username already in use",
			};
		}

		// Hash password with bcrypt (cost: 10 rounds)
		const passwordHash = await hash(password, 10);

		// Create user in the database
		const account = await prisma.account.create({
			data: {
				username,
				email,
				passwordHash,
			},
		});

		// Create initial Score records for all games.
		// Promise.all creates three rows (chess/checkers/sueca) with zeroed counters.
		const games = ["chess", "checkers", "sueca"];
		await Promise.all(
			games.map((game) =>
				prisma.score.create({
					data: {
						game: game as "chess" | "checkers" | "sueca",
						accountId: account.id,
						gamesPlayed: 0,
						gamesWon: 0,
						gamesLost: 0,
					},
				})
			)
		);

		return {
			success: true,
			message: "User registered successfully",
			userId: account.id,
		};
	} catch (error) {
		console.error("[registerUser] Error:", error);
		return {
			success: false,
			message: "Failed to register user",
		};
	} finally {
		await prisma.$disconnect(); //fecha a ligação a db
	}
}
