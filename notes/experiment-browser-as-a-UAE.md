---
tags: Experiments
---
# Implementation Notes for a Universal Application Environment Experiment in the Browser

[![hackmd-github-sync-badge](https://hackmd.io/LlK6dyblRfiDmJH0r4L5aA/badge)](https://hackmd.io/LlK6dyblRfiDmJH0r4L5aA)


This aims to create an implementation of a universal document with the web browser as the basic application environment. What can we re-use, what must be added?

## Use iframes to embed other applications.

An iframe is an almost ideal sandbox, allowing for secure and anonymous embedding of untrusted content. Iframes can have security attributes that allow the parent document to specify minimum security: [csp](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/csp), [sandbox](https://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/), [allow](https://developer.mozilla.org/en-US/docs/Web/HTTP/Feature_Policy/Using_Feature_Policy#The_iframe_allow_attribute).

Communication between untrusted partners is possible using the [postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).


- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
- [CSP](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/csp)
- [allow](https://developer.mozilla.org/en-US/docs/Web/HTTP/Feature_Policy/Using_Feature_Policy#The_iframe_allow_attribute)
- [sandbox](https://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/) - [tutorial](https://looker.com/blog/iframe-sandbox-tutorial)
- [seamless](https://benvinegar.github.io/seamless-talk/) - no longer in the standard -[javascript lib](https://github.com/travist/seamless.js) - [demo](http://travistidwell.com/seamless.js/) - [alternative](https://github.com/mercadolibre/seamless-iframe)
- [srcdoc](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/srcdoc)
- [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

### Sandboxed Iframes

When using just the attribute 'sandbox' on an iframe, without any tokens, only the html contents of the document are shown. No script is run. So we must specify at least 'sandbox="allow-scripts"' to be usable.

With just 'allow-scripts', the sandbox has no access to its opener. It cannot open popups or navigate the parent document. It can navigate its own iframe. It cannot open links in a new tab or window.

The child can listen for messages and respond to them. The message event contains a reference to the origin window of the message. This can be used to call postMessage() and send a reply.

This also means that after sending a single message, the child has a reference to its parent window. But most properties aren't available, or are restricted, e.g. window.location. You can't get the URL, or even its length.

This means that there is no need to inject an intermediate iframe, the sandbox property nicely isolates the child from the parent.

### Seamless Iframes

The seamless attribute has been removed from the HTML5 specification. This attribute was meant to allow iframes to be embedded without a border or fixed height, behaving like a `<div>` instead. Including applying CSS from the parent on its own content.

This is almost exactly the behaviour we need in our experiment. The only change I would make is to allow the child document some control on what styling to apply, as well as the parent document control on what styling to pass on to the child document.

For our experiment we don't need to think too hard about generalizing the message API too much. We just need to show that the concept works. So the simplest solution is to allow the parent to send a message with some css, as a string. And let the child document apply it.

The parent document removes the border and background etc. on the child. The child document sends a message to the parent with the preferred width and height.

The child can use the getBoundingClientRect API to calculate the needed width and height:

```
    var size = document.body.getBoudingClientRect();
```

This includes the padding and border, but not the margin. So the simplest solution is to specify that you shouldn't set a margin on the `<html>` or `<body>` elements. This means you just have to send a message to the parent with the `size.width` and `size.height` values.

