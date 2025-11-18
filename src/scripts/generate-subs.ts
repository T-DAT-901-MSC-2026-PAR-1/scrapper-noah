import fs from 'fs';
import { readFileSync, writeFileSync } from 'fs';

const args = process.argv.slice(2);
const [base, quote] = args;

if (!base || !quote) {
    console.error('Usage: node generate-subscriptions.js <BASE> <QUOTE>');
    console.error('Example: node generate-subscriptions.js ETH USDT');
    process.exit(1);
}

const exchanges = [
    "ABCC", "alphaex", "ascendex", "ataix", "bequant", "Bgogo", "Bibox", "BigONE",
    "bilaxy", "Binance", "binanceusa", "bingx", "bit", "bit2me", "bitbns", "bitci",
    "BitexBook", "Bitfinex", "Bitforex", "bitget", "bithumbglobal", "bitinka",
    "BitMart", "Bitmex", "bitopro", "bitpanda", "bitrue", "Bitso", "Bitstamp",
    "BitTrex", "bitunix", "bkex", "Bleutrade", "blockchaincom", "BTCAlpha", "btcex",
    "BTCMarkets", "BTCTurk", "btse", "bullish", "bwexchange", "bybit", "bydfi",
    "Cexio", "Coinbase", "CoinEx", "CoinFalcon", "coinfield", "CoinJar", "Coinsbit",
    "coinspro", "CoinTiger", "coinw", "coss", "crex24", "cryptodotcom", "cryptology",
    "Cryptopia", "currency", "deribit", "DigiFinex", "Exmo", "fastex", "FCoin",
    "flipster", "Foxbit", "ftx", "ftxus", "garantex", "Gateio", "Gemini", "Graviex",
    "hashkey", "HitBTC", "HuobiPro", "indodax", "indoex", "Kraken", "Kucoin", "Kuna",
    "LAToken", "LBank", "Liqnet", "Liquid", "Luno", "Lykke", "MercadoBitcoin",
    "mercatox", "mexc", "nominex", "OKCoin", "OKEX", "onetrading", "P2PB2B",
    "paramountdax", "paribu", "phemex", "Poloniex", "probit", "sigenpro", "timex",
    "Tokenomy", "toobit", "tradeogre", "Unocoin", "Upbit", "valr", "vitex", "wazirx",
    "whitebit", "woo", "xcoex", "xtpub", "yellow", "Yobit", "zbdotcom", "ZBG",
    "zebitex", "zonda"
];

const subscriptions = exchanges.map(exchange => `0~${exchange}~${base}~${quote}`);
const encoded = Buffer.from(JSON.stringify(subscriptions)).toString('base64');

const envPath = '.env';
let envContent = '';

if (fs.existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
}

const envKeySub = 'ENCODED_SUBSCRIPTIONS';
const regexSub = new RegExp(`^${envKeySub}=.*$`, 'm');

if (regexSub.test(envContent)) {
    envContent = envContent.replace(regexSub, `${envKeySub}=${encoded}`);
} else {
    envContent += `\n${envKeySub}=${encoded}\n`;
}

writeFileSync(envPath, envContent.trim() + '\n');

const envKeyBaseCrypto = 'BASE_CRYPTO';
const regexBaseCrypto = new RegExp(`^${envKeyBaseCrypto}=.*$`, 'm');

if (regexBaseCrypto.test(envContent)) {
    envContent = envContent.replace(regexBaseCrypto, `${envKeyBaseCrypto}=${base.toLowerCase()}`);
} else {
    envContent += `\n${envKeyBaseCrypto}=${base.toLowerCase()}\n`;
}

writeFileSync(envPath, envContent.trim() + '\n');

const envKeyKafkaTopic = 'KAFKA_TOPIC';
const kafkaTopicValue = `raw-trades-${base.toLowerCase()}-${quote.toLowerCase()}`;
const regexKafkaTopic = new RegExp(`^${envKeyKafkaTopic}=.*$`, 'm');

if (regexKafkaTopic.test(envContent)) {
    envContent = envContent.replace(regexKafkaTopic, `${envKeyKafkaTopic}=${kafkaTopicValue}`);
} else {
    envContent += `\n${envKeyKafkaTopic}=${kafkaTopicValue}\n`;
}

writeFileSync(envPath, envContent.trim() + '\n');

console.log(`✓ Subscriptions générées pour ${base}/${quote}`);
console.log(`✓ ${subscriptions.length} exchanges encodés en base64`);
console.log(`✓ Variable ${envKeySub} mise à jour dans .env`);
console.log(`✓ Variable ${envKeyBaseCrypto} mise à jour dans .env`);
console.log(`✓ Variable ${envKeyKafkaTopic} mise à jour dans .env avec la valeur: ${kafkaTopicValue}`);