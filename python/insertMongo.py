from pymongo import MongoClient
from lxml import html
from time import sleep
from threading import Thread

import datetime
import requests
import sys
import json

def getCom(pid):
	url = "http://comment-cdn.9gag.com/v1/cacheable/comment-list.json?appId=a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b&url=http://9gag.com/gag/"+pid+"&count=10&level=2&order=score&mentionMapping=true&origin=9gag.com"
	r = requests.get(url)
	r.encoding = 'utf-8'
	comments= json.loads(r.text)["payload"]["comments"]
	#print comments
	return comments

def insertPost(posts,post_id,title,url,post_url,nbpoints,nbcomment,post_type):
	mydate=datetime.datetime.now()
	if(posts.find({"post_id":post_id}).count()==0):
		coms = getCom(post_id)
		result = posts.insert_one({"post_id":post_id, "title":title, "url":url,"post_url":post_url, "nbpoints":nbpoints,"nbcomment":nbcomment,"bestcomments":coms, "insert_date":mydate, "update_date":mydate, "post_type":post_type })
		print "INSERTED NEW POST"
		return True
	else:
		#print "Nothing..."
		return False


def getNewArticle(URL,counter,posts):
	continu= True
	page1 = requests.get(URL)
	tree = html.fromstring(page1.content)
	articles = tree.findall('.//article')
	for a in articles:
		post_id=a.get("data-entry-id")
		post_url= a.get("data-entry-url")
		title=a.find("./header/h2/a", { "class" : "badge-evt badge-track" }).text.strip()
		nbpoints= a.get("data-entry-votes")
		nbcomment= a.get("data-entry-comments")
		img = a.findall("./div/a/img", { "class" : "badge-item-img" })
		if len(img)>0: # Pour ne garder que les images, pas de GIF/video/longpost
			url=img[0].get("src")
			counter+=1
			#print "Picture",url
			continu = insertPost(posts,post_id,title,url,post_url,nbpoints,nbcomment,"image")
		videos = a.findall("./div/a/div/video")
		if len(videos)>0:
			url=videos[0].getparent().get("data-mp4")
			continu = insertPost(posts,post_id,title,url,post_url,nbpoints,nbcomment,"video")
			counter+=1
			#print "GIF",url
	links= tree.findall('.//div/a', { "class" : "btn badge-load-more-post"})
	for l in links:
		if (l.get("class")=="btn badge-load-more-post"):
			next="http://9gag.com"+l.get("href")
			return (continu,next,counter)

def getAllArticles():
	client = MongoClient()
	#client = MongoClient("mongodb://mongodb0.example.net:27017")
	db = client.sg
	posts = db.posts
	#print page1.content
	counter = 0
	link="http://9gag.com/hot"
	continu = True
	while continu:
		(continu,link,counter)= getNewArticle(link,counter,db.posts)

def threaded_function(arg):
	def executeSomething():
		getAllArticles()
		sleep(60)
	print "Starting Hot Scan"
	while True:
		executeSomething()


collectHotThread = Thread(target = threaded_function, args = (10, ))
collectHotThread.start()

#getAllArticles()
		
