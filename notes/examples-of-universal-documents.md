---
tags: Hope
---
# Examples of universal documents

## A Chess Game

A chess game is an example of an ephemeral application, its contents change over time. Untill the moment the chess game is finished, then its contents are fixed.

So a chess game starts by two people connecting and starting the same application. This application must have an ephemeral address, as it will change its contents. Each move one of the players make is appended to a log. Each position in this log has a content adressable address. You can go to each position in the log and get an accurate representation.

When the game is finished, the last position in the log becomes the final, fixed address of the game.

Each position in the game should be aware of its full version list. So that you can move to the final position.

Now in reality the application will probably optimize this, so that you only load the application once and it will get all the moves in one go, instead of switching the application to each position entirely. But by building the base system this way, any ephemeral application that can log changes can be supported in this way, and make each state addressable.

## Quarterly Earnings Report

A financial report needs access to the financial data. And it needs to be able to summarize these and show graphs to gain better insights.

A specific report that shows quarterly earnings for Acme co. for the last quarter, say July to September 2020, should have static contents. The quarter is closed. If somehow the contents must change, because an error was detected and rectified, the address changes to reflect this.

This means that there is also an ephemeral element to this document. There is an address that points to the report, while it is being worked on. This address should not change. It should show the latest published version by default, but allow for a history or log of changes.

The report containes a child document that contains the raw financial data. This is also a universal application. And it also has ephemeral and static addresses. 

The graph is just a visualization document, without data itself. It requires data to do anything. The quarterly earnings document is mostly just data. The parent document combines these with textual elements. The combination is a nice interactive report, where you can play with the data and visualization.

In fact, the data could be a list of earnings per subdivision, going back much longer. But the parent document is quoting a specific part of the document. In fact, the data could be a list of links to documents containing earnings information for each individual subdivision. All of this shouldn’t matter to the parent document, or the visualization.

The visualization application could be something like [Vega](https://vega.github.io/vega/) or [Vega Lite](https://vega.github.io/vega-lite/). To change the rendering, the vega document could link to [the vega editor](https://vega.github.io/editor/#/examples/vega-lite/bar_grouped).

Since the user knows the contents of the linked data, and presumably its structure, you could just send a raw JSON document from the linked data to the Vega visualization. But a much better user experience would be if the linked data understood that it has time series data, and financial data and data per subdivision. These could all be presented as possible filters or sorting options to the end user, without having to know the exact implementation details.

The Vega visualization should make clear that it wants to connect to a data source that can deliver JSON data. Its not useful to allow it to connect to an MP4 movie. The linked data should respond to that request, and possibly add more than one JSON data set it can provide, with userfriendly naming.

Now imagine a document that just contains a user interface to select a date/time range. When you connect it to the visualization of the earnings data, it will ask for a minimum and maximum date/time, and a minimum and maximum range. And it will request a list of time series data, so that a user can switch between those. And whenever a user updates the date/time range, it sends a message to the visualization tool. Which then updates the quote of the linked earnings data, and updates the visualization.

Now you can drag on a date range slider and see realtime updates in the document.

## A Movie

Imagine a document that contains a movie, with subtitles in different languages. The movie itself is a document, as are all the subtitles. The subtitles are aware of the start and endtime for each subtitle. The movie is aware of the current frame or timestamp in the movie. Then there is a separate document that has control elements for a movie player. All these are combined in a single parent document.

The only way to communicate is by messages over a shared bus. But the subtitles aren’t interested in the start,stop,step commands which the movie player wants to send to the movie. However, the movie player also allows you to select a subtitle language, or a specific subtitle document. The movie itself is uninterested in the subtitle selection and rendering. Any subtitle document not currently rendered, should not receive messages, except when the movie player switches to that subtitle document.