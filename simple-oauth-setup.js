const { chromium } = require('playwright');

async function openGoogleConsole() {
  console.log('🚀 Opening Google Cloud Console with Playwright...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📱 Navigating to Google Cloud Console...');
    await page.goto('https://console.cloud.google.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    console.log('✅ Google Cloud Console opened!');
    console.log('');
    console.log('🔧 GOOGLE OAUTH SETUP STEPS:');
    console.log('');
    console.log('1. 👤 Sign in to your Google account if prompted');
    console.log('2. 📋 Create a new project or select existing one');
    console.log('3. 🔍 Go to "APIs & Services" → "Library"');
    console.log('4. 🔍 Search for "Google+ API" and enable it');
    console.log('5. 🔑 Go to "APIs & Services" → "Credentials"');
    console.log('6. ➕ Click "Create Credentials" → "OAuth 2.0 Client IDs"');
    console.log('7. 🌐 Choose "Web application"');
    console.log('8. 📝 Add authorized redirect URI:');
    console.log('   http://localhost:3000/api/auth/callback/google');
    console.log('9. 📋 Copy the Client ID and Client Secret');
    console.log('');
    console.log('⏳ Browser will stay open. Press Ctrl+C when you have the credentials!');
    
    // Keep browser open
    await new Promise(() => {}); // Wait forever
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('🌐 You can manually go to: https://console.cloud.google.com');
  }
}

openGoogleConsole().catch(console.error);
