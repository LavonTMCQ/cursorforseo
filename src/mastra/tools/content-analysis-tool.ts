import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const contentAnalysisTool = createTool({
  id: "content-analysis",
  description: "Analyze content for SEO performance, keyword optimization, and readability",
  inputSchema: z.object({
    content: z.string().describe("The content text to analyze"),
    targetKeyword: z.string().describe("Primary keyword to optimize for"),
    url: z.string().optional().describe("URL of the content (if analyzing existing page)"),
    metaTitle: z.string().optional().describe("Meta title of the page"),
    metaDescription: z.string().optional().describe("Meta description of the page"),
  }),
  outputSchema: z.object({
    seoScore: z.number().min(0).max(100).describe("Overall SEO score"),
    keywordAnalysis: z.object({
      density: z.number().describe("Keyword density percentage"),
      frequency: z.number().describe("Number of keyword occurrences"),
      prominence: z.number().min(0).max(100).describe("Keyword prominence score"),
      variations: z.array(z.string()).describe("Keyword variations found"),
    }),
    contentMetrics: z.object({
      wordCount: z.number(),
      readabilityScore: z.number().min(0).max(100),
      headingStructure: z.object({
        h1Count: z.number(),
        h2Count: z.number(),
        h3Count: z.number(),
        hasProperStructure: z.boolean(),
      }),
      paragraphCount: z.number(),
      averageParagraphLength: z.number(),
    }),
    metaAnalysis: z.object({
      titleLength: z.number(),
      titleOptimized: z.boolean(),
      descriptionLength: z.number(),
      descriptionOptimized: z.boolean(),
      keywordInTitle: z.boolean(),
      keywordInDescription: z.boolean(),
    }),
    recommendations: z.array(z.object({
      type: z.enum(["critical", "important", "suggestion"]),
      category: z.enum(["keyword", "content", "meta", "structure"]),
      message: z.string(),
      impact: z.enum(["high", "medium", "low"]),
    })),
    optimizationOpportunities: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { content, targetKeyword, url, metaTitle, metaDescription } = context;

    // Analyze content
    const analysis = await analyzeContent(content, targetKeyword, metaTitle, metaDescription);

    return analysis;
  },
});

async function analyzeContent(
  content: string,
  targetKeyword: string,
  metaTitle?: string,
  metaDescription?: string
) {
  const words = content.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  const keywordLower = targetKeyword.toLowerCase();
  
  // Keyword analysis
  const keywordOccurrences = words.filter(word => 
    word.includes(keywordLower) || keywordLower.includes(word)
  ).length;
  const keywordDensity = (keywordOccurrences / wordCount) * 100;
  
  // Content structure analysis
  const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  const h2Matches = content.match(/<h2[^>]*>.*?<\/h2>/gi) || [];
  const h3Matches = content.match(/<h3[^>]*>.*?<\/h3>/gi) || [];
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Meta analysis
  const titleLength = metaTitle?.length || 0;
  const descriptionLength = metaDescription?.length || 0;
  const keywordInTitle = metaTitle?.toLowerCase().includes(keywordLower) || false;
  const keywordInDescription = metaDescription?.toLowerCase().includes(keywordLower) || false;
  
  // Calculate SEO score
  let seoScore = 0;
  
  // Keyword optimization (30 points)
  if (keywordDensity >= 1 && keywordDensity <= 3) seoScore += 15;
  else if (keywordDensity > 0) seoScore += 8;
  
  if (keywordInTitle) seoScore += 10;
  if (keywordInDescription) seoScore += 5;
  
  // Content quality (40 points)
  if (wordCount >= 300) seoScore += 10;
  if (wordCount >= 1000) seoScore += 5;
  if (h1Matches.length === 1) seoScore += 10;
  if (h2Matches.length >= 2) seoScore += 10;
  if (paragraphs.length >= 3) seoScore += 5;
  
  // Meta optimization (30 points)
  if (titleLength >= 30 && titleLength <= 60) seoScore += 15;
  else if (titleLength > 0) seoScore += 8;
  
  if (descriptionLength >= 120 && descriptionLength <= 160) seoScore += 15;
  else if (descriptionLength > 0) seoScore += 8;
  
  // Generate recommendations
  const recommendations: Array<{
    type: "critical" | "important" | "suggestion";
    category: "keyword" | "meta" | "content" | "structure";
    message: string;
    impact: "high" | "medium" | "low";
  }> = [];
  
  if (keywordDensity < 1) {
    recommendations.push({
      type: "important" as const,
      category: "keyword" as const,
      message: `Increase keyword density. Current: ${keywordDensity.toFixed(2)}%, recommended: 1-3%`,
      impact: "high" as const,
    });
  }
  
  if (keywordDensity > 3) {
    recommendations.push({
      type: "critical" as const,
      category: "keyword" as const,
      message: `Reduce keyword density to avoid over-optimization. Current: ${keywordDensity.toFixed(2)}%`,
      impact: "high" as const,
    });
  }
  
  if (!keywordInTitle) {
    recommendations.push({
      type: "critical" as const,
      category: "meta" as const,
      message: "Include target keyword in meta title",
      impact: "high" as const,
    });
  }
  
  if (wordCount < 300) {
    recommendations.push({
      type: "important" as const,
      category: "content" as const,
      message: `Increase content length. Current: ${wordCount} words, recommended: 300+ words`,
      impact: "medium" as const,
    });
  }
  
  if (h1Matches.length !== 1) {
    recommendations.push({
      type: "important" as const,
      category: "structure" as const,
      message: `Use exactly one H1 tag. Current: ${h1Matches.length}`,
      impact: "medium" as const,
    });
  }

  return {
    seoScore: Math.min(100, seoScore),
    keywordAnalysis: {
      density: Math.round(keywordDensity * 100) / 100,
      frequency: keywordOccurrences,
      prominence: keywordInTitle ? 90 : (keywordOccurrences > 0 ? 60 : 0),
      variations: [targetKeyword, `${targetKeyword}s`, `${targetKeyword} guide`],
    },
    contentMetrics: {
      wordCount,
      readabilityScore: Math.max(0, 100 - (wordCount / 50)), // Simplified readability
      headingStructure: {
        h1Count: h1Matches.length,
        h2Count: h2Matches.length,
        h3Count: h3Matches.length,
        hasProperStructure: h1Matches.length === 1 && h2Matches.length >= 2,
      },
      paragraphCount: paragraphs.length,
      averageParagraphLength: paragraphs.length > 0 ? wordCount / paragraphs.length : 0,
    },
    metaAnalysis: {
      titleLength,
      titleOptimized: titleLength >= 30 && titleLength <= 60 && keywordInTitle,
      descriptionLength,
      descriptionOptimized: descriptionLength >= 120 && descriptionLength <= 160 && keywordInDescription,
      keywordInTitle,
      keywordInDescription,
    },
    recommendations,
    optimizationOpportunities: [
      "Add internal links to related content",
      "Include relevant images with alt text",
      "Optimize for featured snippets",
      "Add schema markup for better rich results",
    ],
  };
}
