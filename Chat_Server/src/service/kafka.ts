import { Consumer, EachMessagePayload } from 'kafkajs';
import { Kafka, KafkaConfig } from 'kafkajs';
import elasticsearch_client from './elasticsearch';


const kafkaConfig: KafkaConfig = { brokers: ['localhost:9092'] }
const kafka = new Kafka(kafkaConfig)



const consumer = kafka.consumer({ groupId: 'shopping-chat-app' })


//For Entering Into Cassandra For Every Message


async function InitGroupsKafka()
{

    await consumer.connect()
    await consumer.subscribe({ topic: 'groups', fromBeginning: true })

    console.log("Starting Listening")
    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) =>
        {

            //Insert Group Here
            console.log({
                value: message.value?.toString(),
            })
        },
    })
}

async function InitUsersKafka()
{

    await consumer.connect()
    await consumer.subscribe({ topic: 'users', fromBeginning: true })

    console.log("Starting Listening")
    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) =>
        {

            //Insert Group Here
            console.log({
                value: message.value?.toString(),
            })
        },
    })
}

type Group = {
    name : string 
    description : string 
    
}

async function InitListsKafka()
{

    await consumer.connect()
    await consumer.subscribe({ topic: 'lists', fromBeginning: true })

    console.log("Starting Listening")
    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) =>
        {

            //Insert Group Here
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
