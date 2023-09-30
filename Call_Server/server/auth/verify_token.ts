import { jwtDecrypt, createRemoteJWKSet, JWTPayload, jwtVerify} from 'jose'

import Config from '../config/server_config'

const JWKS = createRemoteJWKSet(new URL(Config.JWK_Config.jwks_url))



async function VerifyToken(token:string):Promise<JWTPayload>{
    const { payload, protectedHeader } = await jwtVerify(token, JWKS, {
        issuer: Config.JWK_Config.issuer,
        audience: Config.JWK_Config.audience,
    })

    return payload 
}


export default VerifyToken
