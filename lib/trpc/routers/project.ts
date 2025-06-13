import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const projectRouter = router({
  // Get all user projects
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({
      where: {
        userId: (ctx.session as any)?.user?.id,
      },
      include: {
        _count: {
          select: {
            keywords: true,
            audits: true,
            backlinks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate average position for each project
    const projectsWithAvgPosition = await Promise.all(
      projects.map(async (project) => {
        const rankings = await ctx.prisma.ranking.findMany({
          where: {
            keyword: {
              projectId: project.id,
            },
          },
          select: {
            position: true,
          },
        })

        const avgPosition = rankings.length > 0
          ? rankings.reduce((sum, r) => sum + r.position, 0) / rankings.length
          : null

        return {
          ...project,
          avgPosition,
        }
      })
    )

    return projectsWithAvgPosition
  }),

  // Get single project by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
          userId: (ctx.session as any)?.user?.id,
        },
        include: {
          keywords: {
            include: {
              rankings: {
                orderBy: {
                  date: 'desc',
                },
                take: 1,
              },
            },
          },
          audits: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          backlinks: {
            orderBy: {
              discovered: 'desc',
            },
          },
        },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      return project
    }),

  // Create new project
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Project name is required'),
        domain: z.string().min(1, 'Domain is required'),
        settings: z.object({}).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('🔍 project.create mutation called with input:', JSON.stringify(input, null, 2))
      console.log('🔍 input type:', typeof input)
      console.log('🔍 input is undefined:', input === undefined)
      console.log('🔍 input is null:', input === null)

      const project = await ctx.prisma.project.create({
        data: {
          name: input.name,
          domain: input.domain,
          userId: (ctx.session as any)?.user?.id,
          settings: input.settings || {},
        },
      })

      return project
    }),

  // Update project
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        domain: z.string().url().optional(),
        settings: z.object({}).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.updateMany({
        where: {
          id: input.id,
          userId: (ctx.session as any)?.user?.id,
        },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.domain && { domain: input.domain }),
          ...(input.settings && { settings: input.settings }),
        },
      })

      if (project.count === 0) {
        throw new Error('Project not found or unauthorized')
      }

      return { success: true }
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.deleteMany({
        where: {
          id: input.id,
          userId: (ctx.session as any)?.user?.id,
        },
      })

      if (project.count === 0) {
        throw new Error('Project not found or unauthorized')
      }

      return { success: true }
    }),
})
