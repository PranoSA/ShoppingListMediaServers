CREATE KEYSPACE shopping
# Single Node Setup

CREATE KEYSPACE Shopping
WITH REPLICATION ={
'class' : 'SimpleStrategy',
'replication_factor' : 1
};

USE shopping;

CREATE TYPE User (
            id text,
            pfp text,
            username text,
            date_joined timestamp);


CREATE TABLE Messages(
            groupid uuid,
            messageid timeuuid,
            sendor text,
            content text,
            sent_at timestamp,
            PRIMARY KEY((groupid), messageid));