from pymongo import MongoClient
from lxml import html
from time import sleep
from threading import Thread
from HTMLParser import HTMLParser
from BeautifulSoup import BeautifulSoup

import json
import sys
import datetime
import requests

client = MongoClient()
db = client.sg
posts = db.posts

# init them all
#for p in posts.find():
#	now= datetime.datetime.now()
#	result = db.posts.update_one({'_id': p["_id"]}, {'$set': {'update_date': now}})

# Give the post id, get an array of comments. Esay. Simple. awesome.
def getCom(pid):
	url = "http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b&url=http://9gag.com/gag/"+pid+"&count=10&level=2&order=score&mentionMapping=true&origin=9gag.com"
	r = requests.get(url)
	r.encoding = 'utf-8'
	comments= json.loads(r.text)["payload"]["comments"]
	return comments

counter = 0
for p in posts.find().sort("update_date",1):
	coms = getCom(p["post_id"])
	now= datetime.datetime.now()
	print counter
	counter+=1
	result = db.posts.update_one({'_id': p["_id"]}, {'$set': {'update_date': now, 'bestcomments':coms}})
