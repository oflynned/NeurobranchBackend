import pymongo
client = pymongo.MongoClient()
db = client.neurobranch_db
db.requestedcandidates.insert(
    {
		"trialid":"57c05a111d34acd4b3e6c7f5",
        "users": [
            {
            "password": "passowrd1",
            "email": "andrew@email.com",
            "isverified": "no"
            },
            {
            "password": "passowrd2",
            "email": "ben@email.com",
            "isverified": "no"
            },
            {
            "password": "passowrd3",
            "email": "charlie@email.com",
            "isverified": "no"
            },
            {
            "password": "passowrd4",
            "email": "derek@email.com",
            "isverified": "no"
            }]
    }
)

