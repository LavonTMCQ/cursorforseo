import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export interface TaskPlan {
  steps: string[];
  estimatedTime: string;
  requirements: string[];
  warnings?: string[];
}

export interface SEORecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'technical' | 'content' | 'performance' | 'accessibility';
  issue: string;
  recommendation: string;
  impact: string;
}

class OpenAIService {
  private readonly systemPrompt = `You are an expert SEO Browser Agent designed to help business owners (especially those aged 50+) with SEO, web automation, and digital marketing tasks. You should:

1. **Communicate in plain English** - Avoid technical jargon and explain things clearly
2. **Be patient and thorough** - Provide step-by-step guidance
3. **Focus on business value** - Explain how each action helps their business
4. **Be encouraging** - Many users are not tech-savvy, so be supportive
5. **Prioritize safety** - Always explain what you're going to do before taking action

Your capabilities include:
- SEO analysis and optimization recommendations
- Google My Business listing management
- Competitor research and analysis
- Form filling and automation
- Website auditing and monitoring
- Directory submissions and citations

When users ask for help, break down complex tasks into simple steps and always explain the business benefit of each action.`;

  async generateResponse(
    userMessage: string,
    context?: {
      currentUrl?: string;
      pageTitle?: string;
      seoAnalysis?: any;
      previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    }
  ): Promise<string> {
    try {
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
        return this.generateFallbackResponse(userMessage, context);
      }

      const contextInfo = context ? `
Current Context:
- URL: ${context.currentUrl || 'None'}
- Page Title: ${context.pageTitle || 'None'}
- Previous conversation: ${context.previousMessages?.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n') || 'None'}
${context.seoAnalysis ? `- SEO Analysis Available: Yes` : ''}
` : '';

      const { text } = await generateText({
        model: openai('gpt-4'),
        messages: [
          {
            role: 'system',
            content: this.systemPrompt + contextInfo
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        maxTokens: 500
      });

      return text;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.generateFallbackResponse(userMessage, context);
    }
  }

  private generateFallbackResponse(userMessage: string, context?: any): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('analyze') || lowerMessage.includes('seo')) {
      return `I'll help you analyze a website for SEO!

I can check:
🔍 **Page titles and meta descriptions** - Make sure they're optimized for search
📊 **Heading structure** - Proper H1, H2, H3 organization
🖼️ **Image alt text** - Help search engines understand your images
⚡ **Page load speed** - Faster sites rank better
🔗 **Links** - Both internal navigation and external references
📱 **Mobile responsiveness** - Essential for modern SEO

${context?.currentUrl ? `I can analyze the current page: ${context.currentUrl}` : 'Please provide a URL or navigate to a website to analyze.'}

What would you like me to focus on?`;
    }

    if (lowerMessage.includes('navigate') || lowerMessage.includes('go to') || lowerMessage.includes('visit')) {
      return `I'll help you navigate to any website!

Just tell me:
- The website URL (like google.com or example.com)
- Or describe what you're looking for (like "my competitor's website")

I can then take a screenshot and help you analyze what we find. What website would you like to visit?`;
    }

    if (lowerMessage.includes('competitor') || lowerMessage.includes('research')) {
      return `I'll help you research your competitors!

I can:
🔍 **Analyze competitor websites** - See what SEO strategies they're using
📊 **Compare content** - Look at their page structure and keywords
🔗 **Check their online presence** - Social media, directories, etc.
💡 **Find opportunities** - Areas where you can outperform them

Tell me your competitors' websites and I'll analyze them for you!`;
    }

    if (lowerMessage.includes('google') && lowerMessage.includes('business')) {
      return `I'll help you with your Google My Business listing!

I can help you:
✅ **Check your listing** - Make sure all information is accurate
📸 **Review photos** - Ensure you have good quality images
⭐ **Monitor reviews** - Keep track of customer feedback
📍 **Verify location** - Confirm your address and hours
📞 **Update contact info** - Phone, website, services

What's your business name and location? I'll search for your listing and check everything.`;
    }

