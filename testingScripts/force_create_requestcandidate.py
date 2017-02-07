import pymongo
from datetime import datetime


client = pymongo.MongoClient()
db = client.neurobranch_db
db.requestedcandidates.insert(
    {
		"trialid":"57def0756a7149335abdc1d3",
        "users": str(datetime.utcnow())
    }
)
