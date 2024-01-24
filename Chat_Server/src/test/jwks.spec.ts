import express, {Request, NextFunction, Response } from 'express';
import * as jose from 'jose'
import * as josejwt from 'node-jose'

const app = express();

var KeyStore :josejwt.JWK.KeyStore 

const Issuer = "test.compressibleflowcalculator.com.shoppinglist"
const Audience = "tester.compressibleflowcalculator.com.shoppinglist"


async function StartUp(){
    const key = await josejwt.JWK.createKey("RSA", 2048, {})

    KeyStore =  josejwt.JWK.createKeyStore()
    KeyStore.add(key)
}

app.use("/signin", (req:Request, res:Response) => {
    KeyStore.generate("RSA",2048, {
        Audience,

    } )
})

app.use("/jwks", (req:Request, res:Response) => {
    res.setHeader("Content-Type", "application/json")
    res.send(KeyStore.toJSON())
})

app.use("/verify", (req:Request, res:Response) => {
    const header = req.headers.authorization as String 

    const bearer = header.split("Bearer: ")[1]


})  
