import { chromium, Browser, Page, BrowserContext } from 'playwright';
import sharp from 'sharp';

export interface BrowserSession {
  id: string;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  url: string;
  lastActivity: Date;
}

export interface ElementInfo {
  selector: string;
  text: string;
  tagName: string;
  attributes: Record<string, string>;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export interface SEOAnalysis {
  title: string;
  metaDescription: string;
  headings: { level: number; text: string }[];
  images: { src: string; alt: string }[];
  links: { href: string; text: string; isExternal: boolean }[];
  performance: {
    loadTime: number;
    domContentLoaded: number;
  };
  issues: string[];
  recommendations: string[];
}

class BrowserAutomationService {
  private sessions: Map<string, BrowserSession> = new Map();
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Clean up inactive sessions every 5 minutes
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000);
  }

  async createSession(sessionId: string): Promise<BrowserSession> {
    // Close existing session if it exists
    await this.closeSession(sessionId);

    try {
      const browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });

      const page = await context.newPage();

      // Set up page event listeners
      page.on('console', (msg) => {
        console.log(`Browser console [${sessionId}]:`, msg.text());
      });

      page.on('pageerror', (error) => {
        console.error(`Browser error [${sessionId}]:`, error.message);
      });

      const session: BrowserSession = {
        id: sessionId,
        browser,
        context,
        page,
        url: 'about:blank',
        lastActivity: new Date()
      };

      this.sessions.set(sessionId, session);
      console.log(`✅ Browser session created successfully: ${sessionId}`);
      return session;
    } catch (error) {
      console.error(`❌ Failed to create browser session [${sessionId}]:`, error);
      throw new Error(`Failed to create browser session: ${error}`);
    }
  }

  async getSession(sessionId: string): Promise<BrowserSession | null> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      return session;
    }
    return null;
  }

  async navigateToUrl(sessionId: string, url: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      // Ensure URL has protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      await session.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      session.url = url;
    } catch (error) {
      console.error(`Navigation error [${sessionId}]:`, error);
      throw new Error(`Failed to navigate to ${url}: ${error}`);
    }
  }

  async takeScreenshot(sessionId: string): Promise<string> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      const screenshot = await session.page.screenshot({
        type: 'png',
        fullPage: false
      });

      // Compress the screenshot
      const compressedScreenshot = await sharp(screenshot)
        .jpeg({ quality: 80 })
        .toBuffer();

      return `data:image/jpeg;base64,${compressedScreenshot.toString('base64')}`;
    } catch (error) {
      console.error(`Screenshot error [${sessionId}]:`, error);
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }

  async clickElement(sessionId: string, x: number, y: number): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      // Convert percentage coordinates to pixel coordinates
      const viewport = session.page.viewportSize();
      if (!viewport) {
        throw new Error('Viewport not available');
      }

      const pixelX = (x / 100) * viewport.width;
      const pixelY = (y / 100) * viewport.height;

      await session.page.mouse.click(pixelX, pixelY);
    } catch (error) {
      console.error(`Click error [${sessionId}]:`, error);
      throw new Error(`Failed to click element: ${error}`);
    }
  }

  async fillForm(sessionId: string, selector: string, value: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      await session.page.fill(selector, value);
    } catch (error) {
      console.error(`Form fill error [${sessionId}]:`, error);
      throw new Error(`Failed to fill form: ${error}`);
    }
  }

  async analyzeSEO(sessionId: string): Promise<SEOAnalysis> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      const startTime = Date.now();

      const analysis = await session.page.evaluate(() => {
        const title = document.title;
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        // Get headings
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          level: parseInt(h.tagName.charAt(1)),
          text: h.textContent?.trim() || ''
        }));

        // Get images
        const images = Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt || ''
        }));

        // Get links
        const links = Array.from(document.querySelectorAll('a[href]')).map(link => {
          const href = link.getAttribute('href') || '';
          const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
          return {
            href,
            text: link.textContent?.trim() || '',
            isExternal
          };
        });

        return {
          title,
          metaDescription,
          headings,
          images,
          links
        };
      });

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Generate SEO issues and recommendations
      const issues: string[] = [];
      const recommendations: string[] = [];

      if (!analysis.title) {
        issues.push('Missing page title');
        recommendations.push('Add a descriptive page title (50-60 characters)');
      } else if (analysis.title.length > 60) {
        issues.push('Page title too long');
        recommendations.push('Shorten page title to under 60 characters');
      }

      if (!analysis.metaDescription) {
        issues.push('Missing meta description');
        recommendations.push('Add a meta description (150-160 characters)');
      } else if (analysis.metaDescription.length > 160) {
        issues.push('Meta description too long');
        recommendations.push('Shorten meta description to under 160 characters');
      }

      const h1Count = analysis.headings.filter(h => h.level === 1).length;
      if (h1Count === 0) {
        issues.push('Missing H1 heading');
        recommendations.push('Add an H1 heading to the page');
      } else if (h1Count > 1) {
        issues.push('Multiple H1 headings');
        recommendations.push('Use only one H1 heading per page');
      }

      const imagesWithoutAlt = analysis.images.filter(img => !img.alt).length;
      if (imagesWithoutAlt > 0) {
        issues.push(`${imagesWithoutAlt} images missing alt text`);
        recommendations.push('Add descriptive alt text to all images');
      }

      return {
        ...analysis,
        performance: {
          loadTime,
          domContentLoaded: loadTime
        },
        issues,
        recommendations
      };
    } catch (error) {
      console.error(`SEO analysis error [${sessionId}]:`, error);
      throw new Error(`Failed to analyze SEO: ${error}`);
    }
  }

  async goBack(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      await session.page.goBack();
      session.url = session.page.url();
    } catch (error) {
      console.error(`Go back error [${sessionId}]:`, error);
      throw new Error(`Failed to go back: ${error}`);
    }
  }

  async goForward(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      await session.page.goForward();
      session.url = session.page.url();
    } catch (error) {
      console.error(`Go forward error [${sessionId}]:`, error);
      throw new Error(`Failed to go forward: ${error}`);
    }
  }

  async refresh(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      await session.page.reload();
    } catch (error) {
      console.error(`Refresh error [${sessionId}]:`, error);
      throw new Error(`Failed to refresh: ${error}`);
    }
  }

  async fillForm(sessionId: string, formData: any): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      console.log(`📝 Filling form [${sessionId}] with data:`, formData);

      // Common form field mappings
      const fieldMappings = [
        // Name fields
        { keys: ['Customer Name', 'Name', 'Full Name', 'name'], selectors: ['input[name*="name"]', 'input[id*="name"]', 'input[placeholder*="name"]', 'input[type="text"]'] },
        // Email fields
        { keys: ['Email', 'email'], selectors: ['input[name*="email"]', 'input[id*="email"]', 'input[type="email"]', 'input[placeholder*="email"]'] },
        // Phone fields
        { keys: ['Phone', 'phone'], selectors: ['input[name*="phone"]', 'input[id*="phone"]', 'input[type="tel"]', 'input[placeholder*="phone"]'] },
        // Company fields
        { keys: ['Company', 'company'], selectors: ['input[name*="company"]', 'input[id*="company"]', 'input[placeholder*="company"]'] },
        // Comment/Message fields
        { keys: ['Comment', 'comment', 'Message', 'message'], selectors: ['textarea', 'input[name*="comment"]', 'input[name*="message"]', 'input[id*="comment"]', 'input[id*="message"]'] }
      ];

      // Fill each field
      for (const [key, value] of Object.entries(formData)) {
        if (!value || typeof value !== 'string') continue;

        console.log(`🔍 Looking for field: ${key} = ${value}`);

        // Find matching field mapping
        const mapping = fieldMappings.find(m =>
          m.keys.some(k => k.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(k.toLowerCase()))
        );

        if (mapping) {
          let filled = false;

          // Try each selector until one works
          for (const selector of mapping.selectors) {
            try {
              const elements = await session.page.$$(selector);

              for (const element of elements) {
                // Check if element is visible and not already filled
                const isVisible = await element.isVisible();
                const currentValue = await element.inputValue().catch(() => '');

                if (isVisible && !currentValue) {
                  await element.fill(value);
                  console.log(`✅ Filled ${key} in ${selector}`);
                  filled = true;
                  break;
                }
              }

              if (filled) break;
            } catch (error) {
              // Continue to next selector
              continue;
            }
          }

          if (!filled) {
            console.log(`⚠️ Could not find field for: ${key}`);
          }
        }
      }

      // Wait a moment for any dynamic updates
      await session.page.waitForTimeout(1000);

    } catch (error) {
      console.error(`Form filling error [${sessionId}]:`, error);
      throw new Error(`Failed to fill form: ${error}`);
    }
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      try {
        await session.browser.close();
      } catch (error) {
        console.error(`Close session error [${sessionId}]:`, error);
      }
      this.sessions.delete(sessionId);
    }
  }

  private cleanupInactiveSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > this.sessionTimeout) {
        console.log(`Cleaning up inactive session: ${sessionId}`);
        this.closeSession(sessionId);
      }
    }
  }

  async cleanup(): Promise<void> {
    const sessionIds = Array.from(this.sessions.keys());
    await Promise.all(sessionIds.map(id => this.closeSession(id)));
  }
}

export const browserAutomation = new BrowserAutomationService();
