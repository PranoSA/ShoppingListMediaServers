import { Client } from "@elastic/elasticsearch";
import { expect } from "chai";
import {ElasticsearchContainer} from '@testcontainers/elasticsearch';

describe("IDK" , () => {

    it("should create an index", async () => {
        //new s.ElasticsearchContainer().start
        const container = await new ElasticsearchContainer().start();
        const client = new Client({ node: container.getHttpUrl() });
      
        await client.indices.create({ index: "people" });

      
        expect((await client.indices.exists({ index: "people" }))).equal(true);
        await container.stop();
      });
    })
    