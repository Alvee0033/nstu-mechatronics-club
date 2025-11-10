# Video & Image Assets Guide

## Background Video Optimization

### Required Video File:
- **Location**: `/public/background-video.mp4`
- **Recommended Settings**:
  - Resolution: 1920x1080 (Full HD)
  - Codec: H.264
  - Bitrate: 2-3 Mbps
  - Duration: 10-30 seconds (looping)
  - Frame Rate: 30 fps
  - Audio: None (muted video)

### Creating Optimized Video:

```bash
# Install FFmpeg if not already installed
# Ubuntu/Debian: sudo apt-get install ffmpeg
# macOS: brew install ffmpeg
# Windows: Download from https://ffmpeg.org/

# Optimize existing video
ffmpeg -i your-video.mp4 \
  -vcodec h264 \
  -preset slow \
  -crf 22 \
  -vf "scale=1920:1080" \
  -an \
  -movflags +faststart \
  background-video.mp4

# Parameters explained:
# -vcodec h264: Use H.264 codec (best browser support)
# -preset slow: Better compression (slower encoding)
# -crf 22: Quality level (18-28, lower = better quality)
# -vf "scale=1920:1080": Resize to Full HD
# -an: Remove audio
# -movflags +faststart: Enable fast start for web streaming
```

## Video Poster Image

### Required Poster File:
- **Location**: `/public/images/video-poster.jpg`
- **Purpose**: Shows while video is loading
- **Recommended Settings**:
  - Resolution: 1920x1080 (match video)
  - Format: JPEG
  - Quality: 80-85%
  - File Size: < 200KB

### Creating Poster from Video:

```bash
# Extract frame at 1 second
ffmpeg -i background-video.mp4 -ss 00:00:01 -vframes 1 video-poster.jpg

# Optimize poster image
ffmpeg -i video-poster.jpg -q:v 2 -vf "scale=1920:1080" video-poster-optimized.jpg

# Alternative: Using ImageMagick
convert video-poster.jpg -quality 85 -resize 1920x1080 video-poster-optimized.jpg
```

### Manual Creation (if no video yet):
1. Use any graphic design tool (Canva, Figma, Photoshop)
2. Create 1920x1080 canvas
3. Use dark gradient background (gray-900 to purple-900)
4. Add club logo or abstract tech graphics
5. Export as JPEG, quality 80-85%
6. Save as `/public/images/video-poster.jpg`

## Member Profile Images

### Guidelines:
- **Format**: JPEG or PNG
- **Size**: 400x400px (square)
- **File Size**: < 100KB each
- **Naming**: Use descriptive names (e.g., `john-doe.jpg`)
- **Location**: Upload via admin panel (stored as base64 in Firestore)

### Optimization Script:

```bash
# Bulk optimize images
for img in *.jpg; do
  ffmpeg -i "$img" -vf "scale=400:400" -q:v 3 "optimized-$img"
done

# Using ImageMagick
mogrify -resize 400x400^ -gravity center -extent 400x400 -quality 85 *.jpg
```

## Project & Event Images

### Requirements:
- **Format**: JPEG
- **Aspect Ratio**: 16:9 or 4:3
- **Resolution**: 1200x675 (landscape)
- **File Size**: < 150KB

### Placeholder Images:
If you don't have actual images, use placeholder services:
- https://picsum.photos/1200/675
- https://via.placeholder.com/1200x675
- https://source.unsplash.com/1200x675/?technology

## Image Compression Tools

### Online Tools:
1. **TinyPNG** - https://tinypng.com/
2. **Squoosh** - https://squoosh.app/ (by Google)
3. **Compressor.io** - https://compressor.io/

### Command Line:
```bash
# ImageMagick
convert input.jpg -quality 85 -strip output.jpg

# FFmpeg
ffmpeg -i input.jpg -q:v 2 output.jpg

# cwebp (WebP format)
cwebp -q 80 input.jpg -o output.webp
```

## Directory Structure

```
public/
├── background-video.mp4          # Landing page background video
├── images/
│   ├── video-poster.jpg          # Video loading placeholder
│   ├── logo.png                  # Club logo
│   ├── project1.jpg              # Project images
│   ├── project2.jpg
│   ├── event1.jpg                # Event images
│   └── event2.jpg
└── favicon.ico                   # Browser icon
```

## Quick Start (If Missing Assets)

### 1. Create Placeholder Poster:
```bash
# Create solid color image as placeholder
ffmpeg -f lavfi -i color=c=0x1a1a2e:s=1920x1080 -frames:v 1 public/images/video-poster.jpg
```

### 2. Download Free Stock Video:
- **Pexels Videos**: https://www.pexels.com/videos/
- **Pixabay Videos**: https://pixabay.com/videos/
- Search for: "technology", "digital", "abstract", "circuit"

### 3. Free Images for Projects:
- **Unsplash**: https://unsplash.com/s/photos/robotics
- **Pexels**: https://www.pexels.com/search/technology/

## Performance Tips

1. **Always compress images** before uploading
2. **Use appropriate formats**:
   - Photos: JPEG
   - Graphics/logos: PNG
   - Modern browsers: WebP
3. **Lazy load** everything except above-the-fold images
4. **Generate thumbnails** for large images
5. **Use CDN** for production (Cloudflare, Cloudinary)

## Troubleshooting

### Video not showing?
- Check file exists at `/public/background-video.mp4`
- Verify video codec (must be H.264)
- Check browser console for errors
- Test in different browsers

### Poster not showing?
- Check file exists at `/public/images/video-poster.jpg`
- Verify image path is correct
- Check file permissions

### Images loading slowly?
- Compress images (target < 100KB)
- Enable lazy loading
- Use WebP format
- Consider using CDN

## Resources

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [ImageMagick Guide](https://imagemagick.org/script/command-line-processing.php)
- [Web Image Best Practices](https://web.dev/fast/#optimize-your-images)
- [Video Optimization Guide](https://web.dev/video/)

---

**Note**: For production, consider using a video hosting service (YouTube, Vimeo) or CDN to serve video content for better performance and reduced server load.
