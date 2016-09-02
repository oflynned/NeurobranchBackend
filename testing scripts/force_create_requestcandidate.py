import pymongo
client = pymongo.MongoClient()
db = client.neurobranch_db
db.requestedcandidates.insert(
    {
		"trialid":"57c84cbdaa16e708285b9985",
        "users": [
            {
            "userid": "1"
            },
            {
            "userid": "2"
            },
            {
            "userid": "3"
            },
            {
            "userid": "4"
            }]
    }
)
