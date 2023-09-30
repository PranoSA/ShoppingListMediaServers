import { HighLevelClient } from "..";
import VerifyToken from '../auth/verify_token';


async function newUser(params:string):Promise<HighLevelClient> {

    const Payload = await VerifyToken(params)

    return {
        UUID : Payload.sub||"",
        Username : Payload.name as string||"",
        Room_name : "",
        Email: Payload.email as string||"",
        Consumer_Transport_Ids : [],
        Producer_Transport_Ids : [],
    }
}

export default newUser