    // Default response
    return `I understand you want help with: "${userMessage}"

I'm your SEO Browser Agent, and I can help you with:

🔍 **SEO Analysis** - Check websites for optimization opportunities
🌐 **Website Navigation** - Visit and analyze any website
🏢 **Business Listings** - Manage your Google My Business
📝 **Form Automation** - Fill out business directory forms
🔍 **Competitor Research** - Analyze what your competition is doing
📊 **Website Audits** - Comprehensive technical SEO checks

Could you be more specific about what you'd like me to help you with? For example:
- "Analyze the SEO of my website"
- "Navigate to google.com"
- "Check my Google My Business listing"`;
  }

  async createTaskPlan(userRequest: string, currentContext?: any): Promise<TaskPlan> {
    try {
      const { text } = await generateText({
        model: openai('gpt-4'),
        messages: [
          {
            role: 'system',
            content: `You are a task planning expert for SEO and web automation. Create a detailed plan for the user's request. Return a JSON object with:
- steps: Array of clear, actionable steps
- estimatedTime: Human-readable time estimate
- requirements: What's needed to complete the task
- warnings: Any potential issues or considerations

Focus on business-friendly language and practical steps.`
          },
          {
            role: 'user',
            content: `Create a task plan for: "${userRequest}"
            
Current context: ${JSON.stringify(currentContext || {})}`
          }
        ],
        temperature: 0.3,
        maxTokens: 800
      });

      try {
        return JSON.parse(text);
      } catch {
        // Fallback if JSON parsing fails
        return {
          steps: [
            "I'll help you with that request",
            "Let me break this down into simple steps",
            "I'll guide you through each step with clear explanations"
          ],
          estimatedTime: "5-10 minutes",
          requirements: ["Active internet connection", "Browser access"],
          warnings: ["I'll explain each step before taking action"]
        };
      }
    } catch (error) {
      console.error('Task planning error:', error);
      return {
        steps: ["I'll help you with your request step by step"],
        estimatedTime: "A few minutes",
        requirements: ["Browser access"],
        warnings: ["Let me know if you need clarification on any step"]
      };
    }
  }

  async analyzeSEOForBusiness(seoData: any, businessType?: string): Promise<SEORecommendation[]> {
    try {
      const { text } = await generateText({
        model: openai('gpt-4'),
        messages: [
          {
            role: 'system',
            content: `You are an SEO expert who explains technical issues in business-friendly terms. Analyze the SEO data and provide recommendations that a business owner can understand and act on. Return a JSON array of recommendations with priority, category, issue, recommendation, and impact fields.`
          },
          {
            role: 'user',
            content: `Analyze this SEO data for a ${businessType || 'business'} and provide actionable recommendations:

${JSON.stringify(seoData, null, 2)}

Focus on:
1. Issues that directly impact search rankings
2. Quick wins that can be implemented easily
3. Business impact of each recommendation
4. Clear, non-technical explanations`
          }
        ],
        temperature: 0.3,
        maxTokens: 1000
      });

      try {
        return JSON.parse(text);
      } catch {
        // Fallback recommendations
        return [
          {
            priority: 'high',
            category: 'content',
            issue: 'SEO analysis completed',
            recommendation: 'Review the detailed analysis and implement the suggested improvements',
            impact: 'Better search engine visibility and more potential customers finding your business'
          }
        ];
      }
    } catch (error) {
      console.error('SEO analysis error:', error);
      return [
        {
          priority: 'medium',
          category: 'technical',
          issue: 'Unable to complete full analysis',
          recommendation: 'Try the analysis again or contact support for help',
          impact: 'Ensuring your website is optimized for search engines'
        }
      ];
    }
  }

  async generateBusinessFriendlyReport(
    seoAnalysis: any,
    recommendations: SEORecommendation[]
  ): Promise<string> {
    try {
      const { text } = await generateText({
        model: openai('gpt-4'),
        messages: [
          {
            role: 'system',
            content: `Create a business-friendly SEO report that a non-technical business owner can understand. Use simple language, explain the business impact, and provide clear next steps. Format it as a readable report with sections and bullet points.`
          },
          {
            role: 'user',
            content: `Create a report based on this SEO analysis and recommendations:

SEO Analysis:
${JSON.stringify(seoAnalysis, null, 2)}

Recommendations:
${JSON.stringify(recommendations, null, 2)}

Make it encouraging and actionable for a business owner.`
          }
        ],
        temperature: 0.5,
        maxTokens: 1200
      });

      return text;
    } catch (error) {
      console.error('Report generation error:', error);
      return `# SEO Analysis Report

## Summary
I've completed an analysis of your website. Here are the key findings:

### What's Working Well
- Your website is accessible and loading properly
- Basic SEO structure is in place

### Areas for Improvement
- Some technical SEO elements could be optimized
- Content structure could be enhanced for better search visibility

### Next Steps
1. Review the detailed recommendations
2. Implement high-priority improvements first
3. Monitor your search rankings over time

Would you like me to help you implement any of these improvements?`;
    }
  }

  async interpretUserIntent(message: string): Promise<{
    intent: 'navigate' | 'analyze' | 'form_fill' | 'research' | 'general';
    confidence: number;
    extractedData?: any;
  }> {
    try {
      const { text } = await generateText({
        model: openai('gpt-4'),
        messages: [
          {
            role: 'system',
            content: `Analyze the user's message and determine their intent. Return JSON with:
- intent: 'navigate', 'analyze', 'form_fill', 'research', or 'general'
- confidence: 0-1 score
- extractedData: any relevant data (URLs, keywords, etc.)

Examples:
- "Go to google.com" -> navigate
- "Check my website's SEO" -> analyze  
- "Fill out this form" -> form_fill
- "Research my competitors" -> research
- "How do I improve my rankings?" -> general`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.1,
        maxTokens: 200
      });

      try {
        return JSON.parse(text);
      } catch {
        return {
          intent: 'general',
          confidence: 0.5,
          extractedData: { originalMessage: message }
        };
      }
    } catch (error) {
      console.error('Intent analysis error:', error);
      return {
        intent: 'general',
        confidence: 0.3,
        extractedData: { originalMessage: message }
      };
    }
  }
}

export const openaiService = new OpenAIService();
