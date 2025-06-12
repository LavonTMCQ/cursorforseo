import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const schemaMarkupTool = createTool({
  id: "schema-markup",
  description: "Analyze and generate schema markup for improved search engine understanding and rich snippets",
  inputSchema: z.object({
    url: z.string().url().describe("Website URL to analyze"),
    contentType: z.enum([
      "article", "product", "organization", "local-business", "person", 
      "event", "recipe", "faq", "how-to", "review", "breadcrumb"
    ]).describe("Type of content for schema markup"),
    content: z.string().optional().describe("Page content to analyze"),
    businessInfo: z.object({
      name: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
    }).optional().describe("Business information for local business schema"),
  }),
  outputSchema: z.object({
    currentSchema: z.object({
      found: z.boolean(),
      types: z.array(z.string()),
      errors: z.array(z.object({
        type: z.string(),
        message: z.string(),
        severity: z.enum(["error", "warning"]),
      })),
      coverage: z.number().min(0).max(100),
    }),
    recommendedSchema: z.array(z.object({
      type: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      jsonLd: z.string(),
      benefits: z.array(z.string()),
      implementation: z.string(),
    })),
    richSnippetOpportunities: z.array(z.object({
      type: z.enum([
        "star-rating", "price", "availability", "breadcrumb", 
        "faq", "how-to", "recipe", "event", "organization"
      ]),
      description: z.string(),
      requirements: z.array(z.string()),
      example: z.string(),
    })),
    validationResults: z.object({
      isValid: z.boolean(),
      errors: z.array(z.string()),
      warnings: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
  }),
  execute: async ({ context }) => {
    const { url, contentType, content, businessInfo } = context;

    // Simulate schema markup analysis
    const analysis = await analyzeSchemaMarkup(url, contentType, content, businessInfo);

    return analysis;
  },
});

async function analyzeSchemaMarkup(
  url: string,
  contentType: string,
  content?: string,
  businessInfo?: any
) {
  // Simulate schema markup analysis (in production, this would crawl the page and analyze existing schema)
  
  const hasExistingSchema = Math.random() > 0.6;
  const schemaTypes = hasExistingSchema ? getRandomSchemaTypes() : [];
  
  const currentSchema = {
    found: hasExistingSchema,
    types: schemaTypes,
    errors: generateSchemaErrors(hasExistingSchema),
    coverage: hasExistingSchema ? Math.floor(Math.random() * 60) + 40 : 0,
  };

  const recommendedSchema = generateRecommendedSchema(contentType, businessInfo);
  const richSnippetOpportunities = generateRichSnippetOpportunities(contentType);
  const validationResults = generateValidationResults(hasExistingSchema);

  return {
    currentSchema,
    recommendedSchema,
    richSnippetOpportunities,
    validationResults,
  };
}

function getRandomSchemaTypes(): string[] {
  const allTypes = ["Organization", "WebSite", "WebPage", "Article", "BreadcrumbList"];
  const numTypes = Math.floor(Math.random() * 3) + 1;
  return allTypes.slice(0, numTypes);
}

function generateSchemaErrors(hasSchema: boolean) {
  if (!hasSchema) {
    return [
      {
        type: "missing-schema",
        message: "No structured data found on the page",
        severity: "warning" as const,
      },
    ];
  }

  const errors = [];
  if (Math.random() > 0.7) {
    errors.push({
      type: "invalid-property",
      message: "Missing required property 'name' in Organization schema",
      severity: "error" as const,
    });
  }
  
  if (Math.random() > 0.8) {
    errors.push({
      type: "deprecated-property",
      message: "Property 'telephone' should be 'phone' in ContactPoint",
      severity: "warning" as const,
    });
  }

  return errors;
}

function generateRecommendedSchema(contentType: string, businessInfo?: any) {
  const schemas = [];

  // Always recommend basic schemas
  schemas.push({
    type: "Organization",
    priority: "high" as const,
    jsonLd: generateOrganizationSchema(businessInfo),
    benefits: [
      "Establishes entity recognition",
      "Enables knowledge panel display",
      "Improves brand visibility in search results",
    ],
    implementation: "Add to the <head> section of your website",
  });

  schemas.push({
    type: "WebSite",
    priority: "high" as const,
    jsonLd: generateWebSiteSchema(),
    benefits: [
      "Enables sitelinks search box",
      "Improves site navigation in search results",
      "Helps search engines understand site structure",
    ],
    implementation: "Add to the homepage and main pages",
  });

  // Content-specific schemas
  switch (contentType) {
    case "article":
      schemas.push({
        type: "Article",
        priority: "high" as const,
        jsonLd: generateArticleSchema(),
        benefits: [
          "Enables rich snippets with author and date",
          "Improves content categorization",
          "Supports AMP and Google News integration",
        ],
        implementation: "Add to all blog posts and articles",
      });
      break;

    case "product":
      schemas.push({
        type: "Product",
        priority: "high" as const,
        jsonLd: generateProductSchema(),
        benefits: [
          "Displays price and availability in search results",
          "Enables product rich snippets",
          "Supports Google Shopping integration",
        ],
        implementation: "Add to all product pages",
      });
      break;

    case "local-business":
      schemas.push({
        type: "LocalBusiness",
        priority: "high" as const,
        jsonLd: generateLocalBusinessSchema(businessInfo),
        benefits: [
          "Improves local search visibility",
          "Enables Google My Business integration",
          "Displays business hours and contact info",
        ],
        implementation: "Add to homepage and contact page",
      });
      break;

    case "faq":
      schemas.push({
        type: "FAQPage",
        priority: "medium" as const,
        jsonLd: generateFAQSchema(),
        benefits: [
          "Displays FAQ rich snippets",
          "Increases SERP real estate",
          "Improves click-through rates",
        ],
        implementation: "Add to FAQ pages and help sections",
      });
      break;
  }

  return schemas;
}

function generateOrganizationSchema(businessInfo?: any): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": businessInfo?.name || "Your Company Name",
    "url": "https://yourwebsite.com",
    "logo": "https://yourwebsite.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": businessInfo?.phone || "+1-555-123-4567",
      "contactType": "customer service",
      "email": businessInfo?.email || "contact@yourwebsite.com",
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": businessInfo?.address || "123 Main Street",
      "addressLocality": "City",
      "addressRegion": "State",
      "postalCode": "12345",
      "addressCountry": "US",
    },
    "sameAs": [
      "https://www.facebook.com/yourcompany",
      "https://www.twitter.com/yourcompany",
      "https://www.linkedin.com/company/yourcompany",
    ],
  };

  return JSON.stringify(schema, null, 2);
}

