import { Consumer, EachMessagePayload } from 'kafkajs';
import { Kafka, KafkaConfig } from 'kafkajs';



const kafkaConfig: KafkaConfig = { brokers: ['localhost:9092'] }
const kafka = new Kafka(kafkaConfig)



const consumer = kafka.consumer({ groupId: 'shopping-chat-app' })

async function InitGroupsKafka()
{

    await consumer.connect()
    await consumer.subscribe({ topic: 'groups', fromBeginning: true })

    console.log("Starting Listening")
    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) =>
        {
            console.log({
                value: message.value?.toString(),
            })
        },
    })
}

export
{
    InitGroupsKafka
}

