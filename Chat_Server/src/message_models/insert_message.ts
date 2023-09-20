import elasticsearch_client from '../service/elasticsearch';
import cassandra_client from '../service/cassandra'
import { types as CassandraTypes } from 'cassandra-driver'

import {components} from '../types/api'



const insertMessage = async (message : components["schemas"]["MessageRequest"], groupid:string,sender:string) :Promise<components["schemas"]["Message"]>=> {
    const create_time = CassandraTypes.TimeUuid.now()

    const created_at = Date.now()
    


        const query: string = `
        INSERT INTO Shopping.messages(groupid, messageid, author, content, created_at)
        VALUES(?,?,?,?,?)
        `  

        const res = await cassandra_client.execute(query, [groupid, create_time, sender, message.content,created_at],)

        const result = await elasticsearch_client.index({
            index: "shoppinglist_chats",
            document: {
                chat_id: groupid,
                author : sender,
                content: message.content,
                message_id: create_time,
                sent:  create_time.getDate(),//Date.now(),
            }
        })  

        create_time.getDate().getTime()
        
        const response : components["schemas"]["Message"] = {
            messageid: create_time.getDate().getTime(), //create_time,//res.rows[0].messageid,
            groupid: groupid,
            author : sender, 
            content: message.content, 
            sent_at: create_time.getDate().toISOString()

        }

        return response 
        
}


export default insertMessage