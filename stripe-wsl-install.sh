#!/bin/bash

# Stripe CLI Installation Script for WSL/Linux

echo "🚀 Installing Stripe CLI for WSL/Linux..."

# Add Stripe's GPG key
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg

# Add Stripe repository
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list

# Update package list
sudo apt update

# Install Stripe CLI
sudo apt install stripe

echo "✅ Stripe CLI installation complete!"
echo ""
echo "Next steps:"
echo "1. Run: stripe login"
echo "2. Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
echo "3. Copy the webhook secret and add to .env.local"