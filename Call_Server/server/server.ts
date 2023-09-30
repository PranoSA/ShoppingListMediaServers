import ClientToServerEvents from './types/client_events'
import ServerToClientEvents from './types/server_events'
import fs from 'fs'
import { Server } from 'socket.io'
import express, {Request, Response, NextFunction} from 'express'
import redisClient from './database/redis_client'
import {Router, Worker, Consumer, Producer} from 'mediasoup/node/lib/types';

import {Room} from './types/server_types'
import { createWorker, Rooms as rooms } from './globals/rooms_clients'
import mediasoup from 'mediasoup'


import { ConsumerTransports as consumer_transports, ProducerTransports as produce_transports } from './globals/rooms_clients'

import { Connected_Clients as clients } from './globals/rooms_clients'

import https from 'httpolyglot'
import createRoom from './globals/createRoom'

const app = express()

const options = {
    key: fs.readFileSync('./ssl/key.pem', 'utf-8'),
    cert: fs.readFileSync('./ssl/cert.pem', 'utf-8')
  }

const httpsServer = https.createServer(options, app)
httpsServer.listen(3001, () => {
  console.log('listening on port: ' + 3001)
})


const io:Server< ClientToServerEvents, ServerToClientEvents> = new Server(httpsServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true
    }
  })


  
  const connections = io.of('/sfu')



app.post('/room/:roomid', async (req:Request, res:Response, next:NextFunction) => {

  const roomid = req.params.roomid;

  //Get Belongs to Group

  //Check if Room Allocated And What Clients Have Joined 
  const room = await redisClient.HGET(`room:${roomid}`, "host");

  

  if(room == undefined){
    next(new Error());
  }



  
})

app.get('*', (req:Request, res:Response, next) => {
  const path = '/sfu/'

  if (req.path.indexOf(path) == 0 && req.path.length > path.length) return next()

  res.send(`You need to specify a room name in the path e.g. 'https://127.0.0.1/sfu/room'`)
})




  app.get('*', (req:Request, res:Response, next) => {
    const path = '/sfu/'
  
    if (req.path.indexOf(path) == 0 && req.path.length > path.length) return next()
  
    res.send(`You need to specify a room name in the path e.g. 'https://127.0.0.1/sfu/room'`)


    
})




createWorker()
.then(worker_result => {
  console.log("worker created");
})
.catch(err => console.log("Failed To Create Worker"));



