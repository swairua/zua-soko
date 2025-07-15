# Simple GitHub Update Steps

## Step 1: Update package.json

1. Go to your GitHub repository
2. Click on `package.json` file
3. Click "Edit" (pencil icon)
4. Find line 7 that says: `"build": "next build",`
5. Change it to: `"build": "prisma generate && next build",`
6. Click "Commit changes"

## Step 2: Create vercel.json

1. In your GitHub repository, click "Add file" → "Create new file"
2. Name the file: `vercel.json`
3. Copy and paste this simple content:

```
{
  "buildCommand": "prisma generate && npm run build"
}
```

4. Click "Commit new file"

## Step 3: Redeploy in Vercel

1. Go to your Vercel dashboard
2. Find your zuasoko project
3. Click "Redeploy"
4. Select the latest commit
5. Wait for build to complete

## Alternative: Even Simpler Fix

If the above doesn't work, try this in Vercel:

1. Go to your Vercel project settings
2. Find "Build & Output Settings"
3. Override build command with: `prisma generate && npm run build`
4. Save and redeploy

This should fix the build error!
