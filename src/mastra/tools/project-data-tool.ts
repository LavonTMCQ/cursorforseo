import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";

export const projectDataTool = createTool({
  id: "project-data",
  description: "Access and analyze existing SEO project data from the database",
  inputSchema: z.object({
    action: z.enum(["get_projects", "get_project", "get_keywords", "get_rankings", "get_audits"]),
    projectId: z.string().optional().describe("Project ID for specific project queries"),
    userId: z.string().optional().describe("User ID to filter projects"),
    limit: z.number().default(10).describe("Limit number of results"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any().describe("Requested data based on action"),
    summary: z.object({
      totalProjects: z.number().optional(),
      totalKeywords: z.number().optional(),
      averageRanking: z.number().optional(),
      lastAuditDate: z.string().optional(),
    }).optional(),
    insights: z.array(z.string()).optional().describe("AI-generated insights from the data"),
  }),
  execute: async ({ context }) => {
    const { action, projectId, userId, limit } = context;

    try {
      let data: any;
      let summary: any = {};
      let insights: string[] = [];

      switch (action) {
        case "get_projects":
          data = await prisma.project.findMany({
            where: userId ? { userId } : undefined,
            take: limit,
            include: {
              keywords: {
                take: 5,
                include: {
                  rankings: {
                    take: 1,
                    orderBy: { date: "desc" },
                  },
                },
              },
              audits: {
                take: 1,
                orderBy: { createdAt: "desc" },
              },
            },
          });

          summary.totalProjects = data.length;
          insights = generateProjectInsights(data);
          break;

        case "get_project":
          if (!projectId) {
            throw new Error("Project ID is required for get_project action");
          }

          data = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
              keywords: {
                include: {
                  rankings: {
                    orderBy: { date: "desc" },
                    take: 10,
                  },
                },
              },
              audits: {
                orderBy: { createdAt: "desc" },
                take: 5,
              },
              user: {
                select: { name: true, email: true },
              },
            },
          });

          if (data) {
            summary.totalKeywords = data.keywords.length;
            summary.averageRanking = calculateAverageRanking(data.keywords);
            summary.lastAuditDate = data.audits[0]?.createdAt.toISOString();
            insights = generateSingleProjectInsights(data);
          }
          break;

        case "get_keywords":
          const whereClause = projectId ? { projectId } : {};
          data = await prisma.keyword.findMany({
            where: whereClause,
            take: limit,
            include: {
              rankings: {
                orderBy: { date: "desc" },
                take: 5,
              },
              project: {
                select: { name: true, domain: true },
              },
            },
          });

          summary.totalKeywords = data.length;
          summary.averageRanking = calculateAverageRanking(data);
          insights = generateKeywordInsights(data);
          break;

        case "get_rankings":
          const keywordFilter = projectId 
            ? { keyword: { projectId } }
            : {};

          data = await prisma.ranking.findMany({
            where: keywordFilter,
            take: limit,
            orderBy: { date: "desc" },
            include: {
              keyword: {
                include: {
                  project: {
                    select: { name: true, domain: true },
                  },
                },
              },
            },
          });

          summary.averageRanking = data.length > 0 
            ? data.reduce((sum, r) => sum + r.position, 0) / data.length 
            : 0;
          insights = generateRankingInsights(data);
          break;

        case "get_audits":
          const auditFilter = projectId ? { projectId } : {};
          data = await prisma.siteAudit.findMany({
            where: auditFilter,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
              project: {
                select: { name: true, domain: true },
              },
            },
          });

          summary.lastAuditDate = data[0]?.createdAt.toISOString();
          insights = generateAuditInsights(data);
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return {
        success: true,
        data,
        summary,
        insights,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        summary: undefined,
        insights: [`Error accessing project data: ${error.message}`],
      };
    }
  },
});

function calculateAverageRanking(keywords: any[]): number {
  if (!keywords.length) return 0;
  
  const totalRankings = keywords.reduce((sum, keyword) => {
    const latestRanking = keyword.rankings?.[0]?.position || 0;
    return sum + latestRanking;
  }, 0);
  
  return Math.round(totalRankings / keywords.length);
}

