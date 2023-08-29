import { Injectable } from '@nestjs/common';
import { NTClusterMessage } from '@notest/common';
import { ConfigService, KafkaService } from '@notest/backend-shared';
import { Producer } from 'kafkajs';

@Injectable()
export class ProducerService {
  producer: Producer;

  constructor(private kafkaService: KafkaService, private configService: ConfigService) {
    this.producer = this.kafkaService.createProducer('notest-producer-client');
  }

  async produceMessage(message: NTClusterMessage) {
    await this.kafkaService.produce(
      this.producer,
      this.configService.broker.topic,
      JSON.stringify(message)
    );
  }
}
