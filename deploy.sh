#!/bin/bash

# MONSTA Platform Deployment Script
# Supports multiple cloud providers

set -e

echo "🚀 MONSTA Platform Deployment Script"
echo "====================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check dependencies
check_dependencies() {
    echo "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install Docker."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose not found. Please install Docker Compose."
        exit 1
    fi
    
    print_status "All dependencies installed"
}

# Build Docker image
build_image() {
    echo "Building Docker image..."
    docker build -t monsta-app:latest .
    print_status "Docker image built successfully"
}

# Deploy to local Docker
deploy_local() {
    echo "Deploying to local Docker..."
    docker-compose -f docker-compose.production.yml up -d
    print_status "Local deployment complete"
    echo "Access the application at: http://localhost:8501"
}

# Deploy to Railway
deploy_railway() {
    echo "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    railway login
    railway up
    print_status "Railway deployment complete"
}

# Deploy to Render
deploy_render() {
    echo "Deploying to Render..."
    
    if [ ! -f render.yaml ]; then
        print_error "render.yaml not found"
        exit 1
    fi
    
    print_warning "Please connect your GitHub repository to Render.com"
    print_warning "1. Go to https://render.com"
    print_warning "2. Connect your GitHub repository"
    print_warning "3. Select 'render.yaml' for configuration"
    
    print_status "Render configuration ready"
}

# Deploy to Fly.io
deploy_fly() {
    echo "Deploying to Fly.io..."
    
    if ! command -v flyctl &> /dev/null; then
        print_warning "Fly CLI not found. Installing..."
        curl -L https://fly.io/install.sh | sh
    fi
    
    flyctl auth login
    flyctl launch --config fly.toml --copy-config --yes
    flyctl deploy
    print_status "Fly.io deployment complete"
}

# Deploy to AWS EC2
deploy_aws() {
    echo "Deploying to AWS EC2..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not found. Please install AWS CLI."
        exit 1
    fi
    
    # Create EC2 instance
    INSTANCE_ID=$(aws ec2 run-instances \
        --image-id ami-0c02fb55731490381 \
        --instance-type t2.medium \
        --key-name monsta-key \
        --security-groups monsta-sg \
        --user-data file://user-data.sh \
        --query 'Instances[0].InstanceId' \
        --output text)
    
    echo "Instance created: $INSTANCE_ID"
    
    # Wait for instance to be running
    aws ec2 wait instance-running --instance-ids $INSTANCE_ID
    
    # Get public IP
    PUBLIC_IP=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text)
    
    print_status "AWS deployment complete"
    echo "Access the application at: http://$PUBLIC_IP:8501"
}

# Deploy to Google Cloud Run
deploy_gcp() {
    echo "Deploying to Google Cloud Run..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud SDK not found. Please install gcloud."
        exit 1
    fi
    
    # Build and push to Google Container Registry
    PROJECT_ID=$(gcloud config get-value project)
    gcloud builds submit --tag gcr.io/$PROJECT_ID/monsta-app
    
    # Deploy to Cloud Run
    gcloud run deploy monsta-app \
        --image gcr.io/$PROJECT_ID/monsta-app \
        --platform managed \
        --region asia-northeast1 \
        --allow-unauthenticated \
        --port 8501
    
    print_status "Google Cloud Run deployment complete"
}

# Deploy to Azure Container Instances
deploy_azure() {
    echo "Deploying to Azure Container Instances..."
    
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI not found. Please install Azure CLI."
        exit 1
    fi
    
    # Create resource group
    az group create --name monsta-rg --location japaneast
    
    # Create container registry
    az acr create --resource-group monsta-rg --name monstaregistry --sku Basic
    
    # Build and push image
    az acr build --registry monstaregistry --image monsta-app .
    
    # Deploy container
    az container create \
        --resource-group monsta-rg \
        --name monsta-app \
        --image monstaregistry.azurecr.io/monsta-app:latest \
        --dns-name-label monsta-trading \
        --ports 8501
    
    print_status "Azure deployment complete"
}

# Main menu
show_menu() {
    echo ""
    echo "Select deployment target:"
    echo "1) Local Docker"
    echo "2) Railway"
    echo "3) Render"
    echo "4) Fly.io"
    echo "5) AWS EC2"
    echo "6) Google Cloud Run"
    echo "7) Azure Container Instances"
    echo "8) Exit"
    echo ""
}

# Main execution
main() {
    check_dependencies
    build_image
    
    while true; do
        show_menu
        read -p "Enter choice [1-8]: " choice
        
        case $choice in
            1) deploy_local ;;
            2) deploy_railway ;;
            3) deploy_render ;;
            4) deploy_fly ;;
            5) deploy_aws ;;
            6) deploy_gcp ;;
            7) deploy_azure ;;
            8) 
                print_status "Deployment script finished"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Deploy to another platform? (y/n): " continue_deploy
        if [ "$continue_deploy" != "y" ]; then
            break
        fi
    done
    
    print_status "All deployments complete!"
}

# Run main function
main