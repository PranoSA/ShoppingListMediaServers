import express, { Request, Response, NextFunction } from 'express';
const app = express();
const port = 3000;

import { skimMessagesUp, getUnreadMessages, searchMessages } from "./routes/messages"

app.use(express.json())

app.listen(port, () =>
{
    console.log(`Server is listening on port ${port}`);
});


app.use("/messages/:chatid", skimMessagesUp)

app.use("/messages/:chatid/search", searchMessages)

app.use("/messages/:chatid/status", getUnreadMessages)


app.use("/") //Error Handler Here


