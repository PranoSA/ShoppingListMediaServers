Index=$1
Elastic_User=$2
Elastic_Password=$3

curl -X PUT -k "https://localhost:9200/$1?pretty" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "groupid" : {
        "type" : "keyword",
        "doc_values" : "false"
      },
      "messageid" : {
         "type": "keyword"
      },
      "author" : {
        "type" : "keyword",
        "index" : "false"
      },
      "created_at": {
        "type":   "date"
      },
      "content": {
        "type" : "text"
      }
    }
  }
}
' -u "$2:$3"
