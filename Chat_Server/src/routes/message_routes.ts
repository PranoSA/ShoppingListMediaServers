import express, { Request, Response, NextFunction } from 'express';
import MessageModel from "../message_models/message_models"
import { types as CassandraTypes } from 'cassandra-driver';


class MessageRoutes  {
    models : MessageModel

    constructor (model:MessageModel){
        this.models = model 
    }



    async SearchMessage (req:Request, res:Response, next:NextFunction){
        const chatid: number = parseInt(req.params.chatid)

        //const cursor:number = parseInt(req.params.start) || Date.now()
        
        const cursor:number = parseInt(req.query.start as string )

        const limit: number = parseInt(req.query.limit as string)
    
        const terms : string[] = req.query.terms as string[]
        

    }

}


export default MessageRoutes 