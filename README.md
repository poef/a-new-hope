---
tags: Start,Hope 
---
# A New Hope

Hello, my name is Auke, 48 years old and I've been building software, mostly web related for a long time. 

As anyone doing this for any time will tell you, the work is rotten. Programming sucks. API's are inconsistent. Standards proliferate and are incorrectly implemented. And in general everything is more complex than it should be. And that is just from a programmers perspective. At least I can generally understand how stuff works. How other people cope with the mess we made of the web and software in general, I can only imagine.

While contemplating my life choices I was re-introduced to [Alan Kay](https://en.wikipedia.org/wiki/Alan_Kay), specifically this talk: [Alan Kay, 2015: Power of Simplicity](https://www.youtube.com/watch?v=NdSD07U5uBs). In it he succinctly explains how to invent the future. As someone who has done just that in the 1970's at [Xero PARC](https://en.wikipedia.org/wiki/PARC_(company)) (Palo Alto Research Center), he speaks from experience.

The main point Alan makes is that to invent the future you must first imagine it, and you must do so further into the future then you might think. At Xerox PARC they imagined a future about 30 years into the future. Then they asked themselves what things would then be absolutely possible or even common, that today is impossible. Then extrapolate from those things to something that might be possible in about 10 years. Then set a target, and set out to achieve that target in about 5 years. Don't try and slice it up any further, do not expect any deliverables before the 5 years are done. Although he suggests that if you aim for 5 years, you will probably achieve your goal earlier, in about 3 years. Then take a year to reorient and do another 5 years. And in about 7 years you will have changed the world.

So, here I am, trying to change the world since 1994, or at least the part I love, the web. Its 2020, 26 years with no real progress. Can I do better? Can we do better?

Let's follow Alan Kays strategy, and try and imagine the world 30 years from now. What would definitely, absolutely be fixed by then. I'll try and imagine a future where the web is everything it can and should be. I'll leave out the flying cars.

## The web in 2050

In 2050 the web is everywhere. All communication takes place on it or through it. It is not just a web of text-like content, all information in all formats form part of it. 

Information is not static. Documents are live, contain interfaces to manipulate stuff inside, render to different views or even different devices. There is no need to install a specific application to view or interact with information, that is all done automatically. There is no concept of an application or app anymore. All information contains all the tools and user interface stuff needed to work with it.

All information can link to all other information. Links will not disappear, a link is forever, or at least as long as the link is in use. Information can be re-used, re-mixed by anyone. I'm hoping we found a different solution to compensate creators than copyright, by then.

There is no concept of a personal computer where all your data lives. Instead everyone has access to personal parts of the web, where all your own information lives. You can grant access to it to everyone or anyone, to share or collaborate. All information can be accessed through any number of devices. If you allow it, devices sense you are near them, in range to interact. And if not locked down, these devices will allow you to use them. Think of screens and camera's attached to the walls of every room in your house, in cars or whatever form of personal transportation we may have then (see, I didn't mention flying cars there, oh.)

Your information is always safe, it won't get lost unless you specifically delete it. When you make changes to some information, the older versions of that information will still be available, if you need them.

Datasets are just another form of information. So there is no longer a concept of an API that you must program to connect with. Instead the ability to work with the dataset is built into it. All you need to is link to it and manipulate the data to get the insights and visualizations that you want.

All data is labeled clearly and explicitly so the meaning of every part of the data is clear. And all data is live, but you can request older versions if you need it. And like any other kind of information, data can and will link to other information, including other datasets.

The concept of a website is quaint and antiquated. Everything is just information, and information can be bundled in many different ways. Sure, information you want to share needs an address, some kind of name that is shareable, but it doesn't follow a single technical namespace. My imagination falls a bit short here, but I do know that DNS must die.

Looking forward 30 years is daunting. I'm afraid that what I've written here is not far out enough, we might get here a lot earlier... or never. But the goal is to set a goal that looks unachievable and I think I managed that.

## Extrapolating back to 2030

To pick a point between now, 2020 and 2050, we must understand what we have now, and what the trend is. And it is good to know what developments are under way already.

### Universal Application Environment

