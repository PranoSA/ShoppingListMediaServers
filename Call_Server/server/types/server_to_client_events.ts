type NewProducer = {producerId:string, userid:string, username:string, email:string}

type ProducerClosed = {producerId:string}

type ConnectionSuccess = {
    socketId : string
}


interface ServerToClientEvents {
    /*
        1. Connected To the Server Successfully 
  
        2. New Producer -> Start Signaling For New Conusmer Tranport TO Build One
  
        3. Producer Closed -> Get the Consumer Transport To CLose 
    */

    
    connectionsuccess: (a:ConnectionSuccess) => void; 
    newproducer:(a:NewProducer)=>void; 
    producerclosed:(a:ProducerClosed)=>void;
  }

export {
    ConnectionSuccess,
    NewProducer,
    ProducerClosed,
    ServerToClientEvents
}