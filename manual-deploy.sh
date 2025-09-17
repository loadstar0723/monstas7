#!/bin/bash
# Manual deployment script for AWS server
# Run this on the AWS server after SSH access

echo "🚀 Starting manual deployment..."

# Navigate to project directory
cd /home/ubuntu/monstas7 || exit 1

# Git operations
echo "📥 Pulling latest code..."
git fetch origin
git reset --hard origin/master
git pull origin master

# Navigate to frontend
cd frontend || exit 1

# Clean previous build
echo "🧹 Cleaning previous build..."
pm2 stop monsta-frontend 2>/dev/null || true
pm2 delete monsta-frontend 2>/dev/null || true
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Create ecosystem config for PM2
echo "⚙️ Creating PM2 config..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'monsta-frontend',
    script: 'npx',
    args: 'next dev -H 0.0.0.0 -p 3000',
    cwd: '/home/ubuntu/monstas7/frontend',
    env: {
      NODE_ENV: 'development',
      NODE_OPTIONS: '--max-old-space-size=2048'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF

# Start with PM2
echo "🏃 Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

# Show status
echo "✅ Deployment complete!"
echo "📊 Current status:"
pm2 status

echo "📝 Logs:"
pm2 logs monsta-frontend --lines 20

echo ""
echo "🌐 Server should be running at http://15.165.105.250:3000"
echo "📖 View logs: pm2 logs monsta-frontend"
echo "🔄 Restart: pm2 restart monsta-frontend"
echo "🛑 Stop: pm2 stop monsta-frontend"