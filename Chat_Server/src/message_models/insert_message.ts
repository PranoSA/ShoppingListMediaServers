import elasticsearch_client from '../service/elasticsearch';
import cassandra_client from '../service/cassandra'
import { types as CassandraTypes } from 'cassandra-driver'

import {components} from '../types/api'

let testGroupId = "ab26b3d0-f1f8-49ca-85ea-46180f8679da"



const insertMessage = async (message : components["schemas"]["MessageRequest"], groupid:string,sender:string) :Promise<components["schemas"]["Message"]>=> {
    const create_time = CassandraTypes.TimeUuid.now()

    const created_at = Date.now()
    


        const query: string = `
        INSERT INTO Shopping.messages(groupid, messageid, sendor, content, sent_at)
        VALUES(?,?,?,?,?)
        RETURNING messageid
        `  

        const res = await cassandra_client.execute(query, [groupid, create_time, sender, message.content,created_at],)

        const result = await elasticsearch_client.index({
            index: "shoppinglist_chats",
            document: {
                chat_id: groupid,
                sendor: sender,
                content: message.content,
                message_id: create_time,
                sent:  create_time.getDate(),//Date.now(),
            }
        })
        
        const response : components["schemas"]["Message"] = {
            messageid: res.rows[0].messageid,
            groupid: groupid,
            sendor : sender, 
            content: message.content, 
            sent_at: create_time.getDate().toISOString()

        }

        return response 

       // return res

}


export default insertMessage