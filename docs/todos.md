# todos list


## document upload

### upload document 2.0

- upload to qwen api to parse the document, donot need to reorganize the document, just parse it and get the content
- save the document content to the database, remeber the doc hash to db, if the upload document hash is the same, donot upload it again to qwen api, just notice user that this document has already been uploaded
- the document page is showing the document that we already uploaded to qwen api, and the document content is the content that we got from qwen api, we keep the document content that qwen api got, another document is we correct it, and the changes that we made(as an array, maybe saved as string in db)
- the document page is showing the documents that we already uploaded to qwen api, each document item can be load to the upload document 2 page, and the upload input will be disabled, and showing the uploaded document name.


## 接下来要做的

- 用户可以上传专业名词库用作参考文档，参考文档可以上传多个，同样的，
内容可以预览，用户在校对页面，可以选择使用哪些参考文档，或者支持在这里直接上传到知识库
- 从文档列表中的校对按钮进入文档页面时候，如果是已经有的文档，载入文档的内容，如果是空的文档，就是要显示上传文档输入框了，然后执行上传新建文档的逻辑。上传完成后就和载入现有文档的逻辑一样了。
- 校对页面要显示原始文档和校对文档，以及changes变化
- 复用上次upload document 2的标记文本，开始校对编辑的逻辑，尤其是选择文字高亮+红色下划线，在鼠标停留的位置显示校对此段的按钮，然后显示到ai校对以及人工校对的文本框中。
