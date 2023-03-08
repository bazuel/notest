import {Kafka, Producer, Admin} from "kafkajs"
import {Injectable} from "@nestjs/common";

@Injectable()
export class KafkaService {
    kafkaClient: Kafka;
    kafkaProducer: Producer;
    kafkaAdmin: Admin;

    constructor(private broker: {endpoint:string , port:number}) {
        this.kafkaClient = new Kafka({
            clientId: 'notest-client',
            brokers: [`${broker.endpoint}:${broker.port}`],
            connectionTimeout: 3000
        })
        this.kafkaProducer = this.kafkaClient.producer();
        this.kafkaAdmin = this.kafkaClient.admin();
    }

    async produce(topic: string, value:string){
        await this.connect();
        await this.kafkaProducer.send({topic, messages: [{value}]});
        await this.disconnect();
    }
    private async connect(){
        await this.kafkaProducer.connect();
    }
    private async disconnect(){
        await this.kafkaProducer.disconnect();
    }
}