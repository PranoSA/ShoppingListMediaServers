
import {  RtpParameters, AppData, WebRtcTransport, DtlsParameters, IceParameters,MediaKind, IceCandidate, Producer, Consumer, Worker, Router } from 'mediasoup/node/lib/types'

import { Socket } from 'socket.io'


type LowerLevelClient = {
    producers : Producer[];
    consumers : Consumer[];
    socket : Socket,
    userid : string,
    username : string,
  }
  
  type Rooms = {
    [key:string]:Room
  }
  
  type HighLevelClients = {
    [key:string]:HighLevelClient
  }
  
  type CandidateTransport = {
    transport:WebRtcTransport
    owner : string 
    username : string
    email : string 
    socket_id:string
  }
  
  type CandidateTransports = {
    [key:string]:CandidateTransport
  }

  type Room = {
    router : Router,
    clients : Clients,
  }
  
  interface Clients {
   [key:string]:LowerLevelClient,
  }
  
  type HighLevelClient = {
    Room_name : string //Can Be Used To Map To Room
    UUID : string 
    Username: string 
    Email : string,
    Consumer_Transport_Ids : string[],
    Producer_Transport_Ids : string[],
  }

  interface Sockets {
    [key:string]:Socket
  }


  export {
    Room,
    Rooms,
    CandidateTransports,
    CandidateTransport,
    LowerLevelClient,
    HighLevelClient,
    HighLevelClients,
    Clients,
    Sockets,
  }