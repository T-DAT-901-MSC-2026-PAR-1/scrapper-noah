#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "Development Environment Starting"
echo "================================"

# Check if ENCODED_SUBSCRIPTIONS is set and not empty
if [ -z "$ENCODED_SUBSCRIPTIONS" ]; then
    echo ""
    echo -e "${RED}❌ ERREUR: Configuration manquante${NC}"
    echo ""
    echo -e "${YELLOW}La variable ENCODED_SUBSCRIPTIONS n'est pas définie.${NC}"
    echo ""
    echo "Veuillez exécuter le script de configuration :"
    echo -e "  ${GREEN}just setup${NC}  (recommandé)"
    echo "  ou"
    echo -e "  ${GREEN}bash setup.sh${NC}"
    echo ""
    echo "Puis redémarrez le container :"
    echo -e "  ${GREEN}just up${NC}"
    echo ""
    exit 1
fi

# Ensure dependencies are installed (in case of volume mount changes)
echo "Installing dependencies..."
npm ci

echo ""
echo -e "${GREEN}✓ Configuration détectée${NC}"
echo "Starting application with hot-reload (ts-node-dev)..."
echo "Press Ctrl+C to stop"
echo ""

# Run the application with auto-reload using ts-node for development
# Using --respawn for auto-restart on file changes
# Using --transpile-only for faster compilation
exec npx ts-node-dev --respawn --transpile-only src/index.ts
