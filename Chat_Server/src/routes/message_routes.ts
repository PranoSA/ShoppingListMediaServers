import express, { Request, Response, NextFunction } from 'express';
import MessageModel from "../message_models/message_models"
import { types as CassandraTypes } from 'cassandra-driver';
import { components } from '../types/api';


class MessageRoutes  {
    models : MessageModel

    constructor (model:MessageModel){
        this.models = model 
    }





    GenMessage = async(req:Request, res:Response, next:NextFunction) => {
        const chatid: string = req.params.chatid as string 

        let body : components["schemas"]["MessageRequest"] = req.body 

        body.sent_at = Date.now().toString()

        if (body.groupid == undefined || body.content == undefined || body.sent_at == undefined){

        }

        const response = await this.models.insertMessage(body, chatid, "prano")

        res.json(response)

    }


    SearchMessage = async (req:Request, res:Response, next:NextFunction) => {
        const chatid: String = req.params.chatid as String 

        //const cursor:number = parseInt(req.params.start) || Date.now()
        
        let cursor:number = parseInt(req.query.start as string )

        if (Number.isNaN(cursor)){
            cursor = Date.now()
        }

        let limit: number = parseInt(req.query.limit as string)

        if (Number.isNaN(limit)){
            limit = 25 
        }
    
        let terms : String[] = req.query.terms as string[] || []

        if (!(terms instanceof Array)){
            terms  = [terms]
        }
        
        const beflow : Boolean = (req.query.below as string || "true")  == "false" ? false : true 

        const op : Boolean = (req.query.and as string || "true") == "false" ? false:true


        const ordered: Boolean = (req.query.ordered as string || "true") == "true" ? false:true  

        if(ordered){
            let annum : Number = parseInt(req.query.annum as string)
            if (Number.isNaN(annum)){
                annum = 0 
            }
            const response = await this.models.searchMessageWithTermsWeighted(terms, chatid, cursor, annum, limit, beflow)

            res.json(response)
            return 
        }


        if (terms.length == 0){
            const response = await this.models.searchMessageWithoutTerms(chatid, cursor, limit, beflow)
           return  res.json(response)
        }

        try {
        if (op ){
          const  response = await this.models.searchMessageWithTerms(terms, chatid, cursor, limit, beflow)
          return res.json(response)
        }

        if (!op) {
            const response = await this.models.searchMessageWithTermsOr(terms, chatid, cursor, limit, beflow)
            return res.json(response)
        }
    }
        catch(e){
            return res.json({code: "error"})
        }
    }

}


export default MessageRoutes 