import express, { Request, Response, NextFunction } from 'express';
const { Client } = require('@elastic/elasticsearch')
import Config from "../config"
import fs from 'fs'
const cassandra = require('cassandra-driver');
import { Client as CassandraClient, types as CassandraTypes } from 'cassandra-driver'

//http://localhost:9042

const Environment = process.env.ENV || "DEVELOPMENT"

const cassandra_client = new CassandraClient(
    { contactPoints: Config[Environment]["Cassandra_Host"], localDataCenter: 'datacenter1', keyspace: 'shopping' }
);

console.log(cassandra_client)

export default cassandra_client

