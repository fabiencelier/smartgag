from pymongo import MongoClient
import datetime
from lxml import html
import requests
from time import sleep
import sys
from threading import Thread


client = MongoClient()
db = client.sg
userdatas = db.userdatas
posts = db.posts

L = []
for p in posts.find():
	L.append({"id":p["_id"], "address":p["post_url"], "score":int(p["nbpoints"])})

result = db.userdatas.update_one({'name': "fabien"}, {'$set': {'postlist': L}})
#print L
