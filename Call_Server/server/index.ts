/* Please follow mediasoup installation requirements */
/* https://mediasoup.org/documentation/v3/mediasoup/installation/ */
import express, {Request, Response, NextFunction} from 'express'
const app = express()

import { createClient } from 'redis';

const client = await createClient({
  url: "localhost:6379",
  password : process.env.REDIS_PASSWORD,
  username : process.env.REDIS_USERNAME,
})
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

import https from 'httpolyglot'
import fs from 'fs'
import path from 'path'
const __dirname = path.resolve()

import { Server, Socket } from 'socket.io'
import mediasoup from 'mediasoup'
import { types as mediasoupTypes } from "mediasoup";

import { RtpParameters, } from 'mediasoup/node/lib/RtpParameters'
import { AppData, DtlsParameters } from 'mediasoup/node/lib/types'
import { IceParameters } from 'mediasoup/node/lib/types';
import { IceCandidate } from 'mediasoup/node/lib/types';
import { MediaKind } from 'mediasoup/node/lib/RtpParameters';



type ConnectionSuccess = {
    socketId : string
}

type joinRoom = {
    roomName : string 
}

type transportconnect = {
  dtlsParameters: DtlsParameters
}



type createWebRtcClient = {
  consumer: boolean 
}

type createWebRtcCallbackArgument = {
  params:any 
}

type createWebRtcCallbackArguments = {
  params : {
      id: string
      iceParameters: IceParameters
      iceCandidates: IceCandidate[]
      dtlsParameters: DtlsParameters 
  }
}


export type WebRTCUser = {
id: string;
stream: MediaStream;
};

interface ServerToClientEvents {
  /*
      1. Connected To the Server Successfully 

      2. New Producer -> Start Signaling For New Conusmer Tranport TO Build One

      3. Producer Closed -> Get the Consumer Transport To CLose 
  */
  connectionsuccess: (a:ConnectionSuccess) => void; 
  newproducer:(a:{producerId:string})=>void; 
  producerclosed:any 
}



interface ClientToServerEvents {

  /*
      1. Join Room -> 

      2. Create WebRTC Transport (Do This once for Producer When Load Page), 
      and one for every "newproducer" event

      3. Transport Produce ->
      After Calling createWebRTCTransport on page load if you are a producer, 
      Then Generating a WebRTC Producer Transport on The Client,
      Call transport produce to send over parameters for RTP

      Then a producer ID will be generated on the server that identifies the Producer ID transport in the room,
      Servers Will Then Use this to connect to 

      4. Transport Recv Connect -> 
      
      For each producer, a consumer transport is created, which is identified by the consumer ID and a corresponding producer ID


      This is called for all of the producers upon load and new signalled producers
      


      5. Consume ->

      Create Consumer Based on RTP Capabilities and producer and consumer id 
      for mapping


      6. consumerresume -> 




      7. Get Producers -> 

      Upon Joining A Room, Get all the Producers Currently In The Room 

  */
  joinRoom: (a:joinRoom, callback:(e:any) => void) => void;
  createWebRtcTransport:(a:createWebRtcClient, callback:(e:createWebRtcCallbackArguments) => void)=>void;
  transportconnect:(a:transportconnect) => void; 
  transportproduce:(a:TransportProduceParams, callback:(e:any) => void) => void;
  transportrecvconnect:(a:any) => void;
  consume:(a:any, callback:(e:any)=>void ) => void;
  consumerresume:(a:any)=>void;
  getProducers:any
}   




app.get('*', (req:Request, res:Response, next) => {
    const path = '/sfu/'
  
    if (req.path.indexOf(path) == 0 && req.path.length > path.length) return next()
  
    res.send(`You need to specify a room name in the path e.g. 'https://127.0.0.1/sfu/room'`)
  })
  

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

let worker: mediasoupTypes.Worker;
let rtpParameters: mediasoupTypes.RtpParameters;



//Access By Room Name (Will Be UUID In This Case)....
/*type Room = {
    router : mediasoupTypes.Router
    client_socket_ids : string[],
}*/

/**
 * 
    Room -> Clients -> produce_transports
    Client -> Room ->Clients -> produce_transports (Can This Graph Work)

 */

//Should I Map By Transport Id
//This Is Used to Append To 

//Why Do I Need Seperate For Producers and Consumers ??



//Mapped By Client ID
type HighLevelClient = {
  Room_name : string //Can Be Used To Map To Room
  UUID : string 
}

//Index By Room Name -> UUID Of Group Probably
type Room = {
  router : mediasoupTypes.Router,
  clients : Clients,
}

interface Clients {
 [key:string]:LowerLevelClient,
}


