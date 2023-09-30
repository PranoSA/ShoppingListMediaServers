/* Please follow mediasoup installation requirements */
/* https://mediasoup.org/documentation/v3/mediasoup/installation/ */
import express, {Request, Response, NextFunction} from 'express'
const app = express()

import mediaCodecs from './globals/media_codecs';


import https from 'httpolyglot'
import fs from 'fs'
import path from 'path'

import { Server, Socket } from 'socket.io'
import mediasoup from 'mediasoup'
//import { types as mediasoupTypes } from "mediasoup";


import {  RtpParameters, AppData, DtlsParameters, IceParameters,MediaKind, IceCandidate, Producer, Consumer, Worker, Router } from 'mediasoup/node/lib/types'

import { joinRoom, ProducerResponse, createWebRtcCallbackArguments, TransportProduceCallbackParams, createWebRtcClient, transportconnect, ClientToServerEvents} from './types/client_to_server_events';

import {ServerToClientEvents, ConnectionSuccess} from './types/server_to_client_events';

import { HighLevelClient, HighLevelClients, LowerLevelClient, Room, Clients, Rooms, Sockets, CandidateTransport, CandidateTransports } from './types/application_types';


import newUser from './globals/new_user';



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

let worker: Worker;




let clients:HighLevelClients = {}
let rooms:Rooms = {}          // { roomName1: { Router, rooms: [ sicketId1, ... ] }, ...}



let sockets :Sockets = {} //Do Not Think I Need This 

let produce_transports:CandidateTransports= {};   // [ { socketId1, roomName1, transport, consumer }, ... ]
let consume_transports:CandidateTransports = {};

//let consumer_transports:CandidateConsumerTransports= {};


const ListenIP = process.env.IP || "127.0.0.1";


setTimeout(() => {

},10000)

const createRoom = async (room_name:string, initiator:string):Promise<mediasoup.types.Router> => {
  if(rooms[room_name]){

    console.log(`Joining Rooms ${room_name} by ${initiator}`);
    rooms[room_name].clients[initiator] = {
      producers : [],
      consumers : [],
      userid : clients[initiator].Room_name,
      username : clients[initiator].Email,
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
    userid : clients[initiator].Room_name,
    username : clients[initiator].Email,
    socket : sockets[initiator]
  }
  

  rooms[room_name] = newRoom;

  return router 

}



const LeaveRoom = (socket:Socket) => {

  const roomname = clients[socket.id].Room_name
  if (roomname != ""){
    rooms[roomname].clients[socket.id].producers.forEach(v => {
      socket.emit("producerleaves", {producerId:v.id})
      v.close()
    });
    rooms[roomname].clients[socket.id].consumers.forEach(v => v.close());
  }
  clients[socket.id].Room_name = ""

}


export {
  HighLevelClient
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

    const token = socket.handshake.auth.token;


    let user :HighLevelClient

    try {
      user = await newUser(token)
      sockets[socket.id] = socket;  //Why Do I Need This
      clients[socket.id] = user
    }

    catch(err){
      //Unauthenticated 
      //socket._cleanup();
      socket.conn.close();
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

     LeaveRoom(socket) //Closes Existing Producers and Consumers -> How DO I Remove Transports ?? 
     

      //consumer_transports[socket.id].forEach(v => v.transport.close())
      //delete consumer_transports[socket.id]


     clients[socket.id].Consumer_Transport_Ids.forEach(v => {
      consume_transports[v].transport.close()
     })

     clients[socket.id].Producer_Transport_Ids.forEach(v => {
      produce_transports[v].transport.close()
     })

     delete clients[socket.id]

      return ; //Please Remove This ...
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


        
        /*if(!consumer_transports[socket.id]){
          consumer_transports[socket.id] = [];
        }
        // -> Add Candidate Transport For now --> Why Do We Need Transport Room 
        consumer_transports[socket.id].push({
          transport,
          owner : clients[socket.id].UUID,
          socket_id : socket.id,
          username : clients[socket.id].Username,
          email: clients[socket.id].Email,
        })
        */

        consume_transports[transport.id] = {
          transport,
          owner : clients[socket.id].UUID,
          socket_id : socket.id,
          username : clients[socket.id].Username,
          email: clients[socket.id].Email,
        }

        clients[socket.id].Consumer_Transport_Ids.push(transport.id)

        }
        else{

           if(produce_transports[socket.id]){
            produce_transports[socket.id].transport.close();
           }
            // -> Add Candidate Transport For now --> Why Do We Need Transport Room 
            produce_transports[socket.id] = {
              transport,
              owner : clients[socket.id].Username,
              socket_id : socket.id,
              email : clients[socket.id].Email,
              username: clients[socket.id].Username,
            }
            //addTransport(transport, roomName, consumer)
          }
        },
      error => {
        console.log(error)
      })
  })


  
  socket.on('getProducers', (callback: (arg0: ProducerResponse[]) => void) => {
    //return all producer produce_transports
    const roomName  = clients[socket.id].Room_name

    let clientList = rooms[roomName].clients

    
    let RoomProducers : ProducerResponse[] = []

    for (var key in clientList){
      const nextClient = clientList[key];
      
      
      nextClient.producers.forEach((v) => RoomProducers.push({
        producerId : v.id,
        email: nextClient.username,
        username: nextClient.username,
        userid: nextClient.userid,
      }))
    }

    callback(RoomProducers)

    return 

    /*let ProducerList : mediasoup.types.Producer[] = [];

    for (var key in clientList){
      const nextClient = clientList[key];
      ProducerList = [...ProducerList, ... nextClient.producers];
    }

    const listtoreturn = ProducerList.map(p=>p.id);

    //Return Something Else Instead
  

    callback(ProducerList.map(p => p.id));
    */

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
    var user = clients[socket.id]

    socket.to(Array.from(socket.rooms)).emit("newproducer", {producerId: producer.id, userid:user.UUID, email:user.Email,username:user.Username});

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
      
      /*const consumerTransports:mediasoup.types.Transport[] = consumer_transports[socket.id].map((k,i) => k.transport);

      const transport : mediasoup.types.Transport | undefined = consumerTransports.find(value => {
        return value.id === serverConsumerTransportId
      })

      if (transport == undefined){
        console.log("Failed To COnnect to ")
        return 
      }

      console.log("transportconnect")
      
      await transport.connect({dtlsParameters});
      
      if(!consumer_transports[serverConsumerTransportId]){
        //Fails
        return 
      }
      */

      await consume_transports[serverConsumerTransportId].transport.connect({dtlsParameters})

    })



    socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) => {
      try {
        
        console.log(`${socket.id} Trying to Consume to ${remoteProducerId} as ${serverConsumerTransportId}`)

        const roomName :string = clients[socket.id].Room_name

        const router : mediasoup.types.Router = rooms[roomName].router

        /*const consumerTransports:mediasoup.types.Transport[] = consumer_transports[socket.id].map((k,i) => k.transport);
        

        const transport : mediasoup.types.Transport | undefined = consumerTransports.find(value => {
          
          return value.id === serverConsumerTransportId
        })
        */

        const transport = consume_transports[serverConsumerTransportId].transport


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
            socket.emit('producerclosed', { producerId: remoteProducerId })
  
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