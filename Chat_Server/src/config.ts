

type Configuration = {
    ELASTICSEARCH_HOST: string[];
    Require_CA_Certification: boolean;
    Offset_limit: number
}

const Config: { [key: string]: Configuration } = {
    "DEVELOPMENT": {
        ELASTICSEARCH_HOST: ["http://localhost:9200"],
        Require_CA_Certification: false,
        Offset_limit: 100,
    },
    "STAGING": {
        ELASTICSEARCH_HOST: ["http://localhost:9200"],
        Require_CA_Certification: true,
        Offset_limit: 50,
    },
    "PRODUCTION": {
        ELASTICSEARCH_HOST: ["http://localhost:9200"],
        Require_CA_Certification: true,
        Offset_limit: 25,
    }
}

export default Config 