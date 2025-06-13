import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const coreWebVitalsTool = createTool({
  id: "core-web-vitals",
  description: "Analyze Core Web Vitals performance metrics and provide optimization recommendations",
  inputSchema: z.object({
    url: z.string().url().describe("Website URL to analyze"),
    device: z.enum(["mobile", "desktop", "both"]).default("both").describe("Device type for analysis"),
    includeFieldData: z.boolean().default(true).describe("Include real user experience data"),
    includeLabData: z.boolean().default(true).describe("Include lab data from simulated tests"),
  }),
  outputSchema: z.object({
    overallScore: z.number().min(0).max(100).describe("Overall Core Web Vitals score"),
    coreWebVitals: z.object({
      largestContentfulPaint: z.object({
        value: z.number().describe("LCP value in seconds"),
        score: z.enum(["good", "needs-improvement", "poor"]),
        threshold: z.object({
          good: z.number(),
          poor: z.number(),
        }),
        recommendations: z.array(z.string()),
      }),
      firstInputDelay: z.object({
        value: z.number().describe("FID value in milliseconds"),
        score: z.enum(["good", "needs-improvement", "poor"]),
        threshold: z.object({
          good: z.number(),
          poor: z.number(),
        }),
        recommendations: z.array(z.string()),
      }),
      cumulativeLayoutShift: z.object({
        value: z.number().describe("CLS value"),
        score: z.enum(["good", "needs-improvement", "poor"]),
        threshold: z.object({
          good: z.number(),
          poor: z.number(),
        }),
        recommendations: z.array(z.string()),
      }),
      interactionToNextPaint: z.object({
        value: z.number().describe("INP value in milliseconds"),
        score: z.enum(["good", "needs-improvement", "poor"]),
        threshold: z.object({
          good: z.number(),
          poor: z.number(),
        }),
        recommendations: z.array(z.string()),
      }),
    }),
    performanceMetrics: z.object({
      firstContentfulPaint: z.number(),
      speedIndex: z.number(),
      timeToInteractive: z.number(),
      totalBlockingTime: z.number(),
    }),
    opportunities: z.array(z.object({
      title: z.string(),
      description: z.string(),
      impact: z.enum(["high", "medium", "low"]),
      estimatedSavings: z.string(),
      implementation: z.string(),
    })),
    diagnostics: z.array(z.object({
      title: z.string(),
      description: z.string(),
      severity: z.enum(["error", "warning", "info"]),
      recommendation: z.string(),
    })),
    mobileOptimization: z.object({
      isMobileFriendly: z.boolean(),
      viewportConfigured: z.boolean(),
      textReadable: z.boolean(),
      touchTargetsAppropriate: z.boolean(),
      recommendations: z.array(z.string()),
    }),
  }),
  execute: async ({ context }) => {
    const { url, device, includeFieldData, includeLabData } = context;

    // Simulate Core Web Vitals analysis
    const analysis = await analyzeCoreWebVitals(url, device, includeFieldData, includeLabData);

    return analysis;
  },
});

async function analyzeCoreWebVitals(
  url: string,
  device: string,
  includeFieldData: boolean,
  includeLabData: boolean
) {
  // Simulate Core Web Vitals analysis (in production, this would use PageSpeed Insights API)
  
  // Generate realistic Core Web Vitals data
  const lcpValue = 1.5 + Math.random() * 3; // 1.5-4.5 seconds
  const fidValue = 50 + Math.random() * 200; // 50-250ms
  const clsValue = Math.random() * 0.3; // 0-0.3
  const inpValue = 100 + Math.random() * 300; // 100-400ms

  const getLCPScore = (value: number) => {
    if (value <= 2.5) return "good";
    if (value <= 4.0) return "needs-improvement";
    return "poor";
  };

  const getFIDScore = (value: number) => {
    if (value <= 100) return "good";
    if (value <= 300) return "needs-improvement";
    return "poor";
  };

  const getCLSScore = (value: number) => {
    if (value <= 0.1) return "good";
    if (value <= 0.25) return "needs-improvement";
    return "poor";
  };

  const getINPScore = (value: number) => {
    if (value <= 200) return "good";
    if (value <= 500) return "needs-improvement";
    return "poor";
  };

  const coreWebVitals = {
    largestContentfulPaint: {
      value: Math.round(lcpValue * 100) / 100,
      score: getLCPScore(lcpValue) as "good" | "needs-improvement" | "poor",
      threshold: { good: 2.5, poor: 4.0 },
      recommendations: generateLCPRecommendations(lcpValue),
    },
    firstInputDelay: {
      value: Math.round(fidValue),
      score: getFIDScore(fidValue) as "good" | "needs-improvement" | "poor",
      threshold: { good: 100, poor: 300 },
      recommendations: generateFIDRecommendations(fidValue),
    },
    cumulativeLayoutShift: {
      value: Math.round(clsValue * 1000) / 1000,
      score: getCLSScore(clsValue) as "good" | "needs-improvement" | "poor",
      threshold: { good: 0.1, poor: 0.25 },
      recommendations: generateCLSRecommendations(clsValue),
    },
    interactionToNextPaint: {
      value: Math.round(inpValue),
      score: getINPScore(inpValue) as "good" | "needs-improvement" | "poor",
      threshold: { good: 200, poor: 500 },
      recommendations: generateINPRecommendations(inpValue),
    },
  };

  // Calculate overall score
  const scores = Object.values(coreWebVitals).map(metric => {
    switch (metric.score) {
      case "good": return 100;
      case "needs-improvement": return 60;
      case "poor": return 20;
      default: return 0;
    }
  });
  const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

  return {
    overallScore,
    coreWebVitals,
    performanceMetrics: {
      firstContentfulPaint: 1.2 + Math.random() * 2,
      speedIndex: 2.0 + Math.random() * 3,
      timeToInteractive: 3.0 + Math.random() * 4,
      totalBlockingTime: 100 + Math.random() * 400,
    },
    opportunities: generateOptimizationOpportunities(),
    diagnostics: generateDiagnostics(),
    mobileOptimization: {
      isMobileFriendly: Math.random() > 0.2,
      viewportConfigured: Math.random() > 0.1,
      textReadable: Math.random() > 0.15,
      touchTargetsAppropriate: Math.random() > 0.3,
      recommendations: generateMobileRecommendations(),
    },
  };
}

