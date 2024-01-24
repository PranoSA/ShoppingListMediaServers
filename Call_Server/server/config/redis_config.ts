

type Redis_Config = {
    port : number
    host : string 
    user: string 
    password : string 
    tls: boolean 
    tls_ca_path? : string 
    tls_key_path? : string 
}

interface Redis_Configs {
    [key:string] :Redis_Config
}

const Redis_Config : Redis_Configs = {
    "DEVELOPMENT" : {
        port : 6379,
        host: "localhost",
        user : "string",
        password : "spring",
        tls : false, 
    },
}

export default Redis_Config
