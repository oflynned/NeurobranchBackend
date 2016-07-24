import datetime
import random
import sys
import time
from urllib import urlencode
from urllib2 import Request, urlopen

from loremipsum import *


def get_random_dates(start, end):
    return long((end * random.random()) + start)


def format_time(input_time):
    return datetime.datetime.fromtimestamp(input_time / 1000).strftime('%H:%M:%S %d-%m-%Y')


def random_name():
    lines = open('names.txt').read().splitlines()
    return random.choice(lines)


dest = str(sys.argv[1])
iterations = int(sys.argv[2])

print str(dest)
print str(dest) == "local"
print str(dest) == "aws"

if str(dest) == "local":
    url = 'http://localhost:80/insert'
else:
    url = 'http://ec2-54-229-150-246.eu-west-1.compute.amazonaws.com/insert'

trial_type = ['pharma', 'biodevice', 'food', 'behavioural']
organisations = ['Trinity College Dublin', 'University College Dublin', 'Dublin City University',
                 'University College Cork', 'University of Limerick',
                 'Royal College of Surgeons Ireland', 'Beaumont Hospital', 'Bon Secours Hospital',
                 'Mater Misercordiae University Hospital', 'Coombe Women\'s Hospital', 'The Rotunda Maternity Hospital',
                 'Adelaide and Meath Hospital, Dublin, incorporating the National Children\'s Hospital']

ONE_MONTH = long(1000 * 60 * 60 * 24 * 30 * 6)
current_time = long(time.time() * 1000)

if url is not None:
    if iterations > 0:
        for i in range(0, iterations):
            post_fields = {
                'trialname': get_sentence(),
                'description': get_paragraph(),
                'trialtype': random.choice(trial_type),
                'researcher': {
                    'researchgroup': i,
                    'researchername': random_name() + ' ' + random_name()
                },
                'organisation': random.choice(organisations),
                'specialisation': 'test',
                'starttime': long(time.time() * 1000),
                'endtime': get_random_dates(current_time, ONE_MONTH),
                'timerperiodfrequency': i,
                'notificationfrequency': i,
                'imageresource': 'http://placehold.it/500x250/EEE',
                'prerequisites': {
                    'minage': int(random.random() * 100),
                    'condition': 'test',
                    'prereqtype': 'test'
                }
            }
            # print json.dumps(post_fields, indent=4)
            print url
            request = Request(url, urlencode(post_fields).encode())
            json = urlopen(request)
            print(str(i + 1) + "/" + str(iterations) + " completed")
    else:
        print "iterations not well defined"