//Again Mapped By Client ID
type LowerLevelClient = {
  producers : mediasoupTypes.Producer[];
  consumers : mediasoupTypes.Consumer[];
  socket : Socket,
}

type Rooms = {
  [key:string]:Room
}

type HighLevelClients = {
  [key:string]:HighLevelClient
}

type CandidateTransport = {
  transport:mediasoup.types.WebRtcTransport
  owner : string 
  socket_id:string
}

type CandidateProducerTransports = {
  [key:string]:CandidateTransport 
}

type CandidateConsumerTransports = {
  [key:string]:CandidateTransport[]
}

let clients:HighLevelClients = {}
let rooms:Rooms = {}          // { roomName1: { Router, rooms: [ sicketId1, ... ] }, ...}

interface Sockets {
  [key:string]:Socket
}

interface Producers {
  [key:string]:mediasoup.types.Producer
}

interface CandidateConsumers {
  [key:string]:mediasoup.types.Consumer
}


let sockets :Sockets = {} //Do Not Think I Need This 

let candidate_transports:CandidateProducerTransports= {};

let peers = {}          // { socketId1: { roomName1, socket, produce_transports = [id1, id2,] }, producers = [id1, id2,] }, consumers = [id1, id2,], peerDetails }, ...}
let produce_transports:CandidateProducerTransports= {};   // [ { socketId1, roomName1, transport, consumer }, ... ]
let producers:Producers = {}      // [ { socketId1, roomName1, producer, }, ... ]
let consumers = []      // [ { socketId1, roomName1, consumer, }, ... ]

let consumer_transports:CandidateConsumerTransports= {};


const ListenIP = process.env.IP || "127.0.0.1";

type TransportProduceParams = {
  kind: MediaKind,
  rtpParameters: RtpParameters,
  appData: AppData,
}




/*const mediaCodecs:mediasoupTypes.RtpCodecCapability[] =
[
  {
    kind        : "audio",
    mimeType    : "audio/opus",
    clockRate   : 48000,
    channels    : 2
  },
  {
    kind       : "video",
    mimeType   : "video/H264",
    clockRate  : 90000,
    parameters :
    {
      "packetization-mode"      : 1,
      "profile-level-id"        : "42e01f",
      "level-asymmetry-allowed" : 1
    }
  }
]*/

const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
]

setTimeout(() => {

},10000)

const createRoom = async (room_name:string, initiator:string):Promise<mediasoup.types.Router> => {
  if(rooms[room_name]){

    console.log(`Joining Rooms ${room_name} by ${initiator}`);
    rooms[room_name].clients[initiator] = {
      producers : [],
      consumers : [],
      socket : sockets[initiator],
    }

    return rooms[room_name].router

  }

  
  console.log(`Created Routing For Rooms ${room_name} by ${initiator}`);

  //@ts-ignore
  let router : mediasoup.types.Router<mediasoup.types.AppData> = await worker.createRouter({mediaCodecs})

  console.log("Made New Router")

  let newRoom : Room = {
    router : router,
    clients : {}
  }

  newRoom.clients[initiator] = {
    producers: [],
    consumers: [],
    socket : sockets[initiator]
  }
  

  rooms[room_name] = newRoom;

  return router 

}




const createWorker = async () => {
    worker = await mediasoup.createWorker({
      rtcMinPort: 2000,
      rtcMaxPort: 2020,
    })
  
    worker.on('died', error => {
      // This implies something serious happened, so kill the application
      console.error('mediasoup worker has died')
      setTimeout(() => process.exit(1), 2000) // exit in 2 seconds
    })

    //worker = worker 
  
    return worker
  }

  createWorker()
  .then(worker_result => {
    console.log("worker created");
  })
  .catch(err => console.log("Failed To Create Worker"));

  //worker = createWorker()



  connections.on('connection', async socket => {
    console.log(socket.id)
    sockets[socket.id] = socket;
    clients[socket.id] = {
      Room_name : "",
      UUID : "",
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

     client.consumers.forEach((cons : mediasoupTypes.Consumer) => {
        //How Do I  Chose Connetion
        cons.close();
     });

     delete clients.consumer;

     client.producers.forEach((cons:mediasoupTypes.Producer) => {
      cons.close();
     })

     delete clients.producers;
     //This Will Delete The Entry Of the Client From THe Room To THe User
     //Because It goes Rooms Maps to Users -> List of Producers and Consumers
     delete ClientsRoom.clients[socket.id]

     delete clients[socket.id]

     delete sockets[socket.id]

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
            ip: ListenIP, // replace with relevant IP address
            announcedIp: ListenIP,
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