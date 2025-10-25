#!/bin/bash
# Deployment Test Script for Zorn Website 2.0

echo "🚀 Zorn Website 2.0 - Deployment Preparation"
echo "============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 missing${NC}"
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1/ directory exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1/ directory missing${NC}"
        return 1
    fi
}

echo ""
echo "📁 Checking file structure..."
check_file "index.html"
check_file "about.html"
check_file "apply.html"
check_file "contact.html"
check_file "partners.html"
check_file "roster.html"
check_file "store.html"

echo ""
echo "🔧 Checking configuration files..."
check_file "netlify.toml"
check_file "render.yaml"
check_file "package.json"
check_file ".gitignore"
check_file "robots.txt"
check_file "sitemap.xml"
check_file "404.html"

echo ""
echo "📂 Checking directories..."
check_dir "assets"
check_dir "assets/css"
check_dir "assets/js"  
check_dir "assets/img"
check_dir ".github"
check_dir ".github/workflows"

echo ""
echo "🔍 Checking for common issues..."

# Check for absolute paths in HTML (basic check)
if grep -r "href=\"/" *.html > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Warning: Absolute paths found in HTML files${NC}"
    echo "   Consider using relative paths for better compatibility"
else
    echo -e "${GREEN}✅ No absolute paths detected in HTML files${NC}"
fi

# Check image extensions
echo ""
echo "🖼️  Checking image files..."
image_count=$(find assets/img -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.svg" \) 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Found $image_count image files${NC}"

# Check CSS and JS files
css_count=$(find assets/css -name "*.css" 2>/dev/null | wc -l)
js_count=$(find assets/js -name "*.js" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Found $css_count CSS files and $js_count JS files${NC}"

echo ""
echo "🌐 Testing local server..."
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✅ Python 3 available for local testing${NC}"
    echo -e "${YELLOW}💡 Run: python3 -m http.server 8000${NC}"
elif command -v python &> /dev/null; then
    echo -e "${GREEN}✅ Python available for local testing${NC}"  
    echo -e "${YELLOW}💡 Run: python -m http.server 8000${NC}"
else
    echo -e "${YELLOW}⚠️  Python not found - install for local testing${NC}"
fi

echo ""
echo "📊 Quick stats:"
html_files=$(ls *.html 2>/dev/null | wc -l)
echo "   HTML pages: $html_files"
echo "   CSS files: $css_count"
echo "   JS files: $js_count"  
echo "   Images: $image_count"

echo ""
echo "🎯 Next steps:"
echo "1. Review DEPLOYMENT_CHECKLIST.md"
echo "2. Test locally with: python -m http.server 8000"
echo "3. Commit and push to GitHub"
echo "4. Deploy to your chosen platform"

echo ""
echo -e "${GREEN}🚀 Website appears ready for deployment!${NC}"
echo "============================================="