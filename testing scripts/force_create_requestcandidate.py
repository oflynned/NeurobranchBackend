import pymongo
from datetime import datetime


client = pymongo.MongoClient()
db = client.neurobranch_db
db.requestedcandidates.insert(
    {
		"trialid":"57c954ea02dacee2178269c6",
        "users": str(datetime.utcnow())
    }
)
