import Redis_Config from "../config/redis_config";

import redis from 'redis';

const Environment = process.env.ENV || "DEVELOPMENT"

const Config = Redis_Config[Environment];

const client = redis.createClient({
    username : Config.user,
    url: `redis://${Config.user}:${Config.password}@${Config.host}:${Config.port}`
})

await client.connect();

export default client 