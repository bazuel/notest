import { Injectable } from '@nestjs/common';
import { KafkaService } from '../../shared/services/kafka.service';
import {globalConfig} from "../../shared/services/config.service";

@Injectable()
export class ProducerService {
  topic = globalConfig.broker.topic;

  constructor(private kafkaService: KafkaService) {}

  async produceMessage(message: string) {
    await this.kafkaService.produce(this.topic, message);
  }
}
