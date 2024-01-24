import * as jose from 'jose'

const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

async function VerifyJWT(jwt:Uint8Array):Promise<jose.JWTPayload> {

    const { payload, protectedHeader } = await jose.jwtVerify(jwt, JWKS, {
        issuer: 'urn:example:issuer',
        audience: 'urn:example:audience',
      })

      return payload 
}