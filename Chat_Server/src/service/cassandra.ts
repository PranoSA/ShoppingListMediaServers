import express, { Request, Response, NextFunction } from 'express';
const { Client } = require('@elastic/elasticsearch')
import Config from "../config"
import fs from 'fs'
const cassandra = require('cassandra-driver');
import { Client as CassandraClient, types as CassandraTypes } from 'cassandra-driver'
import { time } from 'console';

CassandraTypes.TimeUuid.now()

//http://localhost:9042

const cassandra_client = new CassandraClient(
    { contactPoints: ['127.0.0.1'], localDataCenter: 'datacenter1', keyspace: 'shopping' }
);

export default cassandra_client

