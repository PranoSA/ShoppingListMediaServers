

type Configuration = {
    ELASTICSEARCH_HOST: string[];
    Require_CA_Certification: boolean;
    Elastic_Cloud : boolean, 
    Cloud_ID : string|null,
    Offset_limit: number,
    Cassandra_Host: string[]
}

const Config: { [key: string]: Configuration } = {
    "DEVELOPMENT": {
        ELASTICSEARCH_HOST: ["https://localhost:9200"],
        Require_CA_Certification: false,
        Elastic_Cloud : true, 
        Cloud_ID : process.env.ELASTIC_CLOUD_ID||null,
        Offset_limit: 100,
        Cassandra_Host : ["127.0.0.1"] //Contact Points
    },
    "STAGING": {
        ELASTICSEARCH_HOST: ["https://localhost:9200"],
        Require_CA_Certification: true,
        Elastic_Cloud : false,
        Cloud_ID : process.env.ELASTIC_CLOUD_ID||null,
        Offset_limit: 50,
        Cassandra_Host : [""]
    },
    "PRODUCTION": {
        ELASTICSEARCH_HOST: ["https://localhost:9200"],
        Require_CA_Certification: true,
        Elastic_Cloud : false,
        Cloud_ID : process.env.ELASTIC_CLOUD_ID||null,
        Offset_limit: 25,
        Cassandra_Host : [""]
    }
}

export default Config 