import cassandra_client from '../database/cassandra_client.js'
import VerifyToken from './verify_token.js'
import {JWTPayload} from 'jose'


/*
CREATE TYPE Group_Users (
            id text,
            pfp text,
            username text,
            privilege int,
            date_joined timestamp);

*/

type NestedUserType = {
    id : string 
    pfp : string 
    username : string 
    privilege : number 
    date_joined : Date    
}

const BelongsToGroupDB  = async(userid:string, groupid:string):Promise<boolean> => {
    const query = `
    SELECT groupid, users
    FROM groups
    WHERE groupid = ?
    `

    const rows = await cassandra_client.execute(query, [groupid], {prepare:true} )

    if(rows.rows.length == 0){
        return false
    }

    const Users:NestedUserType[] = rows.rows[0].users;

    //Find If User Part of Group ... this would be really bad for large groups 
    //Use a Join Table For This Scenario 
    const index = Users.findIndex(value => {
        return value.id == userid
    })

    if(index == -1){
        return false 
    }

    return true 
}

const BelongsToGroup = async(JWT:string, groupid:string):Promise<boolean> => {

    let payload : JWTPayload

    try {
        const auth = await VerifyToken(JWT)
        payload = auth 

        const userid = (await payload).sub;

        if(!userid){
            return false 
        }

        return BelongsToGroupDB(userid, groupid);
    }
    catch(e){

        throw new Error("Not Authenticated")
    }

}


export {
    BelongsToGroupDB,
    BelongsToGroup,
}