import datetime
import random
import sys
import time
from urllib import urlencode
from urllib2 import Request, urlopen
from datetime import datetime

url = 'http://localhost:3000/api/create-requested-candidate'
iterations = int(sys.argv[1])

def create_candidate_account():
    for i in range(iterations):
        post_fields = {
                'trialid': "57c84cbdaa16e708285b9985",
                'userid': str(datetime.utcnow())
            }
        request = Request(url, urlencode(post_fields).encode())
        json = urlopen(request)
        print(str(i+1) + "/" + str(iterations) + " completed.")

create_candidate_account()

"""
if url is not None:
    if iterations > 0:
        if creation_type == "create_user_acc":
            create_candidate_account()
    else:
        print("iterations not well defined")
"""