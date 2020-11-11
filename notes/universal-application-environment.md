---
tags: Hope
---
# WIP: Universal Application Environment

[![hackmd-github-sync-badge](https://hackmd.io/2c2ebksJRWaE-eusDYC0Pg/badge)](https://hackmd.io/2c2ebksJRWaE-eusDYC0Pg)


To build a Universal Document, we need a universal application environment. A universal document is also an application. There is no distinction. You don't need an app to read/show/interact with a universal document.

For the first version of universal documents, we choose to use the web browser as a bootstrap environment, and IPFS and IPNS as storage.

The Universal Document has a future-proof format, in that we only specify the first line of the document:

```
<script src="//baf...hwq.ipfs.dweb.link/cobalt.js"></script><!--
```

The exact URL in the script depends on the document. But this line is needed to make sure that the browser can render the document. Since this is just part of the HTML standard, you could add more lines, but the render script must be the last and should be followed by a comment-open token, unless the universal document is entirely HTML, which is possible and explicitly supported.

* Any HTML document is automatically compatible with the Universal Document standard

We may need to add some more HTML stuff later, like the character encoding used, using a `<meta>` tag. But this first line is the entry point for all Universal Documents (except pure HTML).

The UAE (Universal Application Environment) starts there. The application script must have access to an API to allow it to render information and add user interaction. We are bound by the web browser and what it makes available, but we can build upon that.

As Universal Documents must be able to include other documents, and for now we choose to use `<iframe>`'s to get a clean sandboxed way to do this, we can't extend the browsers API outside of the application script. So whatever the application loads as code is the internal UAE API.

But we can add an API outside the iframe, using [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) and events. So this is the basis for a more complete API.

## Security and Trust

Any linked or quoted document should be handled as untrusted. So the iframe should load the document without access to the opener window by default. The drawback is that this also prevents the iframe to communicate back to the parent. Can we improve on this?

If there was an extra frame between the parent and included document, we could initialize a script in the between frame, that would have access to the window.opener. Then it removes this link, and loads the included document. This document has access to a window.opener, but not to window.opener.opener, which is the real parent. The between frame can now serve to pass messages, while still blocking access to the parent. By loading the between frame from a data url, instead of a real URL, there is no way to gather any information about the parent.

```
[ parent document ] -> [ loader ] -> [ linked document ]
                           ^------------ window.opener
                    -> postMessage -> postMessage --^
    ^-- postMessage <- postMessage <-
```

All the loader does in this scenario, is to listen for all events and pass them on the other side.

## Capabilities

What services does the API provide? This is limited to the postMessage API, since we found that we can't extend the browser API in the linked iframe's directly.

- quoting: a parent must be able to request a quote of a specific part of the target or child document. The child document must be able to return this in a format the parent understands. The parent must be able to request it in a way the child document understands.
- linking: a parent must be able to link to a specific part of a child document, in a way that the child document is able to handle when the user follows that link.
- capabilities and requirements negotiation: to allow for a generic message API, we should strive for a declarative, high level message syntax and semantics. Solid and more generally Linked Data should be an inspiration here. That also means that there must be some kind of negotiation about the capabilities and requirements.
- messaging in general: to allow for non-trivial interactions between child documents, they should have access to some kind of message bus, or multiple. The parent document should be in charge of which busses are available for which child documents. Child documents should be able to request access to specific types of busses.

What do I mean with types of busses? Imagine a document that contains a movie, with subtitles in different languages. The movie itself is a document, as are all the subtitles. The subtitles are aware of the start and endtime for each subtitle. The movie is aware of the current frame or timestamp in the movie. Then there is a separate document that has control elements for a movie player. All these are combined in a single parent document. 

The only way to communicate is by messages over a shared bus. But the subtitles aren't interested in the start,stop,step commands which the movie player wants to send to the movie. However, the movie player also allows you to select a subtitle language, or a specific subtitle document. The movie itself is uninterested in the subtitle selection and rendering. Any subtitle document not currently rendered, should not receive messages, except when the movie player switches to that subtitle document.

Or imagine a document that includes a graph, say the latest quarterly earnings of each subdivision of Acme Co., subdivided per month. The graph is just a visualization document, without data itself. It requires data to do anything. The quarterly earnings document is mostly just data. The parent document combines these with textual elements. The combination is a nice interactive report, where you can play with the data and visualization.

In fact, the data could be a list of earnings per subdivision, going back much longer. But the parent document is quoting a specific part of the document. In fact, the data could be a list of links to documents containing earnings information for each individual subdivision. All of this shouldn't matter to the parent document, or the visualization. 

The visualization application could be something like [Vega](https://vega.github.io/vega/) or [Vega Lite](https://vega.github.io/vega-lite/). To change the rendering, the vega document could link to [the vega editor](https://vega.github.io/editor/#/examples/vega-lite/bar_grouped).

Since the user knows the contents of the linked data, and presumably its structure, you could just send a raw JSON document from the linked data to the Vega visualization. But a much better user experience would be if the linked data understood that it has time series data, and financial data and data per subdivision. These could all be presented as possible filters or sorting options to the end user, without having to know the exact implementation details.

The Vega visualization should make clear that it wants to connect to a data source that can deliver JSON data. Its not useful to allow it to connect to an MP4 movie. The linked data should respond to that request, and possibly add more than one JSON data set it can provide, with userfriendly naming.

Now imagine a document that just contains a user interface to select a date/time range. When you connect it to the visualization of the earnings data, it will ask for a minimum and maximum date/time, and a minimum and maximum range. And it will request a list of time series data, so that a user can switch between those. And whenever a user updates the date/time range, it sends a message to the visualization tool. Which then updates the quote of the linked earnings data, and updates the visualization.

Now you can drag on a date range slider and see realtime updates in the document.

The UAE must not define the message format to be used. It should only define a way to select which message bus you want to use. The message and its parameters should be opaque, to allow for future changes and to allow new and innovative uses. 

There must be a way to avoid collisions, two different projects that decide to use the same bus and message name, but mean different things or having different parameters. Perhaps the message names and bus names or types should be namespaced, similar to java namespaces.