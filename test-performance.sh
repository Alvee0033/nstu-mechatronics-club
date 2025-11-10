#!/bin/bash

# Performance Testing Script for NSTU Mechatronics Club Website
# This script helps measure and validate performance optimizations

echo "🚀 NSTU Mechatronics Club - Performance Testing"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if site is running
check_site() {
    echo "📡 Checking if site is running..."
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✓ Site is running on http://localhost:3000${NC}"
        return 0
    else
        echo -e "${RED}✗ Site is not running. Please start it first:${NC}"
        echo "   cd frontend && npm run dev"
        return 1
    fi
}

# Check bundle size
check_bundle() {
    echo ""
    echo "📦 Checking bundle size..."
    if [ -d "frontend/.next/static" ]; then
        BUNDLE_SIZE=$(du -sh frontend/.next/static | cut -f1)
        echo -e "${GREEN}✓ Bundle size: $BUNDLE_SIZE${NC}"
    else
        echo -e "${YELLOW}⚠ No build found. Run 'npm run build' first${NC}"
    fi
}

# Test image optimization
test_images() {
    echo ""
    echo "🖼️  Checking image optimization..."
    
    if [ -d "frontend/public/images" ]; then
        IMAGE_COUNT=$(find frontend/public/images -type f | wc -l)
        echo "   Found $IMAGE_COUNT image(s)"
        
        # Check for large images
        LARGE_IMAGES=$(find frontend/public/images -type f -size +500k)
        if [ -z "$LARGE_IMAGES" ]; then
            echo -e "${GREEN}✓ All images are under 500KB${NC}"
        else
            echo -e "${YELLOW}⚠ Large images found (>500KB):${NC}"
            echo "$LARGE_IMAGES"
        fi
    else
        echo -e "${YELLOW}⚠ No images directory found${NC}"
    fi
}

# Test video optimization
test_video() {
    echo ""
    echo "🎥 Checking video optimization..."
    
    if [ -f "frontend/public/background-video.mp4" ]; then
        VIDEO_SIZE=$(du -h frontend/public/background-video.mp4 | cut -f1)
        echo -e "${GREEN}✓ Video found: $VIDEO_SIZE${NC}"
        
        # Check if poster exists
        if [ -f "frontend/public/images/video-poster.jpg" ]; then
            POSTER_SIZE=$(du -h frontend/public/images/video-poster.jpg | cut -f1)
            echo -e "${GREEN}✓ Poster found: $POSTER_SIZE${NC}"
        else
            echo -e "${RED}✗ Video poster missing!${NC}"
            echo "   Create poster: ffmpeg -i frontend/public/background-video.mp4 -ss 00:00:01 -vframes 1 frontend/public/images/video-poster.jpg"
        fi
    else
        echo -e "${RED}✗ Background video not found!${NC}"
        echo "   Expected location: frontend/public/background-video.mp4"
    fi
}

# Check dependencies
check_deps() {
    echo ""
    echo "📚 Checking dependencies..."
    
    cd frontend
    
    # Check for unused dependencies
    if command -v npx &> /dev/null; then
        echo "   Checking for unused dependencies..."
        npx depcheck --ignores="@types/*,eslint*" 2>&1 | grep -A 5 "Unused dependencies"
    fi
    
    cd ..
}

# Performance tips
show_tips() {
    echo ""
    echo "💡 Performance Tips:"
    echo "   1. Run Lighthouse audit: npx lighthouse http://localhost:3000 --view"
    echo "   2. Analyze bundle: cd frontend && npm run build && npx @next/bundle-analyzer"
    echo "   3. Test on slow network: Chrome DevTools > Network > Slow 3G"
    echo "   4. Monitor Core Web Vitals in production"
    echo "   5. Use lazy loading for images: loading='lazy'"
}

# Lighthouse test (if available)
run_lighthouse() {
    echo ""
    echo "🔍 Running Lighthouse audit..."
    
    if command -v npx &> /dev/null; then
        echo "   This may take a minute..."
        npx lighthouse http://localhost:3000 \
            --only-categories=performance \
            --output=json \
            --output-path=./lighthouse-report.json \
            --quiet 2>&1 | grep -E "Performance|Largest Contentful Paint|First Contentful Paint|Time to Interactive"
        
        if [ -f "./lighthouse-report.json" ]; then
            echo -e "${GREEN}✓ Report saved to lighthouse-report.json${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Lighthouse not available${NC}"
    fi
}

# Main execution
main() {
    check_site || exit 1
    check_bundle
    test_images
    test_video
    check_deps
    
    echo ""
    read -p "🔍 Run Lighthouse audit? (takes ~1 minute) [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_lighthouse
    fi
    
    show_tips
    
    echo ""
    echo "================================================"
    echo -e "${GREEN}✓ Performance check complete!${NC}"
    echo ""
}

# Run main function
main
