// Typical Process
import { prisma } from "@/lib/prisma"; // TODO Include real path to prisma client

/*
[ Browser ]
     ↓
(fetch)
     ↓
[ Next.js API / Server ]
     ↓
(Prisma)
     ↓
[ PostgreSQL ]
 */

// Get values from table Account.scores, from user with id "A"
// Step 1 — Backend (API route)
export async function GET() {
  const user = await prisma.account.findUnique({
    where: { id: "A" },
    include: { scores: true }
  });

  return Response.json(user);
}

// Step 2 — Frontend calls API
const response = await fetch("/api/user");
const user = await response.json();

// In Next.js, server components can use Prisma directly
// app/dashboard/page.tsx

export default async function Page() {
  const user = await prisma.account.findMany();

  return <div>{user.length}</div>;
}
