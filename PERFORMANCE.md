# Performance Optimization Guide

## Overview
This document outlines all performance optimizations implemented for the NSTU Mechatronics Club website.

## 1. Video Optimization (Landing Page)

### Background Video
- **Preload Strategy**: `preload="metadata"` - Only loads video metadata initially
- **Poster Image**: `poster="/images/video-poster.jpg"` - Shows image until video loads
- **GPU Acceleration**: `style={{ willChange: 'auto' }}` - Optimizes rendering
- **Format**: MP4 with H.264 codec (best browser support)
- **Fallback**: Graceful degradation for unsupported browsers

### Recommendations for Video File:
```bash
# Compress video using FFmpeg for optimal web delivery
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 2M -preset slow -crf 22 background-video.mp4

# Create poster image from video frame
ffmpeg -i background-video.mp4 -ss 00:00:01 -vframes 1 video-poster.jpg
```

## 2. Image Optimization (Members Page)

### Member Profile Images
- **Lazy Loading**: `loading="lazy"` - Images load only when near viewport
- **Async Decoding**: `decoding="async"` - Non-blocking image decode
- **Loading States**: Animated pulse placeholder while loading
- **Error Handling**: Graceful fallback to initials avatar
- **Smooth Transitions**: Fade-in effect when images load

### Implementation:
```tsx
<img 
  src={imageUrl}
  alt={name}
  loading="lazy"           // Native lazy loading
  decoding="async"         // Async decode
  className="opacity-0"    // Start hidden
  onLoad={() => setLoaded(true)}  // Show when loaded
  onError={() => setError(true)}  // Fallback on error
/>
```

## 3. Next.js Configuration

### Image Optimization (`next.config.ts`)
```typescript
images: {
  formats: ['image/webp', 'image/avif'],  // Modern formats
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,  // Cache images for 60 seconds
}
```

### Build Optimizations
- **Compression**: Enabled gzip/brotli compression
- **Package Import Optimization**: Treeshaking for lucide-react, framer-motion
- **CSS Optimization**: Automatic CSS minification

## 4. Code Splitting & Dynamic Imports

### Landing Page
```tsx
// Lazy load heavy particle background
const ParticleBackground = dynamic(() => import('@/components/ui/ParticleBackground'), {
  ssr: false,          // Client-side only
  loading: () => null, // No loading state needed
});
```

### Benefits:
- Reduces initial bundle size
- Faster Time to Interactive (TTI)
- Non-blocking render

## 5. Font Optimization

### Google Fonts (Inter)
```tsx
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',    // Prevents FOIT (Flash of Invisible Text)
  preload: true,      // Preload critical font
});
```

### Resource Hints
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://firestore.googleapis.com" />
```

## 6. Performance Utilities (`lib/performance.ts`)

### Available Functions:
1. **lazyLoadImage()** - Intersection Observer based lazy loading
2. **preloadResource()** - Preload critical resources
3. **debounce()** - Debounce expensive operations
4. **throttle()** - Throttle scroll/resize handlers
5. **compressImage()** - Client-side image compression
6. **generateLQIP()** - Low-Quality Image Placeholders

## 7. Best Practices Implemented

### CSS & Animations
- ✅ Hardware-accelerated transforms (translate, scale)
- ✅ Framer Motion with optimized spring animations
- ✅ Reduced motion queries for accessibility
- ✅ CSS containment for layout optimization

### JavaScript
- ✅ Component-level code splitting
- ✅ Memoization for expensive calculations
- ✅ Debounced/throttled event handlers
- ✅ Async data fetching with loading states

### Network
- ✅ DNS prefetching for external resources
- ✅ Preconnect to critical domains
- ✅ Compression enabled (gzip/brotli)
- ✅ Static asset caching

## 8. Measurement & Monitoring

### Key Metrics to Track:
1. **First Contentful Paint (FCP)** - Target: < 1.8s
2. **Largest Contentful Paint (LCP)** - Target: < 2.5s
3. **Time to Interactive (TTI)** - Target: < 3.8s
4. **Cumulative Layout Shift (CLS)** - Target: < 0.1
5. **First Input Delay (FID)** - Target: < 100ms

### Tools:
```bash
# Lighthouse audit
npm run build
npx lighthouse http://localhost:3000 --view

# Bundle analysis
npm run build
npx @next/bundle-analyzer
```

## 9. Further Optimizations (Future)

### Progressive Enhancement:
- [ ] Service Worker for offline support
- [ ] IndexedDB caching for member data
- [ ] WebP/AVIF with PNG fallback
- [ ] Adaptive image loading based on connection speed

### Advanced Techniques:
- [ ] HTTP/3 QUIC protocol
- [ ] Edge caching with CDN
- [ ] Skeleton screens for loading states
- [ ] Resource priorities with fetchpriority attribute

### Database Optimization:
- [ ] Firestore composite indexes
- [ ] Pagination for large member lists
- [ ] Thumbnail generation on upload
- [ ] Image CDN integration (Cloudinary, Imgix)

## 10. Performance Checklist

Before deploying:
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test on slow 3G network
- [ ] Verify lazy loading works
- [ ] Check image compression
- [ ] Test on mobile devices
- [ ] Verify video loads properly
- [ ] Check console for errors
- [ ] Validate Core Web Vitals
- [ ] Test with different browsers
- [ ] Measure bundle size

## 11. Maintenance

### Regular Tasks:
1. **Weekly**: Check Core Web Vitals in production
2. **Monthly**: Audit bundle size and dependencies
3. **Quarterly**: Update performance baseline metrics
4. **Annually**: Review and update optimization strategies

### Monitoring:
```bash
# Check bundle size
npm run build
du -sh .next/static

# Analyze dependencies
npx depcheck
npx npm-check-updates
```

## Resources

- [Next.js Performance Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance Guide](https://web.dev/performance/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)

---

**Last Updated**: December 2024  
**Maintained by**: NSTU Mechatronics Club Web Team
