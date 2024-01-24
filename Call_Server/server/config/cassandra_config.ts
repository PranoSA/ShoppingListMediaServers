interface CassandraConfiguration  {
    [key:string] : {
        contactPoints : string[]
    }
}

const Cassandra_Config:CassandraConfiguration = {
    "DEVELOPEMENT" : {
        contactPoints : ["127.0.0.1"]
    }
}

export default Cassandra_Config