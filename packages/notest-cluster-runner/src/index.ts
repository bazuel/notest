require('dotenv').config();

import { globalConfig, kafkaService } from 'notest-backend-shared';
import { ClusterConsumer } from './service/cluster-consumer';

const interval = setInterval(() => {
  if (globalConfig.broker.topic) {
    clearInterval(interval);
    console.log('Starting cluster consumer...');
    new ClusterConsumer(kafkaService, globalConfig.broker);
  }
}, 10);
