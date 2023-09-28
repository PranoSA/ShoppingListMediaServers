import { Consumer } from "mediasoup/node/lib/Consumer"
import { Producer, } from "mediasoup/node/lib/Producer"
import { Transport } from "mediasoup/node/lib/types"


type User = {
    uuid : string 
    username? : string 
    email? : string 
}

type Client = {
    socket_id : string 
    user : User 
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
    clients : MediaUser[],
}

type Rooms = {
    [key:string]:Room //Room Name
}


interface ProducerTransports {
    [key:string] : Transport
}

interface ConsumerTransports {
    [key:string] : Transport
}

export type {
    Room,
    Rooms ,
    ConsumerTransports,
    ProducerTransports
}