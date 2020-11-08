---
tags: Hope
---
# WIP: Versioned Universal Documents

This document expands on the concept of Universal Documents, as introduced in [A New Hope](https://hackmd.io/kafpxBeqQua_rcrncP14tQ).

When using IPFS as the universal storage system for documents, you must be aware that an IPFS address is tied to the contents of a document. If the contents change, the address changes.

The advantage is that any version of a document exists side by side with any other. And if two versions of a document are identical, they by definition have the same address.

So deduplication is build into IPFS. But version tracking is not. There is a way to keep track of the latest version of a document, using IPNS. This uses a similar looking address as an IPFS document, but specifically allows changing content, without a changing address. It does this by pointing to an IPFS address. You can update the pointer, without changing the IPNS address.

The problem then becomes, how do I find older / other versions of the document? 

A simple solution would be for the IPNS address to link not directly to the IPFS document, but to a version document. This document contains pointers to the latest and all previous versions of the document, as IPFS addresses.

If a document becomes forked, the version document will list all the parents of this version. It won't and can't list other branches. That is a different problem.

A target document, of a specific version, doesn't need to know its IPNS address for this to work. But I think the system will be much more usable if it does. This allows you to read a specific version of a document and then request an up to date list of versions of that same document. You won't get a list of forked versions, but you do get a list of versions in the 'main' branch.

If the owner of this document forks the document, this version list could potentially also list the forks. But I'll ignore this for the first implementation.

There is an inherent problem in linking to IPNS documents. Since the document changes over time, your deep links and quotes may become invalid or incorrect. There is no way to overcome this. But we may be able to detect it and suggest or use an older version where the link or quote is still valid.

A document format may be designed to be able to automatically update links and quotes from older versions to newer versions. All you need to do is keep an accurate track of insertions and deletions between versions. And calculate the difference vector between the old link or quote and the new one.

To detect that a link is no longer valid, the link must contain information about what specifically it linked to. The simplest way to do this, that I can think of, is to also include the IPFS address in the link. This makes it exactly clear which part of which version you linked to or quoted from.

Maybe it would be even better to always use the IPFS address for the link and quote, and only when opening the linked document use the IPNS address to hint the user that there is a newer version of the document. This avoids the whole problem of updating the links and quotes. You can still tag the link or quote in the user interface with a note that tells the user a newer version of the document is available, specifically if the link or quote is no longer the same in that version.

If you quote data, you could add a user interface to switch to newer or older versions of that data. This would make it possible to create a report on say quarterly earnings and link to an IPNS address that is updated quarterly. Just by using the version history you can then change the visualization of the data to previous quarters.

To support this last use case, the version document should allow extra information to be expressed for each version, in addition to its IPFS address. e.g:

```
{
    "@context": "/ipfs/awer...KW3z/contexts/universal-document-versions.jsonld",
    "@id": "/ipns/F9As...hj9s",
    "title":" Acme Co. Quarterly Earnings.", 
    "versions": [
        {
            "@context": "/ipfs/awer...KW3z/contexts/universal-document-version.jsonld",
            "@id": "/ipfs/zb2r...93bA",
            "date": "2020-11-08T09:33:35Z",
            "label": "Acme Co. Quarterly Earnings for the 3rd quarter of 2020."
        },
        ...
    ]
}
```
