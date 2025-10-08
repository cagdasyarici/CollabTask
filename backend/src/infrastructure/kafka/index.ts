// Kafka producer/consumer konfigürasyonu
export interface KafkaConfig {
    brokers: string[];
    clientId: string;
}

export interface MessageProducer {
    send(topic: string, message: any): Promise<void>;
}

export interface MessageConsumer {
    subscribe(topic: string, handler: (message: any) => Promise<void>): Promise<void>;
}

// Placeholder - İleride gerçek Kafka implementasyonu eklenecek
export class KafkaManager implements MessageProducer, MessageConsumer {
    async send(topic: string, message: any): Promise<void> {
        console.log(`Kafka SEND: ${topic} - ${JSON.stringify(message)}`);
    }

    async subscribe(topic: string, handler: (message: any) => Promise<void>): Promise<void> {
        console.log(`Kafka SUBSCRIBE: ${topic}`);
    }
} 