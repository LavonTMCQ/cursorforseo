# 🚀 SEO Pro Deployment Guide

Complete guide to deploy SEO Pro to production with automatic deployments.

## 🏗️ Architecture Overview

- **Frontend**: Next.js app deployed to Vercel
- **Backend**: WebSocket server deployed to Railway
- **Version Control**: GitHub with automatic deployments
- **Result**: Live app accessible from anywhere!

## 📋 Step-by-Step Deployment

### Phase 1: Repository Setup

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SEO Pro with Cursor for SEO"
   ```

2. **Create GitHub Repository**
   - Go to [GitHub](https://github.com/new)
   - Create new repository: `seo-pro`
   - Don't initialize with README (we already have code)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/seo-pro.git
   git branch -M main
   git push -u origin main
   ```

### Phase 2: Environment Variables Setup

1. **Copy Environment Template**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your values in .env.local**
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEXTAUTH_SECRET=your_random_secret_here
   ```

### Phase 3: Backend Deployment (Railway)

1. **Sign up for Railway**
   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `seo-pro` repository
   - Railway will auto-detect the Dockerfile

3. **Set Environment Variables in Railway**
   ```
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
   ```

4. **Get Railway URL**
   - After deployment, copy your Railway app URL
   - It will look like: `https://your-app-name.railway.app`

### Phase 4: Frontend Deployment (Vercel)

1. **Sign up for Vercel**
   - Go to [Vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Set Environment Variables in Vercel**
   ```
   NEXT_PUBLIC_WEBSOCKET_URL=wss://your-railway-app.railway.app
   OPENAI_API_KEY=your_openai_api_key
   NEXTAUTH_SECRET=your_random_secret
   NEXTAUTH_URL=https://your-vercel-app.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Phase 5: Test Production App

1. **Access Your Live App**
   - Go to your Vercel URL: `https://your-app.vercel.app`
   - Test all functionality:
     - Navigation between pages
     - Browser Agent functionality
     - Cursor for SEO interface
     - WebSocket connection

2. **Test from Different Devices**
   - Mobile phone
   - Different computer
   - Share with team/investors

## 🔄 Automatic Deployments

Once set up, any push to GitHub will automatically:
1. Deploy backend to Railway
2. Deploy frontend to Vercel
3. Update live app instantly

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main
# 🎉 Automatically deploys to production!
```

## 🌐 Production URLs

After deployment, you'll have:
- **Live App**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app`
- **Health Check**: `https://your-backend.railway.app/health`

## 🔧 Environment Variables Reference

### Frontend (Vercel)
```env
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-backend.railway.app
OPENAI_API_KEY=your_openai_api_key
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### Backend (Railway)
```env
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.vercel.app
PORT=3001
```

## 🎯 Benefits

✅ **Live App**: Accessible from anywhere  
✅ **Automatic Deployments**: Push to deploy  
✅ **Professional URLs**: Perfect for investors  
✅ **Scalable**: Handles multiple users  
✅ **Secure**: Environment variables protected  
✅ **Fast**: Global CDN via Vercel  
✅ **Reliable**: 99.9% uptime  

## 💰 Costs

- **Vercel**: Free for hobby projects
- **Railway**: ~$5-20/month for backend
- **Domain**: ~$10-15/year (optional)
- **Total**: Very affordable for professional app

## 🆘 Troubleshooting

### WebSocket Connection Issues
1. Check CORS settings in Railway
2. Verify environment variables
3. Check Railway logs

### Build Failures
1. Check build logs in Vercel/Railway
2. Verify all dependencies in package.json
3. Check TypeScript errors

### Need Help?
- Railway docs: [docs.railway.app](https://docs.railway.app)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- GitHub issues: Create issue in your repo

## 🎉 You're Live!

Once deployed, your SEO Pro app will be:
- Accessible from anywhere in the world
- Automatically updated when you push changes
- Perfect for investor demonstrations
- Ready for real users and customers

Share your live URL with confidence! 🚀
