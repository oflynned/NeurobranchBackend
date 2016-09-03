import pymongo
from datetime import datetime


client = pymongo.MongoClient()
db = client.neurobranch_db
db.requestedcandidates.insert(
    {
		"trialid":"57c84cbdaa16e708285b9985",
        "users": str(datetime.utcnow())
    }
)
