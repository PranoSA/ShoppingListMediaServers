import jose, { jwtDecrypt } from 'jose'

const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

var Config : JWTConfig

type JWTConfig = {
    url:string 
    issuer:string //"" if does Not Matter
    expires:string //How Long To Give Leeway ...
    audience:string 
}


async function VerifyToken(token:string){
    const { payload, protectedHeader } = await jose.jwtVerify(token, JWKS, {
        issuer: Config.issuer,
        audience: Config.audience,
    })
}



