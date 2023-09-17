import { time } from "console"
import cassandra_client from "../service/cassandra"
import elasticsearch_client from "../service/elasticsearch"
import { components } from '../types/api';
import { estypes } from '@elastic/elasticsearch'

type QueryRequest = {
    
}

const searchMessageWithoutTerms = async (groupid:String,start_time: Number, limit: Number, down:Boolean  ):Promise<components["schemas"]["Message"][]> => {
    /*
            const query: string = `
        INSERT INTO Shopping.messages(groupid, messageid, sendor, content, sent_at)
        VALUES(?,?,?,?,?)
        `  

        const res = await cassandra_client.execute(query, [groupid, create_time, sender, message.content,created_at],)        const query: string = `
        INSERT INTO Shopping.messages(groupid, messageid, sendor, content, sent_at)
        VALUES(?,?,?,?,?)
        `  

        const res = await cassandra_client.execute(query, [groupid, create_time, sender, message.content,created_at],)
    */

    let query : string = `
    SELECT *
    FROM Shopping.messages
    WHERE groupid = ?
    AND messageid > maxTimeuuid(?)
    LIMIT ?
`

    if(down){
        query   = `
        SELECT *
        FROM Shopping.messages
        WHERE groupid = ?
        AND messageid < maxTimeuuid(?)
        LIMIT ?
    `
    }


    //minTimeuuid(?

    const res = await cassandra_client.execute(query, [groupid, Date.now()], { prepare: true })
    

    return res.rows.map((i, v):components["schemas"]['Message'] => {

        const newMessage = {
            groupid : i.groupid,
            messageid: i.messageid,
            sendor: i.author,
            content: i.content,
            sent_at: i.created_at,
        }
        return newMessage
    })
    return []
}


//ANd Query 
const searchMessageWithTerms = async (terms : String[], groupid:String,start_time: Number=Date.now(), limit: Number =25, down:Boolean =false ):Promise<components["schemas"]["Message"][]> => {



        const matchClause = terms.map((term) => ({
            match: {
                content: term
            }
        }))

        const downQuery =  {
            range : {
            lt : {
                created_at : start_time
            },
        }
        }

        const afterQuery =  {
            range : {
            gt : {
                created_at: start_time 
            },
        }
        }

        const rightQuery= down?downQuery:afterQuery 

        

        const response = await elasticsearch_client.search({
            index: "shoppinglist_chats",

            query: {
                bool: {
                    filter : [rightQuery,],
                    must: [...matchClause, {
                        match : {
                            chat_id : groupid,
                        },
                    }, 
                ],
                },
            },
            size: limit,
        });

        const hits = response.body.hits.hits;

        return response.body.hits.map((v:any,i:any ):components["schemas"]["Message"] => {
            return {
                messageid: v.messageid,
                groupid: v.groupid,  //This Should Be a String...
                sendor: v.author,
                content: v.content, 
                sent_at: v.created_at,
            }
        })
    
}

export {
    searchMessageWithTerms,
    searchMessageWithoutTerms,
}