import {Router, Worker, Consumer, Producer, AppData} from 'mediasoup/node/lib/types';

import { Rooms as rooms, worker, mediaCodecs } from '../globals/rooms_clients'

import { Room } from '../types/server_types';


const createRoom = async (room_name:string, initiator:string):Promise<Router> => {
    if(rooms[room_name]){
  
      console.log(`Joining Rooms ${room_name} by ${initiator}`);
      rooms[room_name].clients[initiator] = {
        producers : [],
        consumers : [],
      }
  
      return rooms[room_name].router
  
    }
  
    
    console.log(`Created Routing For Rooms ${room_name} by ${initiator}`);
  

    let router : Router<AppData> = await worker.createRouter({mediaCodecs})
  
    let newRoom : Room = {
      groupname : room_name,
      groupid : room_name,
      host : "01",
      router : router,
      clients : {},
      all_users : [],
    }
  
    newRoom.clients[initiator] = {
      producers: [],
      consumers: [],
    }
    
  
    rooms[room_name] = newRoom;
  
    return router 
  
  }

  export default createRoom