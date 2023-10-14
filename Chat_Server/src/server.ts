import express, {Response, NextFunction, Request} from 'express';
import * as swaggerUi from 'swagger-ui-express'
import Yaml from 'yaml'
import * as fs from 'fs'
import MessageRoutes from './routes/message_routes'

import { skimMessagesUp, getUnreadMessages, searchMessages } from "./routes/messages"
import { DefaultMessageModeler } from './message_models/message_models';


//const file = fs.readFileSync(__dirname + "/openapi/spec.yml", 'utf8')
const file = fs.readFileSync("./openapi/spec.yml", "utf8")
const swaggerDoc = Yaml.parse(file)

const router : MessageRoutes = new MessageRoutes(new DefaultMessageModeler())

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

function createServer(routes :MessageRoutes) {

    const app = express();

    app.get("/messages/:chatid", routes.SearchMessage)

    app.post("/message/:groupid", routes.GenMessage);

    return app;
}


export {
    createServer
}



app.use(express.json())

//InitGroupsKafka()

app.get("/messages/:chatid", router.SearchMessage)

app.post("/messages/:chatid", router.GenMessage)

app.listen(port, () =>
{
    console.log(`Server is listening on port ${port}`);
});



app.use("/messages/:chatid", skimMessagesUp)

app.use("/messages/:chatid/search", searchMessages)

app.use("/messages/:chatid/status", getUnreadMessages)


export default app