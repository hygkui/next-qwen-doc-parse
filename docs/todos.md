# todos list


## document upload

### upload document 2.0

- upload to qwen api to parse the document, donot need to reorganize the document, just parse it and get the content
- save the document content to the database, remeber the doc hash to db, if the upload document hash is the same, donot upload it again to qwen api, just notice user that this document has already been uploaded
- the document page is showing the document that we already uploaded to qwen api, and the document content is the content that we got from qwen api, we keep the document content that qwen api got, another document is we correct it, and the changes that we made(as an array, maybe saved as string in db)
- the document page is showing the documents that we already uploaded to qwen api, each document item can be load to the upload document 2 page, and the upload input will be disabled, and showing the uploaded document name.


