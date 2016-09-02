import pymongo
client = pymongo.MongoClient()
db = client.neurobranch_db
db.candidateaccounts.insert(
    {

            "password":"xxxxxx",
            "email":"1@1.com",
            "isverified":"no",
            "userid":"1"
    }
)

