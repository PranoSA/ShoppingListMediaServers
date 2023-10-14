docker run --rm -d --name cassandra --hostname cassandra -p 9042:9042 cassandra
cqlsh at ~/cqlsh-astra

CREATE KEYSPACE shopping
# Single Node Setup

CREATE KEYSPACE Shopping
WITH REPLICATION ={
'class' : 'SimpleStrategy',
'replication_factor' : 1
};

USE shopping;

CREATE TYPE Group_User (
            id text,
            pfp text,
            username text,
            privilege int,
            date_joined timestamp);

CREATE TABLE Groups (
            groupid uuid,
            users list<frozen<Group_User>>,
            PRIMARY KEY(groupid)
);


CREATE TABLE Messages(
            groupid uuid,
            messageid timeuuid,
            author text,
            content text,
            created_at timestamp,
            PRIMARY KEY((groupid), messageid));


INSERT INTO Shopping.Messages (groupid, messageid, sendor, content, sent_at)
VALUES ('ab26b3d0-f1f8-49ca-85ea-46180f8679da', 'ab26b3d0-f1f8-49ca-85ea-46180f8679da', 'pcadler@gmail.com','We Love To Swim In The Sea, That's Why I am ordering Lays Potato Chips for our picnic on the beach. I would say that it is a very fun experience to have sand in your feet, lay on a towel, and eat soggy sandwiches and a few beers. I saylets get some pale ales, something like Sierra Nevada, which is a nice but budget higher alcohol by volume abv beer that we could all enjoy', '2017-05-05 00:00:00.000+0000')
USING TTL 86400 AND TIMESTAMP 123456789;


 UPDATE Groups (groupid, users) VALUES (96851c45-aaf1-4960-a49a-48e9fcb24a1c, [{id:'23', pfp:'232',username:'Pcadler',privilege:7, date_joined:toTimestamp(now())}]);
