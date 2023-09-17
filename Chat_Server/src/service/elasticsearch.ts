import express, { Request, Response, NextFunction } from 'express';
const { Client } = require('@elastic/elasticsearch')
import Config from "../config"
import fs from 'fs'
const cassandra = require('cassandra-driver');
import { Client as CassandraClient, types as CassandraTypes } from 'cassandra-driver'
import { time } from 'console';
import { estypes } from '@elastic/elasticsearch'

CassandraTypes.TimeUuid.now()


const Environment: string = process.env.ENVIRONMENT || "DEVELOPMENT"

const CAPath: string = process.env.ELASTICSEARCH_CA || "./http_ca.crt"

const elasticsearch_client = new Client({
    nodes: Config[Environment].ELASTICSEARCH_HOST, // Elasticsearch endpoint
    auth: {
        username: process.env.ELASTICSEARCH_USER,
        password: process.env.ELASTICSEARCH_PASSWORD,
    },
    tls: {
        // might be required if it's a self-signed certificate
        rejectUnauthorized: Config[Environment].Require_CA_Certification,
        ca: fs.readFileSync(CAPath),
    }
})


export default elasticsearch_client