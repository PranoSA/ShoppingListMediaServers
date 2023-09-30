
import { Transport, Router, Consumer, Producer, WebRtcTransport } from "mediasoup/node/lib/types"


type User = {
    uuid : string 
    username? : string 
    email? : string 
}

type Client = {
    socket_id : string 
    user : User 
    Room_name : string 
    uuid : string 
}

interface Clients {
    [key:string]: Client
}

type MediaUser = {
    producers : Producer[]
    consumers : Consumer[]
}

type Room = {
    groupid : string //Redundant
    groupname: string 
    all_users : User[] //Read In When You Open The Room 
    host : string  //This is So Users Know What Room A Client Is In ...
    clients : {
        [key:string]:MediaUser
    },
    router: Router
}

type Rooms = {
    [key:string]:Room //Room Name
}

type CandidateTransport = {
    transport:WebRtcTransport
    owner : string 
    socket_id:string
  }


type CandidateTransports  = {
    [key:string]:CandidateTransport[]
}



interface ProducerTransports {
    [key:string] : CandidateTransports
}

interface ConsumerTransports {
    [key:string] : CandidateTransports
}

export type {
    Room,
    Rooms ,
    ConsumerTransports,
    ProducerTransports,
    Clients,
    CandidateTransports
}


  
  type CandidateProducerTransports = {
    [key:string]:CandidateTransport 
  }
  
  type CandidateConsumerTransports = {
    [key:string]:CandidateTransport[]
  }