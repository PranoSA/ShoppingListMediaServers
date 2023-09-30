
/*

Keep Map of Produce Transports

And Consumer Transports

And Room and Users 


*/

import { Worker, MediaKind } from 'mediasoup/node/lib/types';
import { Clients, ConsumerTransports, ProducerTransports, Rooms, CandidateTransports } from "../types/server_types";
import mediasoup from 'mediasoup'

const ProducerTransports : CandidateTransports = {}

const ConsumerTransports : CandidateTransports = {} //ConsumerTransports  = {}

const Rooms : Rooms  = {}

const Connected_Clients : Clients = {}

let worker : Worker 



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

const kind_audio : MediaKind = 'audio'
const kind_video : MediaKind = 'video'

const mediaCodecs = [
    {
      kind: kind_audio,
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: kind_video,
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000,
      },
    },
  ]


export {
    Rooms,
    ConsumerTransports,
    ProducerTransports,
    Connected_Clients,
    worker,
    mediaCodecs,
    createWorker
}