import { Injectable } from '@nestjs/common';
import { KafkaService } from '../../shared/services/kafka.service';
import { globalConfig } from '../../shared/services/config.service';
import { NTClusterMessage } from '@notest/common';

@Injectable()
export class ProducerService {
  topic = globalConfig.broker.topic;

  constructor(private kafkaService: KafkaService) {}

  async produceMessage(message: NTClusterMessage) {
    await this.kafkaService.produce(this.topic, JSON.stringify(message));
  }
}