function generateProjectInsights(projects: any[]): string[] {
  const insights: string[] = [];
  
  if (projects.length === 0) {
    insights.push("No projects found. Consider creating your first SEO project to start tracking keywords and rankings.");
    return insights;
  }

  const totalKeywords = projects.reduce((sum, p) => sum + (p.keywords?.length || 0), 0);
  const avgKeywordsPerProject = Math.round(totalKeywords / projects.length);
  
  insights.push(`You have ${projects.length} active SEO projects with an average of ${avgKeywordsPerProject} keywords per project.`);
  
  const projectsWithRecentAudits = projects.filter(p => p.audits?.length > 0).length;
  if (projectsWithRecentAudits < projects.length) {
    insights.push(`${projects.length - projectsWithRecentAudits} projects need fresh SEO audits to identify optimization opportunities.`);
  }

  return insights;
}

function generateSingleProjectInsights(project: any): string[] {
  const insights: string[] = [];
  
  if (!project) {
    insights.push("Project not found.");
    return insights;
  }

  insights.push(`Project "${project.name}" for domain ${project.domain} is tracking ${project.keywords.length} keywords.`);
  
  if (project.keywords.length > 0) {
    const rankedKeywords = project.keywords.filter(k => k.rankings?.length > 0);
    const avgPosition = calculateAverageRanking(project.keywords);
    
    insights.push(`Average ranking position: ${avgPosition}. ${rankedKeywords.length} keywords have ranking data.`);
    
    const topRankingKeywords = project.keywords
      .filter(k => k.rankings?.[0]?.position <= 10)
      .length;
    
    if (topRankingKeywords > 0) {
      insights.push(`${topRankingKeywords} keywords are ranking in the top 10 positions.`);
    }
  }

  if (project.audits.length > 0) {
    const latestAudit = project.audits[0];
    insights.push(`Latest audit completed on ${new Date(latestAudit.createdAt).toLocaleDateString()} with a score of ${latestAudit.score}/100.`);
  } else {
    insights.push("No audits found. Consider running a comprehensive SEO audit to identify optimization opportunities.");
  }

  return insights;
}

function generateKeywordInsights(keywords: any[]): string[] {
  const insights: string[] = [];
  
  if (keywords.length === 0) {
    insights.push("No keywords found. Start by adding target keywords to track their performance.");
    return insights;
  }

  const keywordsWithRankings = keywords.filter(k => k.rankings?.length > 0);
  insights.push(`${keywordsWithRankings.length} out of ${keywords.length} keywords have ranking data.`);
  
  if (keywordsWithRankings.length > 0) {
    const topPerformers = keywordsWithRankings.filter(k => k.rankings[0]?.position <= 10);
    insights.push(`${topPerformers.length} keywords are performing well (top 10 positions).`);
    
    const needsImprovement = keywordsWithRankings.filter(k => k.rankings[0]?.position > 50);
    if (needsImprovement.length > 0) {
      insights.push(`${needsImprovement.length} keywords need optimization (ranking below position 50).`);
    }
  }

  return insights;
}

function generateRankingInsights(rankings: any[]): string[] {
  const insights: string[] = [];
  
  if (rankings.length === 0) {
    insights.push("No ranking data available.");
    return insights;
  }

  const avgPosition = rankings.reduce((sum, r) => sum + r.position, 0) / rankings.length;
  insights.push(`Average ranking position across all tracked keywords: ${Math.round(avgPosition)}.`);
  
  const topRankings = rankings.filter(r => r.position <= 10).length;
  const goodRankings = rankings.filter(r => r.position <= 20).length;
  
  insights.push(`${topRankings} rankings in top 10, ${goodRankings} in top 20.`);
  
  return insights;
}

function generateAuditInsights(audits: any[]): string[] {
  const insights: string[] = [];
  
  if (audits.length === 0) {
    insights.push("No audit data available. Consider running SEO audits to identify optimization opportunities.");
    return insights;
  }

  const avgScore = audits.reduce((sum, a) => sum + a.score, 0) / audits.length;
  insights.push(`Average SEO audit score: ${Math.round(avgScore)}/100.`);
  
  const recentAudits = audits.filter(a => {
    const auditDate = new Date(a.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return auditDate > thirtyDaysAgo;
  });
  
  insights.push(`${recentAudits.length} audits completed in the last 30 days.`);
  
  return insights;
}
