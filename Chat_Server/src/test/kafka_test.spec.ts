//import { KafkaContainer } from "@testcontainers/kafka";
import { Kafka, KafkaConfig, ProducerConfig, ProducerRecord, Message, ConsumerSubscribeTopics, ConsumerSubscribeTopic, ConsumerRunConfig } from "kafkajs";
import { consumers } from "stream";



it("should connect using in-built zoo-keeper", async () => {
    //const kafkaContainer = await new KafkaContainer().withExposedPorts(9092, 9093).start();
  
    //await testPubSub(kafkaContainer);

    //console.log(kafkaContainer.getHost())
    //console.log(kafkaContainer.getFirstMappedPort())

    const config : KafkaConfig = {

       // brokers : [kafkaContainer.getHost() + ":"+kafkaContainer.getFirstMappedPort()]
       brokers: ["localhost:9092"],
    }

    const client = new Kafka(config)

    const producer_config : ProducerConfig = {

    }

    const producer = client.producer(producer_config)

    await  producer.connect()

    const new_message : Message = {
        value : "SDOISODIOSIDMOISMDIO",
    }

    const testRecord : ProducerRecord = {
        topic : "groups",
        messages : [ new_message]
    }

   await producer.send(testRecord);

   const consumer = client.consumer({
    groupId : "4oisdoi"
   });

   await consumer.connect()

   const subscription : ConsumerSubscribeTopics = {
        topics : ["groups"],
        fromBeginning : true
   }

   await consumer.subscribe(subscription);

   const consumerRunConfig : ConsumerRunConfig = {

   }

   await consumer.run({
    autoCommit : false,
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value?.toString(),
        topic : topic,
      })
      console.log(message.offset);
      await consumer.commitOffsets([{ topic, partition, offset: (Number(message.offset) + 1).toString() }]);
    },
    
  })

  /*setTimeout(async() => {
    //await kafkaContainer.stop();
    return;
  }, (1000));
  */
  
    //await kafkaContainer.stop();
  });