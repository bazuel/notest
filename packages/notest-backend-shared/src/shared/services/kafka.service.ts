import { Consumer, ConsumerSubscribeTopics, EachMessagePayload, Kafka, Producer } from 'kafkajs';
import { globalConfig } from './config.service';

export class KafkaService {
  constructor(private broker: { endpoint: string; port: number; groupId: string }) {}

  createProducer(id: string) {
    return this.createClient(id).producer();
  }

  createConsumer(id: string) {
    return this.createClient(id).consumer({
      groupId: this.broker.groupId,
      sessionTimeout: 80000,
      heartbeatInterval: 21333
    });
  }

  async produce(producer: Producer, topic: string, value: string) {
    await producer.connect();
    await producer.send({ topic, messages: [{ value }] });
    await producer.disconnect();
  }

  async startListening(
    consumer: Consumer,
    topic: ConsumerSubscribeTopics,
    callback: (m: EachMessagePayload) => any
  ) {
    try {
      await consumer.connect();
      await consumer.subscribe(topic);
      await consumer.run({ eachMessage: callback });
    } catch (e) {
      console.log('Error on starting consumer: ', e);
      await consumer.stop();
      await consumer.disconnect();
      await this.startListening(consumer, topic, callback);
    }
  }

  private createClient(clientId: string) {
    return new Kafka({
      clientId,
      brokers: [`${this.broker.endpoint}:${this.broker.port}`],
      connectionTimeout: 3000
    });
  }
}

export const kafkaService = new KafkaService(globalConfig.broker);
