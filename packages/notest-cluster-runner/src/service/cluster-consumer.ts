import { Consumer, ConsumerSubscribeTopics, Kafka } from 'kafkajs';
import { ClusterRunnerService } from './cluster-runner.service';
import { environment } from '../environments/environment';

export class ClusterConsumer {
  private kafkaConsumer: Consumer;

  private topic: ConsumerSubscribeTopics = {
    topics: [environment.topic],
    fromBeginning: false
  };

  constructor() {
    this.kafkaConsumer = this.createConsumer();
  }

  private createConsumer() {
    const kafka = new Kafka({
      clientId: 'consumer-client',
      brokers: ['185.196.20.82:30718']
    });
    return kafka.consumer({
      groupId: environment.groupId,
      sessionTimeout: 80000,
      heartbeatInterval: 21333
    });
  }

  async startConsumer() {
    try {
      await this.kafkaConsumer.connect();
      await this.kafkaConsumer.subscribe(this.topic);
      await this.kafkaConsumer.run({
        eachMessage: (m) => {
          console.log('Message received: ', m.topic, m.message.value.toString());
          return new ClusterRunnerService().runMessage(m);
        }
      });
    } catch (error) {
      console.log('Error on starting consumer: ', error);
      await this.shutdownConsumer();
      await this.startConsumer();
    }
  }

  async shutdownConsumer() {
    await this.kafkaConsumer.stop();
    await this.kafkaConsumer.disconnect();
  }
}
