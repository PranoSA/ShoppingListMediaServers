
import { Client as CassandraClient, types as CassandraTypes } from 'cassandra-driver'

import Config from '../config/cassandra_config.js'
//http://localhost:9042

const Environment = process.env.ENV || "DEVELOPEMENT"

console.log(Config);

const cassandra_client = new CassandraClient(
    { contactPoints: Config[Environment].contactPoints, localDataCenter: 'datacenter1', keyspace: 'shopping' }
);


export default cassandra_client