import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  username: z.string().trim().min(3).max(32),
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = signupSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid signup data." },
        { status: 400 },
      );
    }

    const { username, email, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 10);

    const account = await prisma.account.create({
      data: {
        username,
        email,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this username or email already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create account." },
      { status: 500 },
    );
  }
}
