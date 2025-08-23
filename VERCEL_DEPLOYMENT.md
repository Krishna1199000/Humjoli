# Vercel Deployment Guide - PDF Generation Fix

## Issue Resolution

The PDF generation issue on Vercel has been fixed by implementing environment-aware Chromium configuration. Here are the key changes made:

### 1. Updated InvoiceTemplate.ts
- **Environment Detection**: Automatically detects Vercel vs local development
- **Dual Configuration**: Uses `@sparticuz/chromium` for Vercel, regular `puppeteer` for local
- **Better Error Handling**: Enhanced error messages and logging
- **Improved Browser Launch**: Proper arguments for both environments

### 2. Updated Next.js Configuration
- **Webpack Configuration**: Added proper external package handling
- **Server Components**: Configured external packages correctly

### 3. Created Vercel Configuration
- **Function Timeouts**: Set 30-second timeout for PDF generation functions
- **Build Environment**: Configured to skip Chromium download during build

## How It Works

### Environment Detection
The system now automatically detects the environment:

```typescript
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

if (isVercel) {
  // Use @sparticuz/chromium for Vercel
  browser = await puppeteerCore.launch({
    args: [...chromium.args, ...],
    executablePath: await chromium.executablePath(),
    // ... Vercel-specific config
  });
} else {
  // Use regular puppeteer for local development
  const puppeteer = (await import('puppeteer')).default;
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', ...],
    // ... Local development config
  });
}
```

## Deployment Steps

### 1. Environment Variables
Make sure these environment variables are set in your Vercel project:

```bash
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 2. Build Settings
The following settings are automatically configured:

- **Node.js Version**: 18.x or higher
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Function Configuration
The `vercel.json` file configures:
- 30-second timeout for PDF generation functions
- Proper handling of Chromium packages

## Testing PDF Generation

### Local Testing
1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Test PDF Generation**:
   - Login as admin
   - Create or view an invoice
   - Click download PDF
   - Check console logs for environment detection

### Production Testing
After deployment:

1. **Login as Admin**: Access your admin dashboard
2. **Create/View Invoice**: Navigate to invoice management
3. **Download PDF**: Click the download button
4. **Check Logs**: Monitor Vercel function logs for any errors

## Troubleshooting

### If PDF generation still fails:

1. **Check Environment Detection**:
   - Look for console logs showing "Using Vercel Chromium configuration" or "Using local Puppeteer configuration"
   - Verify the correct configuration is being used

2. **Check Vercel Logs**:
   - Go to your Vercel dashboard
   - Navigate to Functions tab
   - Check the logs for the PDF generation functions

3. **Verify Environment Variables**:
   - Ensure all required environment variables are set
   - Check that DATABASE_URL is accessible from Vercel

4. **Test Locally First**:
   ```bash
   npm run build
   npm start
   ```
   Test PDF generation locally before deploying

5. **Check Function Timeouts**:
   - PDF generation might take 10-20 seconds
   - Functions are configured with 30-second timeout

### Common Issues:

1. **"Could not find Chrome" Error**:
   - **Fixed**: Environment detection now uses the correct browser for each environment
   - **Local**: Uses regular puppeteer with system Chrome
   - **Vercel**: Uses @sparticuz/chromium

2. **"spawn chromium ENOENT" Error**:
   - **Fixed**: No longer tries to use Chromium on local Windows
   - **Solution**: Automatically falls back to regular puppeteer

3. **Database Connection Issues**:
   - Verify DATABASE_URL is correct
   - Ensure database is accessible from Vercel's IP ranges

4. **Memory Issues**:
   - PDF generation is memory-intensive
   - Consider upgrading to Vercel Pro for higher memory limits

## Performance Optimization

1. **Caching**: Consider implementing PDF caching for frequently accessed invoices
2. **Async Processing**: For large reports, consider using background jobs
3. **Compression**: PDFs are automatically compressed by Vercel

## Debug Information

The system now logs detailed information:

```
Environment: development
Platform: win32
Using local Puppeteer configuration
```

or

```
Environment: production
Platform: linux
Using Vercel Chromium configuration
```

## Support

If you continue to experience issues:

1. Check the environment detection logs
2. Verify all environment variables are set correctly
3. Test with a simple invoice first
4. Contact support with specific error messages from the logs

## Recent Fixes

- ✅ **Environment Detection**: Automatically uses correct browser for each environment
- ✅ **Local Development**: Uses regular puppeteer on Windows/Linux/Mac
- ✅ **Vercel Deployment**: Uses @sparticuz/chromium in production
- ✅ **Error Handling**: Better error messages and fallback logic
- ✅ **Logging**: Detailed console logs for debugging
