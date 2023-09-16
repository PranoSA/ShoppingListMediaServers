import express, { Request, Response, NextFunction } from 'express';
import { Kafka, KafkaConfig } from 'kafkajs';
import { InitGroupsKafka } from './kafka_consumer'
//import { apiDocumentation } from './o';

import * as swaggerUi from 'swagger-ui-express'
import Yaml from 'yaml'
import * as fs from 'fs'

const file = fs.readFileSync(__dirname + "/openapi/spec.yml", 'utf8')
const swaggerDoc = Yaml.parse(file)



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


app.listen(port, () =>
{
    console.log(`Server is listening on port ${port}`);
});

import { skimMessagesUp, getUnreadMessages, searchMessages } from "./routes/messages"


app.use("/messages/:chatid", skimMessagesUp)

app.use("/messages/:chatid/search", searchMessages)

app.use("/messages/:chatid/status", getUnreadMessages)


//app.use("/") //Error Handler Here




