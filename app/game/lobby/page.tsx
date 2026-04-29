import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import authOptions from "@/app/api/auth/[...nextauth]/route";
import LobbyPageClient from "./LobbyPageClient";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: adapter as any });

export default async function LobbyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const account = await prisma.account.findUnique({
    where: { id: session.user.id },
    select: { onlineStatus: true },
  });

  if (!account || account.onlineStatus !== "ONLINE") {
    redirect("/");
  }

  return <LobbyPageClient />;
}