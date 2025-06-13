import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const contentOptimizationTool = createTool({
  id: "content-optimization",
  description: "Generate optimized content suggestions and improvements for SEO performance",
  inputSchema: z.object({
    content: z.string().describe("The content text to optimize"),
    targetKeyword: z.string().describe("Primary keyword to optimize for"),
    secondaryKeywords: z.array(z.string()).optional().describe("Secondary keywords to include"),
    contentType: z.enum(["blog-post", "product-page", "landing-page", "category-page"]).describe("Type of content"),
    targetAudience: z.string().optional().describe("Target audience description"),
    competitorUrls: z.array(z.string()).optional().describe("Competitor URLs for comparison"),
  }),
  outputSchema: z.object({
    optimizedContent: z.object({
      title: z.string().describe("Optimized title"),
      metaDescription: z.string().describe("Optimized meta description"),
      headings: z.array(z.object({
        level: z.number(),
        text: z.string(),
        keywords: z.array(z.string()),
      })),
      optimizedParagraphs: z.array(z.string()),
      internalLinkSuggestions: z.array(z.string()),
    }),
    seoImprovements: z.array(z.object({
      type: z.enum(["keyword-density", "readability", "structure", "meta", "links"]),
      current: z.string(),
      suggested: z.string(),
      impact: z.enum(["high", "medium", "low"]),
      reasoning: z.string(),
    })),
    keywordOptimization: z.object({
      primaryKeywordDensity: z.number(),
      semanticKeywords: z.array(z.string()),
      keywordPlacement: z.array(z.object({
        location: z.string(),
        keyword: z.string(),
        importance: z.enum(["critical", "important", "optional"]),
      })),
    }),
    contentGaps: z.array(z.object({
      topic: z.string(),
      reason: z.string(),
      suggestedContent: z.string(),
    })),
    featuredSnippetOpportunities: z.array(z.object({
      type: z.enum(["paragraph", "list", "table", "video"]),
      query: z.string(),
      suggestedFormat: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    const { content, targetKeyword, secondaryKeywords, contentType, targetAudience, competitorUrls } = context;

    // Simulate content optimization analysis
    const optimization = await generateContentOptimization(
      content,
      targetKeyword,
      secondaryKeywords || [],
      contentType,
      targetAudience,
      competitorUrls || []
    );

    return optimization;
  },
});

async function generateContentOptimization(
  content: string,
  targetKeyword: string,
  secondaryKeywords: string[],
  contentType: string,
  targetAudience?: string,
  competitorUrls: string[] = []
) {
  const words = content.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  const keywordLower = targetKeyword.toLowerCase();
  
  // Calculate current keyword density
  const keywordOccurrences = words.filter(word => 
    word.includes(keywordLower) || keywordLower.includes(word)
  ).length;
  const currentDensity = (keywordOccurrences / wordCount) * 100;
  
  // Generate optimized title
  const optimizedTitle = generateOptimizedTitle(targetKeyword, contentType);
  
  // Generate optimized meta description
  const optimizedMetaDescription = generateOptimizedMetaDescription(targetKeyword, contentType);
  
  // Generate heading structure
  const headings = generateOptimizedHeadings(targetKeyword, secondaryKeywords, contentType);
  
  // Generate semantic keywords
  const semanticKeywords = generateSemanticKeywords(targetKeyword);
  
  // Generate content improvements
  const improvements = generateSEOImprovements(content, targetKeyword, currentDensity);
  
  // Generate content gaps
  const contentGaps = generateContentGaps(targetKeyword, contentType);
  
  // Generate featured snippet opportunities
  const featuredSnippetOpportunities = generateFeaturedSnippetOpportunities(targetKeyword);

  return {
    optimizedContent: {
      title: optimizedTitle,
      metaDescription: optimizedMetaDescription,
      headings,
      optimizedParagraphs: generateOptimizedParagraphs(content, targetKeyword, semanticKeywords),
      internalLinkSuggestions: generateInternalLinkSuggestions(targetKeyword, contentType),
    },
    seoImprovements: improvements,
    keywordOptimization: {
      primaryKeywordDensity: Math.round(currentDensity * 100) / 100,
      semanticKeywords,
      keywordPlacement: generateKeywordPlacement(targetKeyword),
    },
    contentGaps,
    featuredSnippetOpportunities,
  };
}

function generateOptimizedTitle(targetKeyword: string, contentType: string): string {
  const titleTemplates = {
    "blog-post": [
      `The Complete Guide to ${targetKeyword} in 2024`,
      `How to Master ${targetKeyword}: Expert Tips & Strategies`,
      `${targetKeyword}: Everything You Need to Know`,
    ],
    "product-page": [
      `Best ${targetKeyword} - Premium Quality & Fast Shipping`,
      `${targetKeyword} - Top-Rated Products & Reviews`,
    ],
    "landing-page": [
      `Professional ${targetKeyword} Services - Get Started Today`,
      `${targetKeyword} Solutions That Drive Results`,
    ],
    "category-page": [
      `${targetKeyword} Products - Browse Our Complete Collection`,
      `Shop ${targetKeyword} - Best Prices & Quality Guaranteed`,
    ],
  };
  
  const templates = titleTemplates[contentType as keyof typeof titleTemplates] || titleTemplates["blog-post"];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateOptimizedMetaDescription(targetKeyword: string, contentType: string): string {
  const descriptionTemplates = {
    "blog-post": `Discover expert insights on ${targetKeyword}. Learn proven strategies, best practices, and actionable tips to improve your results. Read our comprehensive guide now.`,
    "product-page": `Shop premium ${targetKeyword} products with fast shipping and excellent customer service. Compare features, read reviews, and find the perfect solution for your needs.`,
    "landing-page": `Get professional ${targetKeyword} services from industry experts. Proven results, competitive pricing, and exceptional customer support. Contact us today for a free consultation.`,
    "category-page": `Browse our complete collection of ${targetKeyword} products. Find the best deals, compare features, and shop with confidence. Free shipping on orders over $50.`,
  };
  
  return descriptionTemplates[contentType as keyof typeof descriptionTemplates] || descriptionTemplates["blog-post"];
}

function generateOptimizedHeadings(targetKeyword: string, secondaryKeywords: string[], contentType: string) {
  return [
    { level: 1, text: `The Ultimate Guide to ${targetKeyword}`, keywords: [targetKeyword] },
    { level: 2, text: `What is ${targetKeyword}?`, keywords: [targetKeyword] },
    { level: 2, text: `Benefits of ${targetKeyword}`, keywords: [targetKeyword, ...secondaryKeywords.slice(0, 1)] },
    { level: 2, text: `How to Get Started with ${targetKeyword}`, keywords: [targetKeyword] },
    { level: 3, text: `Best Practices for ${targetKeyword}`, keywords: [targetKeyword, ...secondaryKeywords.slice(1, 2)] },
    { level: 2, text: `Common ${targetKeyword} Mistakes to Avoid`, keywords: [targetKeyword] },
    { level: 2, text: `Conclusion`, keywords: [] },
  ];
}

function generateSemanticKeywords(targetKeyword: string): string[] {
  // Generate semantic keywords based on the target keyword
  return [
    `${targetKeyword} guide`,
    `${targetKeyword} tips`,
    `${targetKeyword} best practices`,
    `${targetKeyword} strategies`,
    `${targetKeyword} techniques`,
    `how to ${targetKeyword}`,
    `${targetKeyword} benefits`,
    `${targetKeyword} examples`,
  ];
}

function generateSEOImprovements(content: string, targetKeyword: string, currentDensity: number) {
  const improvements: Array<{
    type: "keyword-density" | "structure" | "readability" | "meta" | "links";
    current: string;
    suggested: string;
    impact: "high" | "medium" | "low";
    reasoning: string;
  }> = [];
  
  if (currentDensity < 1) {
    improvements.push({
      type: "keyword-density" as const,
      current: `${currentDensity.toFixed(2)}%`,
      suggested: "1-2%",
      impact: "high" as const,
      reasoning: "Increase keyword density to improve relevance signals",
    });
  }
  
  if (currentDensity > 3) {
    improvements.push({
      type: "keyword-density" as const,
      current: `${currentDensity.toFixed(2)}%`,
      suggested: "1-2%",
      impact: "high" as const,
      reasoning: "Reduce keyword density to avoid over-optimization",
    });
  }
  
  improvements.push({
    type: "readability" as const,
    current: "Basic paragraph structure",
    suggested: "Add bullet points, numbered lists, and subheadings",
    impact: "medium" as const,
    reasoning: "Improve readability and user experience",
  });
  
  return improvements;
}

function generateOptimizedParagraphs(content: string, targetKeyword: string, semanticKeywords: string[]): string[] {
  // This would analyze and rewrite paragraphs with better keyword integration
  return [
    `This comprehensive guide covers everything you need to know about ${targetKeyword}, including best practices and proven strategies.`,
    `Understanding ${targetKeyword} is essential for achieving your goals. Here are the key concepts you should master.`,
    `By implementing these ${targetKeyword} techniques, you can significantly improve your results and stay ahead of the competition.`,
  ];
}

function generateInternalLinkSuggestions(targetKeyword: string, contentType: string): string[] {
  return [
    `/blog/${targetKeyword.replace(/\s+/g, '-').toLowerCase()}-guide`,
    `/resources/${targetKeyword.replace(/\s+/g, '-').toLowerCase()}-tools`,
    `/case-studies/${targetKeyword.replace(/\s+/g, '-').toLowerCase()}-success-stories`,
  ];
}

function generateKeywordPlacement(targetKeyword: string) {
  return [
    { location: "Title tag", keyword: targetKeyword, importance: "critical" as const },
    { location: "H1 heading", keyword: targetKeyword, importance: "critical" as const },
    { location: "First paragraph", keyword: targetKeyword, importance: "important" as const },
    { location: "Meta description", keyword: targetKeyword, importance: "important" as const },
    { location: "Image alt text", keyword: targetKeyword, importance: "optional" as const },
  ];
}

function generateContentGaps(targetKeyword: string, contentType: string) {
  return [
    {
      topic: `${targetKeyword} case studies`,
      reason: "Missing real-world examples and success stories",
      suggestedContent: "Add 2-3 detailed case studies showing practical applications",
    },
    {
      topic: `${targetKeyword} tools and resources`,
      reason: "No mention of helpful tools or resources",
      suggestedContent: "Include a section with recommended tools and resources",
    },
  ];
}

function generateFeaturedSnippetOpportunities(targetKeyword: string) {
  return [
    {
      type: "paragraph" as const,
      query: `What is ${targetKeyword}?`,
      suggestedFormat: "Start with a clear, concise definition in 40-50 words",
    },
    {
      type: "list" as const,
      query: `${targetKeyword} benefits`,
      suggestedFormat: "Create a numbered or bulleted list of key benefits",
    },
  ];
}
