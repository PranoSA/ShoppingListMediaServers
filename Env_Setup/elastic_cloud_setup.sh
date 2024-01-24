Index=$1
Elastic_User=$2
Elastic_Password=$3
Elastic_Cloud=$4

# Messageid and Groupid should be changed to keyword instead of text in the future

curl -X PUT -k "https://$4/$1?pretty" -H 'Content-Type: application/json' -d'
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
