import express, { Request, Response, NextFunction } from 'express';
import { Kafka, KafkaConfig } from 'kafkajs';
import { InitGroupsKafka } from './kafka_consumer'
//import { apiDocumentation } from './o';
import {types as CassandraTypes}  from 'cassandra-driver'
import * as Cassandra from 'cassandra-driver'
import insertMessage from './message_models/insert_message'
import {components} from './types/api'
import {searchMessageWithoutTerms, searchMessageWithTerms} from './message_models/search_terms'

import {DefaultMessageModeler} from "./message_models/message_models"
import MessageRoutes from './routes/message_routes'


import * as swaggerUi from 'swagger-ui-express'
import Yaml from 'yaml'
import * as fs from 'fs'

import * as jose from 'jose'


const router : MessageRoutes = new MessageRoutes(new DefaultMessageModeler())

//const file = fs.readFileSync(__dirname + "/openapi/spec.yml", 'utf8')
const file = fs.readFileSync("./openapi/spec.yml", "utf8")
const swaggerDoc = Yaml.parse(file)

const create_time = CassandraTypes.TimeUuid.now()

const newestMessage :components["schemas"]["MessageRequest"]  = {
    content: "I like to eat apples at the beach while sipping beer, lets buy some drinks and some fluids to replinish",
}

let testGroupId = "ab26b3d0-f1f8-49ca-85ea-46180f8679da"


const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))


//insertMessage(newestMessage, testGroupId, "pcadler")

//searchMessageWithoutTerms(testGroupId)

//searchMessageWithTerms(["beach", "beer"], testGroupId)

const app = express();
const port = 3000;

var options = {}

app.use('/api-docs', (req: any, res: Response, next: NextFunction) =>
{
    swaggerDoc.host = req.get('host');
    req.swaggerDoc = swaggerDoc;
    next();
}, swaggerUi.serveFiles(swaggerDoc, options), swaggerUi.setup());



app.use(express.json())

//InitGroupsKafka()

app.get("/messages/:chatid", router.SearchMessage)

app.post("/messages/:chatid", router.GenMessage)

app.listen(port, () =>
{
    console.log(`Server is listening on port ${port}`);
});

import { skimMessagesUp, getUnreadMessages, searchMessages } from "./routes/messages"

app.use("/messages/:chatid", skimMessagesUp)

app.use("/messages/:chatid/search", searchMessages)

app.use("/messages/:chatid/status", getUnreadMessages)


//app.use("/") //Error Handler Here




