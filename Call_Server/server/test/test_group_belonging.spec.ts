import chai from 'chai'

import { BelongsToGroup, BelongsToGroupDB } from '../auth/belongs_to_group';


var assert = chai.assert;

type TestOps = {
    test_name : string,
    userid: string,
    groupid: string,
    expected_result : boolean
}

/*
943f559f-16cf-4ff1-9a2f-20eca4ae7e08
f4a600ba-594a-43d2-97bb-af3ca5f603c0
d75875ec-f4fd-4824-b88d-d27c0b264758
*/

let group1 = "96851c45-aaf1-4960-a49a-48e9fcb24a1c"

var TestTables : TestOps[] = [
    {
        test_name : "Part Of Group",
        userid : "943f559f-16cf-4ff1-9a2f-20eca4ae7e08",
        groupid : group1,
        expected_result : true,
    },
    {
        test_name : "Also Part Of Group",
        userid : "f4a600ba-594a-43d2-97bb-af3ca5f603c0",
        groupid : group1,
        expected_result : true,
    },
    {
        test_name : "User Id Does Not Exist",
        userid : "f4a600ba-594a-43d2-97bb-af3ca5f603c1",
        groupid : group1,
        expected_result : false,
    },
    {
        test_name : "Not Part Of Group",
        userid : "d75875ec-f4fd-4824-b88d-d27c0b264758",
        groupid : group1,
        expected_result : false,
    },
    {
        test_name : "Group Does Not Exist",
        userid : "f4a600ba-594a-43d2-97bb-af3ca5f603c0",
        groupid : "96851c45-aaf1-4960-a49a-48e9fcb24a1d",
        expected_result : false,
    },
    {
        test_name : "Part Of A Different Group",
        userid : "e7d0f56e-498d-4a89-a0c6-0c8a183e14a8",
        groupid : group1,
        expected_result : false,
    },
    {
        test_name : "Another Real Group",
        userid : "e7d0f56e-498d-4a89-a0c6-0c8a183e14a8",
        groupid : "96851c45-aaf1-4960-a49a-48e9fcb24a1f",
        expected_result : true,
    },
    
]

describe("Test Users In Group", async function() {

    TestTables.forEach((v:TestOps) => {
        it(v.test_name, async function(){
            const result = await BelongsToGroupDB(v.userid, v.groupid)

            chai.expect(result).to.equal(v.expected_result)
        })
    })

  it("adds numbers", function() {
       
  });
});

export {}
