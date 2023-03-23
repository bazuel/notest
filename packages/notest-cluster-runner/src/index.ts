require('dotenv').config();
import { ClusterConsumer } from './service/cluster-consumer';

const clusterRunner = new ClusterConsumer();
async function start() {
  await clusterRunner.startConsumer();
}
start();