connections.on('connection', async socket => {
  console.log(socket.id)

  clients[socket.id] = {
    socket_id : socket.id,
    Room_name : "",
    user: null,
    uuid : "",
  }

  socket.emit('connectionsuccess', {
    socketId: socket.id,
  })

  socket.on('disconnect', () => {
    // do some cleanup
    console.log('peer disconnected')

    if(clients[socket.id]){
      if(clients[socket.id].Room_name||"" != ""){
        //NO produce_transports To Clean Up
        return 
      }
    }

    return ; //Please Remove This ...

   const ClientsRoom:Room = rooms[clients[socket.id].Room_name]

   console.log(`Room Name : ${clients[socket.id].Room_name}`)

   const client = ClientsRoom.clients[socket.id];

   client.consumers.forEach((cons : Consumer) => {
      //How Do I  Chose Connetion
      cons.close();
   });

   delete clients.consumer;

   client.producers.forEach((cons:Producer) => {
    cons.close();
   })

   delete clients.producers;
   //This Will Delete The Entry Of the Client From THe Room To THe User
   //Because It goes Rooms Maps to Users -> List of Producers and Consumers
   delete ClientsRoom.clients[socket.id]

   delete clients[socket.id]


  })

  
socket.on('joinRoom', async ({ roomName }, callback) => {
  // create Router if it does not exist
  // const router1 = rooms[roomName] && rooms[roomName].get('data').router || await createRoom(roomName, socket.id)

  console.log("Room Joininng " + roomName)
  

  const router1 = await createRoom(roomName, socket.id)

  clients[socket.id].Room_name = roomName;

  socket.join(roomName);



  // get Router RTP Capabilities
  const rtpCapabilities = router1.rtpCapabilities

  // call callback from the client and send back the rtpCapabilities
  callback({ rtpCapabilities })

})


socket.on('createWebRtcTransport', async ({ consumer }, callback) => {
  // get Room Name from Peer's properties

  console.log(`${socket.id} is creating a ${consumer?"consumer":"producer"} transport for room ${clients[socket.id].Room_name}`);
  
  const roomName = clients[socket.id].Room_name

  if(roomName == ""){
    
    //Should Fail At This Point
  }

  //This Will Always Exist After The Fact


  // get Router (Room) object this peer is in based on RoomName
  const router = rooms[roomName].router


  createWebRtcTransport(router).then(
    transport => {
      callback({
        params: {
          id: transport.id, //string 
          iceParameters: transport.iceParameters, //iceParameters
          iceCandidates: transport.iceCandidates,  //IceCandidates[]
          dtlsParameters: transport.dtlsParameters, //dtlsParameters
        }
      })


      // add transport to Peer's properties
      //Where is createWebRTCTransport called?????

      if (consumer == true) {

        console.log(`consumer is ${transport.id}`)



      if(!consumer_transports[socket.id]){
        consumer_transports[socket.id] = [];
      }
      // -> Add Candidate Transport For now --> Why Do We Need Transport Room 
      consumer_transports[socket.id].push({
        transport,
        owner : "",
        socket_id : socket.id,
      })

      }
      else{

         if(produce_transports[socket.id]){
          produce_transports[socket.id].transport.close();
         }
          // -> Add Candidate Transport For now --> Why Do We Need Transport Room 
          produce_transports[socket.id] = {
            transport,
            owner : "",
            socket_id : socket.id,
          }
          //addTransport(transport, roomName, consumer)
        }
      },
    error => {
      console.log(error)
    })
})



socket.on('getProducers', (callback: (arg0: string[]) => void) => {
  //return all producer produce_transports
  const roomName  = clients[socket.id].Room_name

  let clientList = rooms[roomName].clients

  let ProducerList : mediasoup.types.Producer[] = [];

  for (var key in clientList){
    const nextClient = clientList[key];
    ProducerList = [...ProducerList, ... nextClient.producers];
  }

  const listtoreturn = ProducerList.map(p=>p.id);

  callback(ProducerList.map(p => p.id));

})

  // see client's socket.emit('transport-connect', ...)
  socket.on('transportconnect', ({ dtlsParameters }) => {
    console.log('DTLS PARAMS... ', { dtlsParameters })


    produce_transports[socket.id].transport.connect({dtlsParameters});

    
  })

    // see client's socket.emit('transport-produce', ...)
socket.on('transportproduce', async ({ kind, rtpParameters, appData }, callback) => {
  // call produce based on the prameters from the client
  const producer = await produce_transports[socket.id].transport.produce({
    kind,
    rtpParameters,
  })


  console.log("Attempting Transport Produce on Transport " + producer.id);
  // add producer to the producers array
  //const { roomName } = peers[socket.id]
 
  const room:Room = rooms[clients[socket.id].Room_name]


  room.clients[socket.id].producers = [... room.clients[socket.id].producers , producer]

  //notifyRoom(clients[socket.id].Room_name, socket.id, producer.id);

  socket.to(Array.from(socket.rooms)).emit("newproducer", {producerId: producer.id});

  producer.on('transportclose', () => {
    console.log('transport for this producer closed ')
    producer.close()
  })


  var producers_exist : boolean = false
  for (var client in room.clients){
    if(room.clients[client].producers.length >0){
      producers_exist = true
    }
  }
  

  // Send back to the client the Producer's id
  callback({
    id: producer.id,
    producersExist: producers_exist
  })
})


  // see client's socket.emit('transport-recv-connect', ...)
  socket.on('transportrecvconnect', async ({ dtlsParameters, serverConsumerTransportId }) => {

    console.log(`${socket.id} Trying to Connect-Consume to ${serverConsumerTransportId}`)

    console.log(`DTLS PARAMS: ${dtlsParameters}`)
    
    const consumerTransports:mediasoup.types.Transport[] = consumer_transports[socket.id].map((k,i) => k.transport);

    const transport : mediasoup.types.Transport | undefined = consumerTransports.find(value => {
      return value.id === serverConsumerTransportId
    })

    if (transport == undefined){
      console.log("Failed To COnnect to ")
      return 
    }

    console.log("transportconnect")
    
    await transport.connect({dtlsParameters});

  })



  socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) => {
    try {
      
      console.log(`${socket.id} Trying to Consume to ${remoteProducerId} as ${serverConsumerTransportId}`)

      const roomName :string = clients[socket.id].Room_name

      const router : mediasoup.types.Router = rooms[roomName].router

      const consumerTransports:mediasoup.types.Transport[] = consumer_transports[socket.id].map((k,i) => k.transport);
      

      const transport : mediasoup.types.Transport | undefined = consumerTransports.find(value => {
        
        return value.id === serverConsumerTransportId
      })



      if (transport == undefined){
        console.log("Could Not Find Tranpo")
        return 
      }

      console.log(router.canConsume({
        producerId: remoteProducerId,
        rtpCapabilities,
      }))


      if(router.canConsume({
        producerId: remoteProducerId,
        rtpCapabilities,
      })){

        try{
        const consumer = await transport.consume({
          producerId: remoteProducerId,
          rtpCapabilities,
          paused: true,
        })

        consumer.on("rtp",()=>{
          console.log("IDK,RTP")
        })


        consumer.on('transportclose', () => {
          console.log('transport close from consumer')
        })

        consumer.on('producerclose', () => {
          console.log('producer of consumer closed')
          socket.emit('producerclosed', { remoteProducerId })

          transport.close()
          consumer.close()
        })

        rooms[roomName].clients[socket.id].consumers.push(consumer);

      
        // from the consumer extract the following params
        // to send back to the Client
        const params = {
          id: consumer.id,
          producerId: remoteProducerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          serverConsumerId: consumer.id,
        }

        // send the parameters to the client
        callback({ params })
        }catch(e){
          console.log("Failed TO Consume ")
        }
      }
    } catch (error:any) {
      console.log(error.message)
      callback({
        params: {
          error: error
        }
      })
    }
  })

  socket.on('consumerresume', async ({ serverConsumerId }) => {
    console.log('consumer resume')

    //rooms[clients[socket.id].Room_name].router.canConsume()
    
    rooms[clients[socket.id].Room_name].clients[socket.id].consumers.find((v, i) => {
      return v.id === serverConsumerId;
    })?.resume()
    .catch(err => console.log("Some SOrt OF Error"));
  })



})


