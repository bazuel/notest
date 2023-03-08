import { Consumer, ConsumerSubscribeTopics, Kafka } from 'kafkajs';
import { ClusterRunnerService } from './cluster-runner.service';
import { environment } from '../environments/environment';

export class ClusterConsumer {
  private kafkaConsumer: Consumer;
  private config: {
    backendType: string;
  };

  private topic: ConsumerSubscribeTopics = {
    topics: [environment.topic],
    fromBeginning: false
  };

  constructor(config: { backendType: string }) {
    this.kafkaConsumer = this.createConsumer();
    this.config = config;
  }

  private createConsumer() {
    const kafka = new Kafka({
      clientId: 'consumer-client',
      brokers: ['185.196.20.82:30718']
    });
    const consumer = kafka.consumer({
      groupId: environment.groupId,
      /*sessionTimeout: 50000,
      heartbeatInterval: 13333,*/
      sessionTimeout: 80000,
      heartbeatInterval: 21333
    });
    return consumer;
  }

  async startConsumer() {
    try {
      await this.kafkaConsumer.connect();
      await this.kafkaConsumer.subscribe(this.topic);
      await this.kafkaConsumer.run({
        eachMessage: (m) => new ClusterRunnerService(this.config).runMessage(m)
      });
    } catch (error) {
      console.log('Error: ', error);
      await this.shutdownConsumer();
      await this.startConsumer();
    }
  }

  async shutdownConsumer() {
    await this.kafkaConsumer.stop();
    await this.kafkaConsumer.disconnect();
  }
}
