

type Server_Config = {
    JWK_Config : {
        jwks_url : string 
        issuer : string 
        audience : string 
    }
}

const Server_Config:Server_Config = {
    JWK_Config : {
        jwks_url : "https://auth.compressibleflowcalculator.com/realms/shoppinglist/protocol/openid-connect/certs",
        issuer : "https://auth.compressibleflowcalculator.com/realms/shoppinglist",
        audience : "users"
    }
}


export default Server_Config