HTML will be superseded by something, although it will still exist (I'll come back to this later...) Browsers are becoming a universal application environment already. [Firefox OS](https://en.wikipedia.org/wiki/Firefox_OS) didn't make it, but [Kai OS](https://www.kaiostech.com/) is taking up its mantle. And ofcourse there [Chrome OS](https://en.wikipedia.org/wiki/Chrome_OS). So the browser will become the universal interface. Just take a look at [Office 365](https://en.wikipedia.org/wiki/Office_365) today, or at the preview of what Microsoft calls '[Fluid](https://support.microsoft.com/en-us/office/get-started-with-fluid-preview-d05278db-b82b-4d1f-8523-cf0c9c2fb2df)'. The introduction of [WASM (Web Assembly)](https://webassembly.org/) recently just makes it more inevitable. All other programming will be relegated to low level software, like embedded programming today.

### Selfunderstanding Documents

If there is a universal application environment, then documents can and should contain their own code to display and manipulate them. Alan Kay also advocated this approach. There are security concerns by allowing unknown code to run anywhere, but that's not new. The web has been doing that for more than 20 years, and most of the bugs have been ironed out.

### Persistent Hyperlinks

Persistent links are a problem currently. Most links will break within a few months, either because the content they point to is no longer there, or because it has changed into something completely different. However, there is some hope, projects like [IPFS](https://ipfs.io/) are trying to fix this. If the content you are linking to is published on IPFS, you can simply 'pin' that content and as long as you do, the link won't break. Actually, as long as at least on 'pin' exists for that content, by anyone anywhere, the link won't break.

It also by definition keeps different versions of the same content online, as any change in the content forces it to have a new address or location. If no one pins those versions, the content does disappear. But if it isn't linked, that means nobody is interested in it.

Among the promoters of IPFS are [Brewster Kahle](https://en.wikipedia.org/wiki/Brewster_Kahle), founder of the [Internet Archive](https://archive.org/), and [Vint Cerf](https://en.wikipedia.org/wiki/Vint_Cerf), who co-wrote the original TCP protocol, the foundation of the internet.

### Selfunderstanding API's

Many attempts have been made to standardize API's. [OpenAPI](https://www.openapis.org/) (which used to be Swagger) is one of those. But I believe that this approach is doomed. It is not flexible enough to allow all possible API's to be described so. 

There is a growing market for universal API's, a service where you connect your application to a single API vendor, and through that API you can connect to all kinds of other API's.See for example [xkit.co](//xkit.co). The lure is that you only need to cope with one API's quirks. And as a developer working with API's daily, this is a big lure.

But I think we can do better than that. The current web is a generic client for all kinds of content. And this is possible because the web allows content to include scripts or code that manipulates its environment and can add user interface code or network code.

What if every API sends with it a piece of code that allows you to access the API? There should be some kind of specification on how to interact with this code and it needs to be future proof, so some kind of negotiation between what the client - the user of the API - needs, and the server - the API - provides.

### Meaningful Data

Just having access to the data isn't enough. The data should also carry with its meaning. Sir Tim Berners-Lee has been pushing the [Semantic Web](https://en.wikipedia.org/wiki/Semantic_Web) for years now, specifically to try and fix this. 

The latest effort is called [Solid](https://solidproject.org/), and is not just about the meaning of data, but also about personal control of data. It is an attempt to wrestle control of data back from the service providers and silo's of today. 

To do this, the user should own the data, not an application provider. If you want to be able to switch applications for a given set of data, the data should be in a meaningful format. The current push is for this to be something called '[linked data](https://en.wikipedia.org/wiki/Linked_data)', using stuff like [RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework) or [json-ld](https://json-ld.org/).

If you combine the application code with the data, then part of the necessity for linked data disappears. However, for third party code to interact with the data, you still need something like it. With no other horse in this race, I think I'll bet on this one.

### HTML

I told you I would get back on this one. HTML is a flawed implementation of a flawed concept. But it is everywhere. It will take a colossal improvement for any other format to take over. Still I think its worth a try.

[Ted Nelson](https://en.wikipedia.org/wiki/Ted_Nelson) is the inventor of the term [Hypertext](https://en.wikipedia.org/wiki/Hypertext) and [Xanadu](https://en.wikipedia.org/wiki/Project_Xanadu), the famous predecessor of the Web that never arrived. He is also famously dismissive of the Web, including HTML. The reason for that are varied, but among others he believes that a document markup or formatting system shouldn't be hierarchical. Instead it should be based on the way movies get made, or at least edited. When editing a movie, you have reels and reels of pictures. Today those are all digital, but the concept is the same. The movie is nothing more than a list of parts of different reels, which get spliced together.

This list is called an [EDL (Edit Decision List.)](https://en.wikipedia.org/wiki/Edit_decision_list) The crucial part is that this list is seperate from the source material. It doesn't in itself change the source footage, it just links to it.

In contrast, HTML contains markup mixed up with the content, the source material. What difference does this make? Well, there's quite a list. But think of a HTML document, how would you go about changing the markup for such a document, if you are not the owner of the source? If you had a solution using an EDL this would be simple. Just create a new EDL and link it to the source. 

Nobody needs that? Think again, this is a serious problem in the humanities and social sciences, specifically literature. There are many different ways to analyze a piece of writing. In general you want to annotate a piece of text in multiple ways, by intent, by emotion, by speaker, etc. And those annotations overlap, which, by the way, HTML also can't do.

HTML is also famously difficult to use in a WYSIWYG (What-You-See-Is-What-You-Get) editor. So much so that all the best HTML editors today use an intermediate format while editing. Then they render that to HTML to display it in a browser.

All these problems go away if you switch to an EDL style markup, using annotations that link to the source, but aren't part of the source.

Unfortunately there are no usable implementations of an EDL style document markup language. So I made one myself, called [Cobalt](https://github.com/poef/cobalt/). Far from finished, but it shows the concept. I've been using it to research the implications of using an EDL markup language. You can take a look at an early prototype called [Hope](http://poef.github.io/hope/).

That prototype is called Hope, but it is clearly too small a vision. That's why I'm trying to look a bit further now and start to work on a New Hope.
(Sorry about that pun, I couldn't resist.)

I am setting up a github repository to collect research, work by others and experiments that align with this vision. If you are interested in this, I hope you will want to work with me on getting there. If you think I'm missing something important, or even worse, have set the goals incorrectly, by all means comment.

November 8th, 2020\
Auke van Slooten\
auke@muze.nl\
https://github.com/poef/

PS. I do have a Backronym for Hope, maybe it'll stick: Hypermedia Object Programming Environment.

## Read more

- [WIP: Hope, the next 5 years](/UC8VsRHHTlqY9eepGBbSnQ)
- [WIP: Cobalt and universal documents](/zyVnPfOORWm0yrb8bakjew)
- [WIP: Universal Application Environment](/2c2ebksJRWaE-eusDYC0Pg)
- [WIP: Versioned Universal Documents](/Ht3SXZ-8Ttmapm9liteQRQ)
- [Interesting Links](/beVS8KuiTTKFVPeLD4-t-A)