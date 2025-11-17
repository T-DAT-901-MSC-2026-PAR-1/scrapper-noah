import { Kafka, Producer, logLevel } from 'kafkajs';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'raw-trades-eth-usdt';

export class KafkaProducerManager {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'scrapper-raw-trades-eth-usdt',
      brokers: KAFKA_BROKERS,
      logLevel: logLevel.ERROR,
      retry: {
        retries: 5,
        initialRetryTime: 300,
        maxRetryTime: 30000,
      },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log(`[${new Date().toISOString()}] Kafka producer connected to ${KAFKA_BROKERS.join(', ')}`);
      console.log(`[${new Date().toISOString()}] Publishing to topic: ${KAFKA_TOPIC}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Failed to connect to Kafka:`, error);
      throw error;
    }
  }

  async sendMessage(data: Buffer): Promise<void> {
    if (!this.isConnected) {
      console.warn(`[${new Date().toISOString()}] Kafka not connected, skipping message`);
      return;
    }

    try {
      await this.producer.send({
        topic: KAFKA_TOPIC,
        messages: [
          {
            value: data,
            timestamp: Date.now().toString(),
          },
        ],
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Failed to send message to Kafka:`, error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.producer.disconnect();
        this.isConnected = false;
        console.log(`[${new Date().toISOString()}] Kafka producer disconnected`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error disconnecting Kafka:`, error);
      }
    }
  }
}
