# ShoppingListMediaServers
 SELECT column_name,kind FROM system_schema.columns   WHERE keyspace_name='shopping'   AND table_name='me
ssages';


# Schema Setup


## Elasticsearch ->


### Index : Chat_Messages 

#### Shopping List-Chats : Schema
chat_id "uuid of chat"
message_id : number,
sendor "sender in chat"
content "text"
sent : date



## Cassandra -> 

Used To Store Information About Groups, their Users, and Messages About Groups 

### Keyspace : shopping_list



#### Shopping List : Users 

    user : 
    pfp text
    username text 
    id text

    One:Many Relationship stored in the Row, Rewritten Every time a new user is added
    PK(groupid)

    created_at: timestamp
    users : []users


#### Shopping List : Messages
    PK(groupid) -> UUID
    SK(messageid) -> Snowflake

    groupid : uuid of group
    messageid : snowflake id of message
    creator : uuid of creator who created it
    timestamp : originally sent timestamp  (redundant kind of)
    content : Message Content
    group_id, timestamp, content, creator 

    Each Message is Appended And Can Be Edited / Rewritten 



https://swagger.io/docs/specification/describing-responses/
https://www.npmjs.com/package/openapi-typescript
https://www.npmjs.com/package/express-openapi-validator
https://hackernoon.com/setting-up-kafka-on-docker-for-local-development
