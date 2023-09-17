import { Message } from 'kafkajs';
import insertMessage from './insert_message';
import { components } from '../types/api';

import defaultInsertMessage from './insert_message'
import { searchMessageWithTerms, searchMessageWithoutTerms } from './search_terms';


interface MessageModel {
    insertMessage (message : components["schemas"]["MessageRequest"], groupid:string,sender:string):Promise<components["schemas"]["Message"]>
    searchMessageWithTerms (terms : String[], groupid: String, start_time: Number, limit: Number, down:Boolean ):Promise<components["schemas"]["Message"][]>
    searchMessageWithoutTerms(groupid:String,start_time: Number, limit: Number, down:Boolean  ):Promise<components["schemas"]["Message"][]>
    //searchMessageWithTermsDown (terms : String[], groupid: String, start_time: Number, limit: Number ):components["schemas"]["Message"][]
    //searchMessageWithoutTermsDown(groupid:String,start_time: Number, limit: Number  ):components["schemas"]["Message"][]
    //searchMessageWithTermsOr(groupid:String,start_time: Number, limit: Number, down:Boolean  ):components["schemas"]["Message"][]
}

class DefaultMessageModeler {
    insertMessage = defaultInsertMessage
    searchMessageWithTerms = searchMessageWithTerms
    searchMessageWithoutTerms = searchMessageWithoutTerms

    constructor (){

    }
}



export default MessageModel

export {
    DefaultMessageModeler
}



interface MessageModelInterface {
    insertMessage(terms : String[], groupid: String ):String
}

class MessageModeler {
    insertMessage(terms : String[], groupid: String ):String{
        return "bob"
    }
}

class TakesMessageModel {
    model : MessageModelInterface

    constructor(model:MessageModelInterface){
        this.model =model
    }

}

const taker = new TakesMessageModel(new MessageModeler())

