#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  CryptoViz Scrapper Setup${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠ Le fichier .env existe déjà.${NC}"
    read -p "Voulez-vous le reconfigurer ? (y/N): " reconfigure
    if [[ ! "$reconfigure" =~ ^[Yy]$ ]]; then
        echo "Configuration annulée."
        exit 0
    fi
fi

# Copy .env.example to .env if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Fichier .env créé depuis .env.example${NC}"
    else
        echo -e "${YELLOW}⚠ .env.example introuvable${NC}"
        exit 1
    fi
fi

# Prompt for crypto pair
echo ""
echo "Entrez la paire de cryptomonnaie à surveiller:"
echo -e "${BLUE}Exemples: BTC/USD, ETH/USDT, BTC/EUR${NC}"
echo ""

read -p "Crypto de base (ex: BTC, ETH): " BASE
read -p "Crypto de cotation (ex: USD, USDT, EUR): " QUOTE

# Validate input
if [ -z "$BASE" ] || [ -z "$QUOTE" ]; then
    echo -e "${YELLOW}⚠ BASE et QUOTE sont requis${NC}"
    exit 1
fi

# Convert to uppercase
BASE=$(echo "$BASE" | tr '[:lower:]' '[:upper:]')
QUOTE=$(echo "$QUOTE" | tr '[:lower:]' '[:upper:]')

echo ""
echo -e "${BLUE}Configuration de la paire: ${GREEN}${BASE}/${QUOTE}${NC}"
echo ""

# Update KAFKA_TOPIC in .env
TOPIC="raw-trades-$(echo $BASE | tr '[:upper:]' '[:lower:]')-$(echo $QUOTE | tr '[:upper:]' '[:lower:]')"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/^KAFKA_TOPIC=.*/KAFKA_TOPIC=$TOPIC/" .env
else
    # Linux
    sed -i "s/^KAFKA_TOPIC=.*/KAFKA_TOPIC=$TOPIC/" .env
fi
echo -e "${GREEN}✓ KAFKA_TOPIC mis à jour: $TOPIC${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠ Node.js n'est pas installé${NC}"
    echo "Pour générer les subscriptions, installez Node.js ou utilisez Docker."
    exit 1
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances..."
    npm install
fi

# Generate subscriptions
echo "Génération des subscriptions..."
npm run build 2>/dev/null || npx tsc
node dist/scripts/generate-subs.js "$BASE" "$QUOTE"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Configuration terminée !${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Paire configurée: ${BASE}/${QUOTE}"
echo "Topic Kafka: $TOPIC"
echo ""
echo "Pour démarrer le scrapper:"
echo -e "  ${BLUE}just up${NC}   (recommandé, si Just est installé)"
echo "  ou"
echo -e "  ${BLUE}docker-compose -f docker/compose.yml --profile development up -d${NC}"
echo ""
