# Crypto WebSocket Scrapper

Scrapper de données en temps réel pour une paire crypto/devise via WebSocket CryptoCompare avec intégration Kafka.

## But

Collecter et streamer les données de trading d'une paire de cryptomonnaie (ex: BTC/USD, ETH/USDT) depuis 126+ exchanges vers Kafka pour traitement en temps réel.

## Prérequis

- Docker et Docker Compose
- Just (command runner) - Installation: `brew install just` (macOS) ou voir [justfile.guide](https://github.com/casey/just)
- Cluster Kafka en cours d'exécution (voir répertoire `infrastructure/` du projet parent)

## Installation et Setup

### Déploiement rapide (recommandé)

```bash
# Configuration interactive + démarrage en une commande
just deploy
```

Vous serez invité à entrer :
- **Crypto de base** (ex: BTC, ETH, SOL)
- **Devise de cotation** (ex: USD, USDT, EUR)

Le script configure automatiquement tout le nécessaire et démarre le scrapper.

### Ou en deux étapes

```bash
# 1. Configuration interactive
just setup

# 2. Démarrage
just up
```

### Commandes disponibles

```bash
just              # Liste toutes les commandes
just setup        # Configuration interactive de la paire crypto
just deploy       # Setup + démarrage
just up           # Démarrer le scrapper
just down         # Arrêter le scrapper
just logs         # Voir les logs
just shell        # Accéder au shell du container
```

## Changer de paire crypto

```bash
# Reconfigurer avec une nouvelle paire
just setup
```

Le scrapper redémarrera automatiquement avec la nouvelle configuration.
