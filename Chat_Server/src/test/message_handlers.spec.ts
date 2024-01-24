import chai, { expect } from 'chai';

import chaiHTTP from 'chai-http';

import AppServer from '../server'
import insertMessage from '../message_models/insert_message';

import s from '@testcontainers/elasticsearch';

import { createServer } from '../server';
import MessageRoutes from '../routes/message_routes';
import { DefaultMessageModeler } from '../message_models/message_models';
import Client from '@elastic/elasticsearch/lib/client';

/*

/*

                res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('errors');
                  res.body.errors.should.have.property('pages');
                  res.body.errors.pages.should.have.property('kind').eql(
  * Test the /GET route
describe('/GET book', () => {
    it('it should GET all the books', (done) => {
      chai.request(server)
          .get('/book')
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(0);
            done();
          });
    });
});

});

*/

type TestTrial  = {

}



describe("IDK" , () => {

    it("should create an index", async () => {
        //new s.ElasticsearchContainer().start
        const container = await new s.ElasticsearchContainer().start();
        const client = new Client({ node: container.getHttpUrl() });
      
        await client.indices.create({ index: "people" });

      
        expect((await client.indices.exists({ index: "people" }))).equal(true);
        await container.stop();
      });

    it("It Should Get ", (done) => {

        const server = createServer( new MessageRoutes(new DefaultMessageModeler()))

        chai.request(server)
            .post("/message/:groupid")
            .end((err,res) => {
                res.should.have.status(401);
            })
    })
})

