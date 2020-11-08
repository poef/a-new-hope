---
tags: Hope
---
# WIP: Cobalt and universal documents

[Cobalt](https://github.com/poef/cobalt/) is an attempt to write a markup language the way Ted Nelson suggests - using an [Edit Decision List (EDL)](https://en.wikipedia.org/wiki/Edit_decision_list). It is an evolution from an earlier attempt, called [Hope](https://poef.github.io/hope/). I've worked on this of and on for about 8 years. Hope is in fact in use, as the core of [SimplyEdit](https://simplyedit.io), which is a product my company makes.

A cobalt document currently is a combination of different documents, glued together using mime encoding. There is no way to interpret this format unless you already know the format. However in ['A New Hope'](https://hackmd.io/kafpxBeqQua_rcrncP14tQ) I stated that in the future all documents (or all information) will not need an application or specific code to interpret it. Just like the web today, all information should come with all the code that it needs to display and interact with it.

To do this there must be some universal application environment. For now I'm going to assume that this is a web browser. In that case the format of any document should start with the code that helps render, manipulate and interpret it. There is a simple way to do that for any HTML document:

```
<script src="https://example.com/document.js"></script>
```

Any web page can include a piece of javascript, that will run when you view the page. For this process I will disregard situations where javascript is disabled.

So lets redefine a universal document to start with a line that gets interpreted by the browser as a script tag. The remainder of the document may then follow any format, as long as the javascript linked in it can read it.

In the case of a cobalt document, the content could still be mime encoded, but it should not rely on that. Instead a more general solution is to include the annotations and a link to the source document. This way you can annotate any document.

```
<script src="//baf...hwq.ipfs.dweb.link/cobalt.js"></script><!--
link rel="target" href="//QmT5...CxX.ipfs.dweb.link/content.txt"
link rel="stylesheet" href="//QmT5...CxX.ipfs.dweb.link/style.css"
--
0-43:h3
45-139:p
116-126:a href="http://en.wikipedia.org/wiki/Ted_Nelson"
141-368:p
205-213:a href="http://en.wikipedia.org/wiki/Project_Xanadu#Original_17_rules"
371-683:p
441-464:a href="http://blog.codinghorror.com/what-you-cant-see-you-cant-get/"
```

I've linked the code using an [IPFS gateway](https://docs.ipfs.io/how-to/address-ipfs-on-web/#http-gateways), since that technology allows for stable links.
Note: we're using the subdomain gateway style links, so that we still get [origin-based security](https://en.wikipedia.org/wiki/Same-origin_policy).

I've linked the content using IPFS as well, and I can get away with that, since the IPFS link is guaranteed to always return the exact same content. There is no way for the annotations to get out of sync with the content.

The easy way to implement this is to assume that a document is always run inside an iframe in a webbrowser. But relying to much on the current browser implementations will make this solution brittle and difficult to use in any other context. Some kind of abstraction of the Universal Application Environment is needed.

Assuming all content will be including in a square iframe is also incorrect. If I include (or transclude) a quote from another document, I want to be able to do this inline, following the flow of the parent document. Since we can't do both at the same time, this is a decision that the author of the parent document should make. However, injecting live code inside an existing document is unsafe and will lead to conflicts or even abuse.

So the best direction I can think of now is to always include references in a new iframe. But allow for a way to get a specific piece of content, without code, using the iframes postMessage api. So when you include a quote inline, the whole target document is loaded in a hidden iframe and then de parent document uses the postMessage api to request a specific part of the content, in a format that it understands. So it needs a kind of content negotiation as well.

If you include the whole target document, you can simply show the iframe. The location to inject the iframe can be specified through a cursor location. You should also be able to specify if you want the iframe to grow to the full size of the child document, or if you want to limit its size to something else. e.g:

```
116:include-inline href="//QmT5...CxX.ipfs.dweb.link/ted-nelson-hypertext.cobalt"
213:include href="//QmT5...CxX.ipfs.dweb.link/xanada-rules.cobalt" class="medium-box"
```

I would also like to be able to connect different included documents together. For example, I might want to include a dataset, which may have a default rendering, but one that I don't like. Instead I also include another document, which only contains code to render some data, but no data itself. In my parent document I then connect the dataset to the render document and show a different visualization of the dataset.

There is a risk that the visualization code will become out of step with the dataset. For example the dataset is a live url, so each time you fetch it it may change. One such change removes a property that the visualization depends on, or renames it. One way to combat this is to use linked data. The visualization can then link on the concept instead of the exact name and location of the property.

One thing the system must avoid is to expose classes between different documents. Only pure data, without code, may pass between different documents. The approach using iframes and postMessage makes this unavoidable anyway, but it is good to be explicit. The only communication between seperate documents is through messages. Messages by definition do not contain code. Messages also don't change after they are sent. You can send a new message, but earlier ones are gone.

Another pitfall is privacy. Ted Nelson suggests that links should be two-way. The target document should be aware of the parent documents linking to it. This may be unwelcome. There are many situations where an author doesn't want it known that he or she is linking to a document. So this should again be optional. The default is to keep the target unaware, so there is no communication with the parent document from which any information may be gleaned. An active document can still run code, as it should. It should also be able to connect to other documents, if it needs those. Sometimes this also may be unwelcome. The parent document should be able to sandbox the target document, so that it cannot access any external resources. This is excepting access to the same IPFS subdomain URL, as there is no server that can do anything actively there. Any PubSub messages or websocket or whatever should be disabled. There is as yet no way to do this, but there is draft specification that does allow this: [Content Security Policy: Embedded Enforcement](https://w3c.github.io/webappsec-cspee/)

## Things to avoid

### Use the shadow dom to include external content

The problem is that the shadow is only protected from CSS, not javascript. Code included in the shadow dom has access to the entire page. Another problem is that included code has no concept of its own script tag. The 'currentScript' property is not available inside the shadow dom.

### Use a Web Component to include external content

Again, this uses the shadow dom, which is insufficient and has no access to the currentScript property.


