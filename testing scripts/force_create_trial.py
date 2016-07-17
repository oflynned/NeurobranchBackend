from urllib.parse import urlencode
from urllib.request import Request, urlopen

url = 'http://localhost:3000/insert'

for i in range(0, 1000000):
	post_fields = { 'trialname': i, 'trialid': i, 'description': i, 'trialtype': i, 'researcher': { 'researchgroup': i, 'researchername': i }, 'organisation': i, 'specialisation': i, 'starttime': i, 'endtime': i, 'timerperiodfrequency': i, 'notificationfrequency': i, 'imageresource': i, 'prerequisites': { 'minage': i, 'condition': i, 'prereqtype': i } }
	request = Request(url, urlencode(post_fields).encode())
	json = urlopen(request).read().decode()
	print(str(i) + " completed")
