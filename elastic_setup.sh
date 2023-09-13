Index=$1
Elastic_User=$2
Elastic_Password=$3

curl -X PUT -k "https://localhost:9200/$1?pretty" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "chat_id" : {
        "type" : "keyword",
        "doc_values" : "false"
      },
      "message_id" : {
         "type": "unsigned_long"
      },
      "sender" : {
        "type" : "keyword",
        "index" : "false"
      },
      "sent": {
        "type":   "date",
        "format": "yyyy-MM-dd"
      },
      "content": {
        "type" : "text"
      }
    }
  }
}
' -u "$2:$3"