const addProducer = (producer:mediasoup.types.Producer, roomName:string, clientid:string) => {

const room : Room = rooms[roomName];

room.clients[clientid].producers = [...room.clients[clientid].producers, producer]

}

const addConsumer = (consumer:mediasoup.types.Consumer, roomName:string, clientid:string) => {

const room : Room = rooms[roomName];

room.clients[clientid].consumers = [...room.clients[clientid].consumers, consumer];


}

/**
 * Informs About Producers In The Room 

* @param roomName 
* @param socketId 
* @param producerId 
*/
const notifyRoom = (roomName:string, socketId:string, producerId:string ) => {

console.log(`${producerId} just joined ${roomName} as ${socketId}`)

//You Are Telling All The Clients In THe Room, That There is a New Producer


//Already DOne???
//rooms[roomName].clients[socketId].producers = [...rooms[roomName].clients[socketId].producers, produce]
const room:Room = rooms[roomName];



for (var clientid in room.clients){
  if (clientid == socketId){
    continue;
  }

  const iterClient = room.clients[clientid]
  const iterSocket = iterClient.socket 

  iterSocket.emit("newproducer", {producerId})

}

}





const createWebRtcTransport = async (router:mediasoup.types.Router):Promise<mediasoup.types.WebRtcTransport> => {
  return new Promise(async (resolve, reject) => {
    try {

      const webRtcTransport_options = {
        listenIps: [
          {
            ip: "", // replace with relevant IP address
            announcedIp: "ListenIP",
          }
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      }

      // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
      let transport = await router.createWebRtcTransport(webRtcTransport_options)
      console.log(`Createing Transport ID : transport id: ${transport.id}`)

      transport.on('dtlsstatechange', dtlsState => {
        if (dtlsState === 'closed') {
          transport.close()
        }
      })

      transport.on('@close', () => {
        console.log('transport closed')
      })

      resolve(transport)

    } catch (error) {
      reject(error)
    }
  })
}


