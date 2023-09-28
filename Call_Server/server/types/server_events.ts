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
  

type ConnectionSuccess = {
    socketId : string
}

export default ServerToClientEvents
