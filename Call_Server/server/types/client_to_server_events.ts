
import { IceParameters, IceCandidate, DtlsParameters, RtpParameters, MediaKind, AppData, RtpCapabilities} from "mediasoup/node/lib/types"

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
    transportproduce:(a:TransportProduceParams, callback:(e:TransportProduceCallbackParams) => void) => void;
    transportrecvconnect:(a:any) => void;
    consume:(a:any, callback:(e:any)=>void ) => void;
    consumerresume:(a:ConsumeResumeParams)=>void;
    getProducers:(a:any, callback:(e:ProducerResponse[]) => void) => void;
  }   


  type ConsumeResumeParams = {
      serverConsumerId : string 
  }
  
  type ProducerResponse = {
    producerId : string
    userid : string 
    username : string 
    email : string 
  }
  
  type createWebRtcClient = {
      consumer: boolean 
  }
  
  type createWebRtcCallbackArguments = {
      params : {
          id: string
          iceParameters: IceParameters
          iceCandidates: IceCandidate[]
          dtlsParameters: DtlsParameters 
      }
    }
  
  type TransportProduceParams = {
      kind: MediaKind,
      rtpParameters: RtpParameters,
      appData: AppData,
    }
    
  
  type transportconnect = {
      dtlsParameters: DtlsParameters
  }
  
  
  type ConsumeParameters = {
      rtpCapabilities: RtpCapabilities
      remoteProducerId : string 
      serverConsumerTransportId : string 
  }
  
  type ConsumeRequestCallbackParams = {
      params : {
          id:string,
          producerId:string,
          kind:MediaKind,
          rtpParameters: RtpParameters,
          serverConsumerId : string,
      }
  }
  
  type TransportProduceCallbackParams = {
      id: string,
      producersExist: boolean,
  }

  type joinRoom = {
    roomName : string 
    }
  
  

  export {
    joinRoom, createWebRtcCallbackArguments, TransportProduceCallbackParams, createWebRtcClient, transportconnect, ClientToServerEvents
  }