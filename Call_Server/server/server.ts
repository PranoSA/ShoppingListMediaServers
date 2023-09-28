import ClientToServerEvents from './types/client_events'
import ServerToClientEvents from './types/server_events'
import fs from 'fs'
import { Server } from 'socket.io'
import express, {Request, Response, NextFunction} from 'express'
const app = express()
import redisClient from './database/redis_client'

import {Room} from './types/server_types'

import https from 'httpolyglot'

const options = {
    key: fs.readFileSync('./ssl/key.pem', 'utf-8'),
    cert: fs.readFileSync('./ssl/cert.pem', 'utf-8')
  }

app.get('*', (req:Request, res:Response, next) => {
const path = '/sfu/'

if (req.path.indexOf(path) == 0 && req.path.length > path.length) return next()

res.send(`You need to specify a room name in the path e.g. 'https://127.0.0.1/sfu/room'`)
})

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


  app.get('*', (req:Request, res:Response, next) => {
    const path = '/sfu/'
  
    if (req.path.indexOf(path) == 0 && req.path.length > path.length) return next()
  
    res.send(`You need to specify a room name in the path e.g. 'https://127.0.0.1/sfu/room'`)
})

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