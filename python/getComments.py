import zerorpc
import json
import requests

from lxml import html
from HTMLParser import HTMLParser
from BeautifulSoup import BeautifulSoup
from time import sleep

#sudo pkill python
#netstat -ltnp

class HelloRPC(object):
	def getCom(self, post_id):
		pid=post_id
		#pid="a7ZXLd2" #test
		#h = HTMLParser()
		url = "http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b&url=http://9gag.com/gag/"+pid+"&count=10&level=2&order=score&mentionMapping=true&origin=9gag.com"
		r = requests.get(url)
		r.encoding = 'utf-8'
		#print r.encoding
		#comments= json.loads(BeautifulSoup(r.text,convertEntities=BeautifulSoup.HTML_ENTITIES))["payload"]["comments"]
		comments= json.loads(r.text)["payload"]["comments"]
		return comments

s = zerorpc.Server(HelloRPC())
s.bind("tcp://0.0.0.0:4242")
s.run()

