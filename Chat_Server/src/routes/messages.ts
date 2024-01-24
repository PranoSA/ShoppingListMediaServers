import express, { Request, Response, NextFunction } from 'express';
const { Client } = require('@elastic/elasticsearch')
import Config from "../config"
import fs from 'fs'
const cassandra = require('cassandra-driver');
import { Client as CassandraClient, types as CassandraTypes } from 'cassandra-driver'
import { time } from 'console';

CassandraTypes.TimeUuid.now()




const cassandra_client = new CassandraClient(
    { contactPoints: ['http://localhost:9121'], localDataCenter: 'datacenter1', keyspace: 'shopping' }
);

const Environment: string = process.env.ENVIRONMENT || "DEVELOPMENT"

const CAPath: string = process.env.ELASTICSEARCH_CA || "./http_ca.crt"

const elasticsearch_client = new Client({
    nodes: Config[Environment].ELASTICSEARCH_HOST, // Elasticsearch endpoint
    auth: {
        username: process.env.ELASTICSEARCH_USER,
        password: process.env.ELASTICSEARCH_PASSWORD,
    },
    tls: {
        // might be required if it's a self-signed certificate
        rejectUnauthorized: Config[Environment].Require_CA_Certification,
        ca: fs.readFileSync(CAPath),
    }
})



/**
 * 
 * given a Certain Chat ID and a snowflake message id, 
 * fetch surrounding messages (up to 25 up and down), 
 *  and remark the "latest " Message read to this one if its higher than what exists
 * 
    Schema Looks Like 
    Table Message (chatid/uuid) = primary key, (timestamp/uuid) = sort key
        Sender : "", Message Content: " ", Timestamp : " ", Edited : ""

    
    Last Read Message Primary Key -> (user, chatid)->Primary Key 
        Last_Message_Read : id_of_last_message_read
  */


const skimMessagesUp = (req: Request, res: Response, next: NextFunction) =>
{

    const chatid: number = parseInt(req.params.chatid)

    const cursor: any = req.query.timestamp || ""

    const limit: any = req.query.timestamp as string



    let offset_limit: number = parseInt(limit)

    let timestamp_offset: number = Date.now()


    if (Number.isNaN(offset_limit)) {
        offset_limit = 25
    }

    offset_limit = Math.min(offset_limit, Config[Environment].Offset_limit)

    if (cursor == "") {
        timestamp_offset = Date.now()
    }
    else {
        timestamp_offset = parseInt(cursor)
        if (Number.isNaN(timestamp_offset)) {
            timestamp_offset == Date.now()
        }
    }


    if (Number.isNaN(chatid)) {
        res.locals.status = 400
        next()
    }

    //This Query Will BE Used in Pagination Request (Take The Last Timestamp)
    const query: string = `SELECT group_id, timestamp, content, creator 
    FROM messages 
    WHERE group_id ? AND timestamp > ?
    LIMIT 25`;




    cassandra_client.execute(query, [chatid, timestamp_offset])
        .then(result =>
        {
            res.json(result.rows)
        })
        .catch(err =>
        {


        })

}

const skimMessagesDown = (req: Request, res: Response, next: NextFunction) =>
{
    const chatid: number = parseInt(req.params.chatid)

    const cursor: any = req.query.timestamp || ""

    const limit: any = req.query.timestamp as string



    let offset_limit: number = parseInt(limit)

    let timestamp_offset: number = Date.now()


    if (Number.isNaN(offset_limit)) {
        offset_limit = 25
    }

    offset_limit = Math.min(offset_limit, Config[Environment].Offset_limit)

    if (cursor == "") {
        timestamp_offset = Date.now()
    }
    else {
        timestamp_offset = parseInt(cursor)
        if (Number.isNaN(timestamp_offset)) {
            timestamp_offset == Date.now()
        }
    }


    if (Number.isNaN(chatid)) {
        res.locals.status = 400
        next()
    }

    //This Query Will BE Used in Pagination Request (Take The Last Timestamp)
    const query: string = `SELECT group_id, timestamp, content, creator 
    FROM messages 
    WHERE group_id ? AND timestamp < ?
    LIMIT 25`;



    cassandra_client.execute(query, [chatid, timestamp_offset])

        .then(result => console.log('User with email %s', result.rows[0].email))
        .catch(err => console.log(err))
}


/***

    Get How Many Unrad Messages Have Occured
    This Will ALso Be Called Automatically When Reading a Group Chat
    It will create an Entry if DNE and Start Tracking Last Unread Messages


*/
const getUnreadMessages = (req: Request, res: Response, next: NextFunction) =>
{

}


/**
 * 
 * 
 *  Use Elasticsearch To Return a List of Snowflake IDs,
    Then The User could Scan (Our Elasticsearch Model Will Not Support THis)

 *  
 * 
 */

type Body = {
    Terms: string[]
}

const searchMessages = async (req: Request, res: Response, next: NextFunction) =>
{
    let timeuuid = CassandraTypes.TimeUuid.now()

    const terms: Body = req.body

    try {
        const matchClause = terms.Terms.map((term) => ({
            match: {
                content: term
            }
        }))

        const response = await elasticsearch_client.search({
            index: "shopping",

            query: {
                bool: {
                    must: matchClause
                }
            }

        });

        const hits = response.body.hits.hits;
        console.log('Search results:', hits);
    }
    catch (e) {

    }



}

/**

    Should Be Used Sparingly, Only Allow For Random Page Search From The Client,
    This Can Be Disallowed or not supported by the Client APplication
*/


const paginateMessages = (req: Request, res: Response, next: NextFunction) =>
{

}


/**

    Now CRUD OPERATIONS -> Delete, Update, and Insert


*/

const createMessage = async (req: Request, res: Response, next: NextFunction) =>
{
    const create_time = CassandraTypes.TimeUuid.now()
    //Ge
    let chatid = ""
    try {
        const result = await elasticsearch_client.index({
            index: "shoppinglist_chats",
            document: {
                chat_id: chatid,
                sendor: "pcsd",
                content: req.body.content,
                message_id: create_time,
                sent: Date.now(),
            }
        })
        const query: string = `SELECT group_id, timestamp, content, creator 
        FROM messages 
        WHERE group_id ? AND timestamp > ?
        LIMIT 25`;

        const res = cassandra_client.execute(query, [],)

        return result
    }
    catch (e) {
    }
}

const deleteMessage = async (req: Request, res: Response, next: NextFunction) =>
{


}



export
{
    getUnreadMessages,
    skimMessagesUp,
    searchMessages,
    skimMessagesDown,
}