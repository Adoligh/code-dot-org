---
title: Thanks for signing up to host an Hour of Code!
layout: wide

social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg"
  "og:image:width": 1705
  "og:image:height": 949
  "og:url": "http://<%=request.host%>"
  "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg"
  "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
  "twitter:player:width": 1920
  "twitter:player:height": 1080
---
<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Thanks for signing up to host an Hour of Code!

**EVERY** Hour of Code organizer will receive a prize as a thank you. 2015 Hour of Code organizer prizes will be announced in the fall! <a href="<%= hoc_uri('/prizes') %>">See last year's prizes.</a>

## 1. Spread the word 
Tell your friends about the #HourOfCode. 

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Ask your whole school to offer an Hour of Code
<a href="<%= hoc_uri('/resources#email') %>">Send this email</a> to your principal to encourage every classroom at your school to sign up. 

## 3. Ask your employer to get involved
<a href="<%= hoc_uri('/resources#email') %>">Send this email</a> to your manager or the CEO. 

## 4. Promote Hour of Code within your community
Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Ask a local elected official to support the Hour of Code
<a href="<%= hoc_uri('/resources#politicians') %>">Send this email</a> to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>
