import MessageModel from "../message_models/message_models"


class MessageRoutes  {
    models : MessageModel

    constructor (model:MessageModel){
        this.models = model 
    }

}

export default MessageRoutes 