function generateLCPRecommendations(lcpValue: number): string[] {
  const recommendations: string[] = [];
  
  if (lcpValue > 2.5) {
    recommendations.push("Optimize server response times by upgrading hosting or implementing caching");
    recommendations.push("Compress and optimize images, especially hero images");
    recommendations.push("Implement lazy loading for below-the-fold content");
    recommendations.push("Use a Content Delivery Network (CDN) to serve static assets");
  }
  
  if (lcpValue > 4.0) {
    recommendations.push("Remove or defer non-critical JavaScript that blocks rendering");
    recommendations.push("Optimize CSS delivery and remove unused CSS");
    recommendations.push("Consider using WebP or AVIF image formats");
  }
  
  return recommendations;
}

function generateFIDRecommendations(fidValue: number): string[] {
  const recommendations: string[] = [];
  
  if (fidValue > 100) {
    recommendations.push("Break up long-running JavaScript tasks");
    recommendations.push("Optimize third-party scripts and load them asynchronously");
    recommendations.push("Use web workers for heavy computations");
    recommendations.push("Implement code splitting to reduce JavaScript bundle size");
  }
  
  if (fidValue > 300) {
    recommendations.push("Remove or defer unused JavaScript");
    recommendations.push("Optimize event handlers and reduce main thread work");
    recommendations.push("Consider using service workers for background processing");
  }
  
  return recommendations;
}

function generateCLSRecommendations(clsValue: number): string[] {
  const recommendations: string[] = [];
  
  if (clsValue > 0.1) {
    recommendations.push("Set explicit dimensions for images and video elements");
    recommendations.push("Reserve space for ads and dynamic content");
    recommendations.push("Use CSS aspect-ratio property for responsive media");
    recommendations.push("Avoid inserting content above existing content");
  }
  
  if (clsValue > 0.25) {
    recommendations.push("Preload critical fonts to prevent font swap layout shifts");
    recommendations.push("Use font-display: swap with fallback fonts");
    recommendations.push("Avoid dynamically injected content without reserved space");
  }
  
  return recommendations;
}

function generateINPRecommendations(inpValue: number): string[] {
  const recommendations: string[] = [];
  
  if (inpValue > 200) {
    recommendations.push("Optimize event handlers to reduce processing time");
    recommendations.push("Use requestIdleCallback for non-urgent tasks");
    recommendations.push("Implement debouncing for frequent user interactions");
    recommendations.push("Optimize DOM manipulation and reduce reflows");
  }
  
  if (inpValue > 500) {
    recommendations.push("Break up long tasks using scheduler.postTask()");
    recommendations.push("Reduce JavaScript execution time during interactions");
    recommendations.push("Optimize third-party scripts that may block interactions");
  }
  
  return recommendations;
}

function generateOptimizationOpportunities() {
  return [
    {
      title: "Optimize Images",
      description: "Serve images in next-gen formats and compress them properly",
      impact: "high" as const,
      estimatedSavings: "1.2s",
      implementation: "Use WebP/AVIF formats, implement responsive images, and compress existing images",
    },
    {
      title: "Eliminate Render-Blocking Resources",
      description: "Remove or defer CSS and JavaScript that blocks page rendering",
      impact: "high" as const,
      estimatedSavings: "0.8s",
      implementation: "Inline critical CSS, defer non-critical CSS, and use async/defer for JavaScript",
    },
    {
      title: "Reduce Unused JavaScript",
      description: "Remove dead code and implement code splitting",
      impact: "medium" as const,
      estimatedSavings: "0.5s",
      implementation: "Use tree shaking, implement dynamic imports, and remove unused libraries",
    },
  ];
}

function generateDiagnostics() {
  return [
    {
      title: "Avoid enormous network payloads",
      description: "Large network payloads cost users real money and are highly correlated with long load times",
      severity: "warning" as const,
      recommendation: "Optimize images, enable compression, and implement caching strategies",
    },
    {
      title: "Serve static assets with an efficient cache policy",
      description: "A long cache lifetime can speed up repeat visits to your page",
      severity: "warning" as const,
      recommendation: "Set appropriate cache headers for static assets (CSS, JS, images)",
    },
    {
      title: "Avoid multiple page redirects",
      description: "Redirects introduce additional delays before the page can be loaded",
      severity: "info" as const,
      recommendation: "Minimize redirects and update internal links to point directly to final URLs",
    },
  ];
}

function generateMobileRecommendations(): string[] {
  return [
    "Ensure viewport meta tag is properly configured",
    "Use responsive design principles for all screen sizes",
    "Make touch targets at least 44px in size",
    "Ensure text is readable without zooming (minimum 16px font size)",
    "Optimize for mobile-first indexing",
  ];
}
