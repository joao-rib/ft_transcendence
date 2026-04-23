import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const users = await prisma.account.findMany({
    orderBy: { rating: 'desc' },
    take: 10,
  })

  const leaderboard = users.map((u, index) => ({
    rank: index + 1,
    username: u.username,
    wins: u.wins,
    losses: u.losses,
    rating: u.rating,
    winRate: (u.wins / (u.wins + u.losses)) * 100,
  }))

  return Response.json(leaderboard)
}