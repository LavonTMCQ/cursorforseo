const { chromium } = require('playwright');

async function setupGoogleOAuth() {
  console.log('🚀 Starting Google OAuth setup with Playwright...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to Google Cloud Console
    console.log('📱 Opening Google Cloud Console...');
    await page.goto('https://console.cloud.google.com');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    console.log('✅ Google Cloud Console opened!');
    console.log('👤 Please sign in to your Google account if prompted');
    
    // Wait for user to sign in
    await page.waitForTimeout(5000);
    
    // Check if we need to create a project
    console.log('🔍 Checking for existing projects...');
    
    // Try to click on project selector
    try {
      await page.click('[data-testid="project-switcher-button"]', { timeout: 5000 });
      console.log('📋 Project selector opened');
    } catch (e) {
      console.log('🔍 Looking for alternative project selector...');
      try {
        await page.click('.cfc-project-switcher-button', { timeout: 5000 });
      } catch (e2) {
        console.log('⚠️  Could not find project selector. Please manually navigate to create a new project.');
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Try to create new project
    try {
      await page.click('text=New Project', { timeout: 5000 });
      console.log('➕ Clicked "New Project"');
      
      await page.waitForTimeout(2000);
      
      // Fill project name
      await page.fill('input[name="name"]', 'SEO Pro Application');
      console.log('📝 Filled project name: SEO Pro Application');
      
      await page.waitForTimeout(1000);
      
      // Click create
      await page.click('button:has-text("Create")');
      console.log('🎯 Clicked Create button');
      
    } catch (e) {
      console.log('ℹ️  Project creation step skipped - may already have projects');
    }
    
    // Wait for project creation/selection
    await page.waitForTimeout(5000);
    
    // Navigate to APIs & Services
    console.log('🔧 Navigating to APIs & Services...');
    await page.goto('https://console.cloud.google.com/apis/library');
    
    await page.waitForTimeout(3000);
    
    // Search for Google+ API
    console.log('🔍 Searching for Google+ API...');
    await page.fill('input[placeholder*="Search"]', 'Google+ API');
    await page.press('input[placeholder*="Search"]', 'Enter');
    
    await page.waitForTimeout(2000);
    
    // Click on Google+ API
    try {
      await page.click('text=Google+ API', { timeout: 5000 });
      console.log('✅ Found and clicked Google+ API');
      
      await page.waitForTimeout(2000);
      
      // Enable the API
      try {
        await page.click('button:has-text("Enable")', { timeout: 5000 });
        console.log('🚀 Enabled Google+ API');
      } catch (e) {
        console.log('ℹ️  API may already be enabled');
      }
      
    } catch (e) {
      console.log('⚠️  Could not find Google+ API. Please search and enable it manually.');
    }
    
    await page.waitForTimeout(3000);
    
    // Navigate to Credentials
    console.log('🔑 Navigating to Credentials...');
    await page.goto('https://console.cloud.google.com/apis/credentials');
    
    await page.waitForTimeout(3000);
    
    // Create credentials
    console.log('➕ Creating OAuth 2.0 credentials...');
    try {
      await page.click('button:has-text("Create Credentials")', { timeout: 5000 });
      await page.waitForTimeout(1000);
      await page.click('text=OAuth 2.0 Client IDs');
      console.log('🎯 Selected OAuth 2.0 Client IDs');
      
    } catch (e) {
      console.log('⚠️  Could not find Create Credentials button. Please create OAuth 2.0 Client ID manually.');
    }
    
    console.log('🎉 Setup process initiated!');
    console.log('📋 Next steps:');
    console.log('1. Configure OAuth consent screen if prompted');
    console.log('2. Select "Web application" as application type');
    console.log('3. Add these authorized redirect URIs:');
    console.log('   - http://localhost:3000/api/auth/callback/google');
    console.log('4. Copy the Client ID and Client Secret when generated');
    
    // Keep browser open for manual completion
    console.log('🖥️  Browser will stay open for you to complete the setup...');
    console.log('⏳ Press Ctrl+C when done to close this script');
    
    // Wait indefinitely
    await page.waitForTimeout(300000); // 5 minutes
    
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    // Don't close browser automatically
    console.log('🔄 Keeping browser open for manual completion...');
  }
}

setupGoogleOAuth().catch(console.error);