function generateWebSiteSchema(): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Your Website Name",
    "url": "https://yourwebsite.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://yourwebsite.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return JSON.stringify(schema, null, 2);
}

function generateArticleSchema(): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Your Article Title",
    "description": "Brief description of your article",
    "image": "https://yourwebsite.com/article-image.jpg",
    "author": {
      "@type": "Person",
      "name": "Author Name",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Your Website Name",
      "logo": {
        "@type": "ImageObject",
        "url": "https://yourwebsite.com/logo.png",
      },
    },
    "datePublished": "2024-01-01",
    "dateModified": "2024-01-01",
  };

  return JSON.stringify(schema, null, 2);
}

function generateProductSchema(): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Product Name",
    "description": "Product description",
    "image": "https://yourwebsite.com/product-image.jpg",
    "brand": {
      "@type": "Brand",
      "name": "Brand Name",
    },
    "offers": {
      "@type": "Offer",
      "price": "99.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Your Store Name",
      },
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "123",
    },
  };

  return JSON.stringify(schema, null, 2);
}

function generateLocalBusinessSchema(businessInfo?: any): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": businessInfo?.name || "Your Business Name",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": businessInfo?.address || "123 Main Street",
      "addressLocality": "City",
      "addressRegion": "State",
      "postalCode": "12345",
      "addressCountry": "US",
    },
    "telephone": businessInfo?.phone || "+1-555-123-4567",
    "email": businessInfo?.email || "contact@yourbusiness.com",
    "url": "https://yourbusiness.com",
    "openingHours": ["Mo-Fr 09:00-17:00", "Sa 09:00-12:00"],
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060",
    },
  };

  return JSON.stringify(schema, null, 2);
}

function generateFAQSchema(): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is your return policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer a 30-day return policy for all items in original condition.",
        },
      },
      {
        "@type": "Question",
        "name": "How long does shipping take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standard shipping takes 3-5 business days, express shipping takes 1-2 business days.",
        },
      },
    ],
  };

  return JSON.stringify(schema, null, 2);
}

function generateRichSnippetOpportunities(contentType: string) {
  const opportunities: Array<{
    type: "star-rating" | "price" | "availability" | "breadcrumb" | "faq" | "how-to" | "recipe" | "event" | "organization";
    description: string;
    requirements: string[];
    example: string;
  }> = [
    {
      type: "breadcrumb",
      description: "Show navigation path in search results",
      requirements: ["BreadcrumbList schema", "Proper page hierarchy"],
      example: "Home > Category > Product",
    },
  ];

  switch (contentType) {
    case "product":
      opportunities.push({
        type: "star-rating",
        description: "Display product ratings in search results",
        requirements: ["AggregateRating schema", "Individual Review schemas"],
        example: "★★★★☆ 4.5 (123 reviews)",
      });
      opportunities.push({
        type: "price",
        description: "Show product price and availability",
        requirements: ["Product schema with Offer", "Valid price and currency"],
        example: "$99.99 - In Stock",
      });
      break;

    case "faq":
      opportunities.push({
        type: "faq",
        description: "Display FAQ questions directly in search results",
        requirements: ["FAQPage schema", "Question and Answer markup"],
        example: "Expandable Q&A sections in SERP",
      });
      break;

    case "how-to":
      opportunities.push({
        type: "how-to",
        description: "Show step-by-step instructions in search results",
        requirements: ["HowTo schema", "Structured step instructions"],
        example: "Step-by-step guide with images",
      });
      break;
  }

  return opportunities;
}

function generateValidationResults(hasSchema: boolean) {
  if (!hasSchema) {
    return {
      isValid: false,
      errors: ["No structured data found"],
      warnings: [],
      suggestions: [
        "Add basic Organization schema",
        "Implement WebSite schema for sitelinks",
        "Consider content-specific schema types",
      ],
    };
  }

  return {
    isValid: Math.random() > 0.3,
    errors: Math.random() > 0.7 ? ["Missing required property 'name'"] : [],
    warnings: Math.random() > 0.5 ? ["Consider adding more specific schema types"] : [],
    suggestions: [
      "Add more comprehensive schema markup",
      "Include additional properties for better rich snippets",
      "Validate schema using Google's Rich Results Test",
    ],
  };
}
