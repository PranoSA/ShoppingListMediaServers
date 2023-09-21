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




    const res = await cassandra_client.execute(query, [groupid, start_time, limit], { prepare: true })
    


    const rows = res.rows.map((i, v):components["schemas"]['Message'] => {

        const newMessage = {
            groupid : i.groupid,
            messageid: i.messageid,
            author : i.author,
            content: i.content,
            sent_at: i.created_at,
        }
        return newMessage
    })

    return rows

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
            sent :{
                lt : start_time, 
            },
        }
        }

        const afterQuery =  {
            range : {
            sent :{
                gt : start_time, 
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
            sort : [
                {"sent" : {"order" : "asc"}}
            ],
            size: limit,
        });

        const hits = response.hits.hits;


        const responses = response.hits.hits.map((v:any,i:any ):components["schemas"]["Message"] => {
            return {
                messageid: v._source.message_id,
                groupid: v._source.chat_id,  //This Should Be a String...
                author : v._source.author,
                content: v._source.content, 
                sent_at: v._source.sent,
            }
        })


        return responses;
    
}



//ANd Query 
const searchMessageWithTermsOr = async (terms : String[], groupid:String,start_time: Number=Date.now(), limit: Number =25, down:Boolean =false ):Promise<components["schemas"]["Message"][]> => {


    const matchClause = terms.map((term) => ({
        match: {
            content: term
        }
    }))


    const downQuery =  {
        range : {
        sent :{
            lt : start_time, 
        },
    }
    }

    const afterQuery =  {
        range : {
        sent :{
            gt : start_time, 
        },
    }
    }

    const rightQuery= down?downQuery:afterQuery 



    const response = await elasticsearch_client.search({
        index: "shoppinglist_chats",


        query : {
            bool : {
                filter : [rightQuery],
                must : {
                    bool : {
                    should : [...matchClause, {
                        match : {
                            chat_id : groupid,
                        },
                    }, 
                ],
            }
                }
            }
        },
        sort : [
            {"sent" : {"order" : "asc"}}
        ],
        size: limit
    });

    const hits = response.hits.hits;

    const responses = response.hits.hits.map((v:any,i:any ):components["schemas"]["Message"] => {
        return {
            messageid: v._source.message_id,
            groupid: v._source.chat_id,  //This Should Be a String...
            author : v._source.author,
            content: v._source.content, 
            sent_at: v._source.sent,
        }
    })


    return responses;

}



const searchMessageWithTermsWeighted = async (terms : String[], groupid:String,start_time: Number=Date.now(), time_annum:Number = 30_000_000,limit: Number =25, down:Boolean =false, ):Promise<components["schemas"]["Message"][]> => {


    const matchClause = terms.map((term) => ({
        match: {
            content: term
        }
    }))


    const scriptClause = {
        script_score : {
            script : {
                source : `Math.exp(0-Math.abs(params.now-doc['sent'].value.millis/1000)/${time_annum}})`,
                params: {
                    now: start_time
                }
            }
        }
    }

    const scriptClauseQuery = time_annum == 0 ? {} : scriptClause;

    let multiplier = 1
    if (time_annum == 0){
        multiplier = 0
    }



    const response = await elasticsearch_client.search({
        index: "shoppinglist_chats",


        /*query : {
            bool : {
                filter : [rightQuery],
                must : {
                    bool : {
                    should : [...matchClause, {
                        match : {
                            chat_id : groupid,
                        },
                    }, 
                ],
            }
                }
            }
        },*/



        query : {
            function_score : {
                query : {
                    bool : {
                        filter : [
                            {
                                match : {
                                    chat_id : groupid
                                }
                            }
                        ],
                        must : {
                            bool : {
                                should : [...matchClause ]
                            }
                        }
                    }
                },
                script_score : {
                    script : {
                        source : `Math.exp(0-${multiplier}*Math.abs(params.now-doc['sent'].value.millis)/(${time_annum}+1)/1000)`,
                        params: {
                            now: start_time
                        }
                    }
                },
                boost_mode : "multiply",
            }
        },
        size: limit
    });
//`Math.exp(0-${multiplier}*Math.abs(params.now-doc['sent'].value.millis/1000)/${time_annum}})`,
    const hits = response.hits.hits;

    const responses = response.hits.hits.map((v:any,i:any ):components["schemas"]["Message"] => {
        return {
            messageid: v._source.message_id,
            groupid: v._source.chat_id,  //This Should Be a String...
            author : v._source.author,
            content: v._source.content, 
            sent_at: v._source.sent,
            score: v._score
        }
    })


    return responses;

}


export {
    searchMessageWithTerms,
    searchMessageWithoutTerms,
    searchMessageWithTermsOr,
    searchMessageWithTermsWeighted
}