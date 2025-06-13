import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const userRouter = router({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: (ctx.session as any)?.user?.id,
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        planType: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: (ctx.session as any)?.user?.id,
        },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.planType && { planType: input.planType }),
        },
      })

      return user
    }),

  // Get user statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [projectCount, keywordCount, totalRankings] = await Promise.all([
      ctx.prisma.project.count({
        where: { userId: (ctx.session as any)?.user?.id },
      }),
      ctx.prisma.keyword.count({
        where: {
          project: { userId: (ctx.session as any)?.user?.id },
        },
      }),
      ctx.prisma.ranking.count({
        where: {
          keyword: {
            project: { userId: (ctx.session as any)?.user?.id },
          },
        },
      }),
    ])

    // Calculate average position
    const rankings = await ctx.prisma.ranking.findMany({
      where: {
        keyword: {
          project: { userId: (ctx.session as any)?.user?.id },
        },
      },
      select: {
        position: true,
      },
    })

    const avgPosition = rankings.length > 0
      ? rankings.reduce((sum, r) => sum + r.position, 0) / rankings.length
      : 0

    return {
      projectCount,
      keywordCount,
      totalRankings,
      avgPosition: Math.round(avgPosition * 10) / 10, // Round to 1 decimal
    }
  }),
})
