import datetime
import random
import sys
import time
import urllib
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
    url = 'http://localhost:3000//api/get-responses/trialid/:trialid'
else:
    url = 'http://ec2-54-229-150-246.eu-west-1.compute.amazonaws.com/insert'
question_type = ['Text', 'Checkbox', 'Radio', 'Scale']


ONE_MONTH = long(1000 * 60 * 60 * 24 * 30 * 6)
current_time = long(time.time() * 1000)

if url is not None:
    if iterations > 0:
        for i in range(0, iterations):
            post_fields = {
                'title': get_sentence(),
                'question_type': random.choice(question_type),
                'index': i,
                'trialid': '589766a2116532825c0a0dd8',
                '__v': 0,

                'answers':[
                    {
                        'answer': get_sentence()
                    },
                    {
                         'answer': get_sentence()
                    }

                ]


            }
            # print json.dumps(post_fields, indent=4)
            print url
            request = Request(url, urlencode(post_fields).encode())
            json = urlopen(request)
            print(str(i + 1) + "/" + str(iterations) + " completed")
    else:
        print "iterations not well defined"

