#!/bin/bash
# Production Deployment Script for AWS Server
# Solves Internal Server Error issues

echo "🚀 Starting Production Deployment..."

# Navigate to frontend directory
cd /home/ubuntu/monstas7/frontend || exit

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin master

# Clean up previous build artifacts
echo "🧹 Cleaning up previous build..."
rm -rf .next
rm -rf node_modules/.cache
pm2 stop monsta-frontend || true
pm2 delete monsta-frontend || true

# Install dependencies with clean install
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Fix encoding issues in files before build
echo "🔧 Fixing file encoding issues..."
# Convert files with encoding issues to UTF-8
find app/news -name "*.tsx" -type f -exec file -b --mime-encoding {} \; | grep -v "utf-8" | while read -r file; do
  echo "Converting $file to UTF-8..."
  iconv -f iso-8859-1 -t utf-8 "$file" > "$file.tmp" && mv "$file.tmp" "$file" 2>/dev/null || true
done

# Set production environment
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"

# Try production build
echo "🏗️ Building production version..."
npm run build || {
  echo "⚠️ Production build failed, falling back to development mode..."

  # If production build fails, use development mode with PM2
  pm2 start ecosystem.config.js --env production
  pm2 save

  echo "✅ Server running in development mode on port 3000"
  echo "⚠️ Note: Running in dev mode due to build issues. Fix encoding errors for production build."
  exit 0
}

# If build succeeds, start production server
echo "🎉 Production build successful!"
echo "🚀 Starting production server..."

# Start with PM2 in production mode
pm2 start npm --name monsta-frontend -- run start -- -H 0.0.0.0 -p 3000
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "✅ Deployment completed successfully!"
echo "🌐 Server running at http://15.165.105.250:3000"
echo "📊 Check status with: pm2 status"
echo "📝 View logs with: pm2 logs monsta-frontend"