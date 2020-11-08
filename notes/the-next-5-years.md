---
tags: Hope
---
# WIP: Hope, the next 5 years 

What can we build in the next 5 years to get closer to that 10 year and 30 year vision of [A New Hope](https://hackmd.io/kafpxBeqQua_rcrncP14tQ)?

A [Universal Application Environment](https://hackmd.io/kafpxBeqQua_rcrncP14tQ#Selfunderstanding-API%E2%80%99s) will be tricky. By starting with the browser as the prototype for this, we may focus too much on current technogy. However we need some starting point to get to [Universal Documents](https://hackmd.io/kafpxBeqQua_rcrncP14tQ#Selfunderstanding-Documents) and [Universal API](https://hackmd.io/kafpxBeqQua_rcrncP14tQ#Selfunderstanding-API%E2%80%99s)'s.

So for the next 5 years, we'll use the browser as the bootstrap for a prototype UAE.

[Meaningful Data](https://hackmd.io/kafpxBeqQua_rcrncP14tQ#Meaningful-Data) is something that a lot of people have been working on for a long time. I don't see a direction that will speed this up. So let's not focus on this, and just use the tools available now. [Solid](https://solidproject.org/) and [Linked Data](https://en.wikipedia.org/wiki/Linked_data) should certainly be a part of that.

[Universal API](https://hackmd.io/kafpxBeqQua_rcrncP14tQ#Selfunderstanding-API%E2%80%99s)'s are also a tough problem. API's are consumed by client software that can run in any and all environments. Supporting them all is impossible, I think. So picking just one is probably the best bet, for a first version. If we see WebAssembly (WASM) as a converging technology, then supporting Node.js (or Deno) looks like a good fit. But there is still a lot of research necessary, and Universal API's are not visible or sexy.

Instead I think we should focus on [Universal Documents](https://hackmd.io/kafpxBeqQua_rcrncP14tQ#Selfunderstanding-Documents). Here we have a clear winner in which environment to support: the web browser. It already has most of the features that we need. There is a lingua franca, javascript (or Web Assembly). There is a good security system in place, to allow untrusted code to run. There is a way to compose documents from seperate parts, using iframes or portals (Chrome experimental). These may be a bit clunky, but I think there's enough there to build on it.

## A Universal Document Showcase

So what can we make that will really showcase the vision?

Let's look at what there is today, and what people are already working on. And what people have tried in the past.

Combining or composing documents from separate parts is not new. Microsoft has done this with [OLE (Object Linking and Embedding)](https://en.wikipedia.org/wiki/Object_Linking_and_Embedding). Then there was [CORBA](https://en.wikipedia.org/wiki/Common_Object_Request_Broker_Architecture). I think these are examples of what not to do. 

OLE is limited in that it doesn't traverse the internet. You need to package all files together, so you need to own all content. I think we should strive for permissionless composing. Anyone should be able to include any other document, without asking permission. I'm purposely not thinking about copyright. This is a seperate problem, which I think should probably be solved on a non-technical level.

CORBA does support linking over the internet. But it does so using a completely seperate technology stack, which is far from simple to build or support. It is too complex, if we want everyone to embrace the Universal Document system.

The web supports composing documents, using all kinds of embedding and linking strategies. Each of these is conceptually simple and widely used. So I'm gravitating towards copying one or more of these. The simplest and most secure option looks to be iframes. This is not enough, but we can build on it.

However, linking to other documents on the current web is brittle. The average lifespan of a link, before it becomes broken, is about [100 days](http://brisray.com/web/linkrot.htm). That's not a good foundation to build on.

But IPFS is specifically being build to combat this (and a lot of other concerns.) For our showcase we could start with only supporting IPFS url's. And we could make sure that any document linking to another, pins the content it is linking to. Pinning is making sure that a copy of the content is 'seeded' to the underlying peer to peer network. Basically you assign space on a server location you own to serve the content.

Now we know for sure, that as long as we are serving a document, all the links in it will be available as well. There is some work to be done here, because in theory you would need to go into all the linked documents and then pin everything they are linking to as well. This might get expensive quickly. But for our showcase, this should be limited. We can probably do some deduplication of pins.

That takes care of the linking and composing of documents. What can we build in the next few years, that uses that technology for something new. Something that isn't possible today. And something that people will want to use.

## Xanadu Lite

Ok, maybe the name needs to change. But let's say there was a tool that allows you to create multimedia documents, documents that may contain interactive parts. Documents that you could link and embed, even if the target document isn't yours, without copying.

Any document could serve as the basis for a new, and you can annotate and remix it in any way you like.

Any document is just a starting point to browse. Whenever a quote is used from another document, you can instantly switch to the other document. You can also keep these documents side by side, and see the links between them.

Links are never broken. They may link to versions of a document that has been superceded by one or more new versions. If so you can list newer versions, or older if you want to. There is no guarantee that all versions of a document are still available. Only if some other document links to that version.

You can bookmark not just an entire document, but any part of a document. And a bookmark need not be just a link, it may quote any part of it. And the quote need not be text, it can also be data, or part of a movie or an audio recording.

When composing your own document, these bookmarks can be used to quickly link or embed content from other documents.

If you quote data, by default it will use the visualization that is in the original document. But you can also create your own visualization and use that on the quoted data. These visualizations may be interactive. Even the data itself can be made interactive, using the quoted data as a starting point to ask what-if questions. For an example of what is possible, take a look at [Explorable Explanations](http://worrydream.com/ExplorableExplanations/), by [Bret Victor](https://en.wikipedia.org/wiki/Bret_Victor).

If we build this right, documents are no longer a wordprocessing document, or a spreadsheet, or a presentation. The document is active and interactive. It should become a category of its own that encompasses all other existing document types. Most importantly, a universal document should confidently drop the paper metaphor that we are so used to today. There is no need for any documents to be expressable on printed paper in this century. 

## Will people come?

There is an audience for a solution like this. Just look at [medium.com](https://medium.com/), [substack.com](https://substack.com/) or [observablehq.com](https://observablehq.com/). And if the user interface is simple enough, and the tool is powerful enough, we may get the interest of anyone who has ever used an office suite. But I think popularity shouldn't be the goal. We're on a 30 year mission to improve the world, remember? Yet, if we're building something that nobody notices, than we should carefully consider if we are on the right track.
