#!/bin/bash
# Run this in your terminal to start the app: ./run-dev.sh
set -e
cd "$(dirname "$0")"

# Load nvm first (it puts node/npm on PATH)
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use default 2>/dev/null || true
fi

# Add common Node locations
export PATH="$HOME/.volta/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

# Find npm (full path if needed)
NPM=""
if command -v npm &>/dev/null; then
  NPM=npm
elif [ -x "/opt/homebrew/bin/npm" ]; then
  NPM=/opt/homebrew/bin/npm
elif [ -x "/usr/local/bin/npm" ]; then
  NPM=/usr/local/bin/npm
else
  # Search for npm in common places
  for dir in /opt/homebrew/bin /usr/local/bin "$HOME/.volta/bin"; do
    [ -x "$dir/npm" ] && NPM="$dir/npm" && break
  done
fi
# If node exists, npm might be next to it (e.g. Homebrew)
if [ -z "$NPM" ] && command -v node &>/dev/null; then
  NODE_DIR=$(dirname "$(command -v node)")
  [ -x "$NODE_DIR/npm" ] && NPM="$NODE_DIR/npm"
fi

if [ -z "$NPM" ]; then
  echo "Node/npm not found."
  echo ""
  echo "Install Node.js first:"
  echo "  • Homebrew:  brew install node"
  echo "  • Or download: https://nodejs.org"
  echo ""
  echo "If Node is already installed, run this and try again:"
  echo "  export PATH=\"/opt/homebrew/bin:/usr/local/bin:\$PATH\""
  echo "  ./run-dev.sh"
  exit 1
fi

echo "Using: $NPM"
exec "$NPM" run dev
