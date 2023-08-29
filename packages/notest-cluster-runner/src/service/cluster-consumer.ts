import { ConsumerSubscribeTopics, EachMessagePayload } from 'kafkajs';
import { ClusterRunnerService } from './cluster-runner.service';
import { globalConfig, KafkaService } from 'notest-backend-shared';

export class ClusterConsumer {
  private topic: ConsumerSubscribeTopics = {
    topics: [this.broker.topic],
    fromBeginning: false
  };

  constructor(private kafkaService: KafkaService, private broker: (typeof globalConfig)['broker']) {
    const consumer = this.kafkaService.createConsumer('notest-consumer-runner-client');
    console.log('cluster consumer started');
    this.kafkaService.startListening(consumer, this.topic, (m) => this.startRunner(m));
  }

  private startRunner(message: EachMessagePayload) {
    console.log('Message received: ', message.topic, message.message.value.toString());
    return new ClusterRunnerService().runMessage(message);
  }
}
