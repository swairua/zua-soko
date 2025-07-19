# Builder.io Integration Guide

This document explains how to use Builder.io to manage content in your Zuasoko application and deploy it live, bypassing Vercel settings.

## 🚀 Quick Start

### 1. Get Your Builder.io API Key

1. Sign up at [Builder.io](https://builder.io)
2. Go to [Account Settings](https://builder.io/account/organization)
3. Copy your Public API Key

### 2. Configure Environment Variables

Add your Builder.io API key to your environment files:

```bash
# frontend/.env.development
VITE_BUILDER_PUBLIC_API_KEY=your-api-key-here

# frontend/.env.production
VITE_BUILDER_PUBLIC_API_KEY=your-api-key-here
```

### 3. Install Dependencies

```bash
npm run setup:builder
```

### 4. Deploy to Builder.io (Bypass Vercel)

```bash
npm run deploy:builder
```

## 📋 Available Models

### Page Model

Create full pages managed by Builder.io:

- **URL**: `/builder/*`
- **Component**: `BuilderPage`
- **Use Case**: Landing pages, marketing content, announcements

### Section Model

Add dynamic sections to existing pages:

- **Homepage Hero**: `homepage-hero`
- **Homepage Features**: `homepage-features`
- **Use Case**: Dynamic content within existing pages

## 🛠️ Custom Components

The following components are available in Builder.io:

### HeroSection

A customizable hero section with title, subtitle, and CTA button.

**Inputs:**

- `title` (string): Main heading
- `subtitle` (string): Subheading text
- `buttonText` (string): CTA button text
- `buttonLink` (string): CTA button URL

### FeatureCard

A feature card component for showcasing product features.

**Inputs:**

- `title` (string): Feature title
- `description` (string): Feature description
- `icon` (string): Emoji or icon

## 🌐 Deployment Options

### Option 1: Builder.io Hosting (Recommended)

Completely bypass Vercel and use Builder.io's hosting:

```bash
npm run deploy:builder
```

This will:

- Build your React application
- Upload to Builder.io hosting
- Configure API routes
- Set up custom domain (if configured)

### Option 2: Hybrid Deployment

Keep your existing infrastructure but add Builder.io content:

1. Deploy your API to your current hosting
2. Use Builder.io for content management only
3. Content loads dynamically from Builder.io

## 📁 Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── builder.ts              # Builder.io initialization
│   │   └── builder-registry.ts     # Component registration
│   ├── components/
│   │   ├── BuilderPage.tsx         # Full page component
│   │   └── BuilderSection.tsx      # Section component
│   ├── hooks/
│   │   └── useBuilderContent.ts    # Content fetching hook
│   └── pages/
│       ├── BuilderPage.tsx         # Dynamic page handler
│       └── HomePage.tsx            # Enhanced with Builder content
├── .env.development                # Development config
└── .env.production                 # Production config

builder.config.js                  # Builder.io configuration
deploy-builder.js                   # Deployment script
```

## 🔧 Configuration

### Custom Domain Setup

Set your custom domain in environment variables:

```bash
BUILDER_CUSTOM_DOMAIN=your-domain.com
```

### API Route Configuration

The following API routes are preserved:

- `/api/auth/*` - Authentication
- `/api/marketplace/*` - Marketplace data
- `/api/status` - Health checks

## 📝 Content Creation

### Creating a New Page

1. Go to [Builder.io Dashboard](https://builder.io/content)
2. Create new content for model "page"
3. Set the URL path (e.g., `/about`, `/contact`)
4. Design your page using the visual editor
5. Publish the content

### Adding Dynamic Sections

1. Create content for model "section"
2. Set the section name:
   - `homepage-hero` - Replaces homepage hero
   - `homepage-features` - Adds to features section
3. Design using available components
4. Publish to see changes live

## 🎯 Integration with Existing Components

### HomePage Integration

The HomePage component automatically loads Builder.io content:

```tsx
// Automatically loads if content exists
{
  heroContent && (
    <BuilderSection
      sectionName="homepage-hero"
      content={heroContent}
      data={{ user, isAuthenticated }}
    />
  );
}
```

### Custom Component Registration

Register your own components:

```tsx
// In builder-registry.ts
Builder.registerComponent(YourComponent, {
  name: "YourComponent",
  inputs: [
    { name: "title", type: "string" },
    { name: "description", type: "string" },
  ],
});
```

## 🚀 Live Deployment Process

### 1. Build for Production

```bash
npm run deploy:builder
```

### 2. Upload to Builder.io

The script will prepare all files in `frontend/dist/` for upload to Builder.io hosting.

### 3. Configure DNS

Point your domain to Builder.io hosting:

- A Record: `18.217.248.45`
- CNAME: `your-site.builder.io`

### 4. SSL Setup

Builder.io automatically provides SSL certificates for custom domains.

## 🔄 Development Workflow

### Local Development

```bash
npm run dev
```

- App runs on `http://localhost:3000`
- Builder.io content loads dynamically
- Live preview in Builder.io editor

### Content Updates

1. Edit content in Builder.io dashboard
2. Changes appear immediately (no deployment needed)
3. Preview before publishing

### Code Updates

1. Make code changes locally
2. Test with `npm run dev`
3. Deploy with `npm run deploy:builder`

## 🛡️ Security & Performance

### API Security

- All existing authentication remains unchanged
- API routes are protected as before
- Builder.io only manages content, not data

### Performance

- Builder.io uses global CDN
- Content is cached automatically
- Images are optimized automatically

### SEO

- Meta tags managed in Builder.io
- Automatic sitemap generation
- Server-side rendering support

## 🆘 Troubleshooting

### Common Issues

**Builder.io content not loading:**

- Check API key in environment variables
- Verify content is published in Builder.io
- Check browser network tab for API errors

**Components not appearing in Builder.io:**

- Ensure components are registered in `builder-registry.ts`
- Check component imports are correct
- Verify Builder.io initialization

**Deployment failures:**

- Check all environment variables are set
- Verify API key has correct permissions
- Ensure build directory exists

### Support Resources

- [Builder.io Documentation](https://www.builder.io/c/docs)
- [Builder.io Discord](https://discord.gg/builder)
- [GitHub Issues](https://github.com/BuilderIO/builder/issues)

## 📈 Next Steps

1. **Set up your Builder.io account**
2. **Configure environment variables**
3. **Run the deployment script**
4. **Create your first content in Builder.io**
5. **Configure your custom domain**

Your Zuasoko application will now be powered by Builder.io, giving you complete control over content without touching code or Vercel settings.
