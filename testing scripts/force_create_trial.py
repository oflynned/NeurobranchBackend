import datetime
import random
import sys
import time
from urllib import urlencode
from urllib2 import Request, urlopen

from loremipsum import *

trial_type = ['pharma', 'biodevice', 'food', 'behavioural']
organisations = ['Trinity College Dublin', 'University College Dublin', 'Dublin City University',
                 'University College Cork', 'University of Limerick',
                 'Royal College of Surgeons Ireland', 'Beaumont Hospital', 'Bon Secours Hospital',
                 'Mater Misercordiae University Hospital', 'Coombe Women\'s Hospital', 'The Rotunda Maternity Hospital',
                 'Adelaide and Meath Hospital, Dublin, incorporating the National Children\'s Hospital']

ONE_MONTH = long(1000 * 60 * 60 * 24 * 30 * 6)
current_time = long(time.time() * 1000)

url = 'http://localhost:3000/debug/create-candidate'
#dest = str(sys.argv[1])
#creation_type = str(sys.argv[2])
iterations = int(sys.argv[1])


def get_random_dates(start, end):
    return long((end * random.random()) + start)


def format_time(input_time):
    return datetime.datetime.fromtimestamp(input_time / 1000).strftime('%H:%M:%S %d-%m-%Y')


def random_name():
    lines = open('names.txt').read().splitlines()
    return random.choice(lines)


def create_candidate_account():
    for i in range(0, iterations):
        post_fields = {
            'email': "99@email.com",
            'password': str(i)
        }
        print(url)
        request = Request(url, urlencode(post_fields).encode())
        json = urlopen(request)
        print(str(i + 1) + "/" + str(iterations) + " completed")


create_candidate_account()

"""
if url is not None:
    if iterations > 0:
        if creation_type == "create_user_acc":
            create_candidate_account()
    else:
        print("iterations not well defined")
"""