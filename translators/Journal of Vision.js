{
	"translatorID":"4345839f-b4fd-4e3f-a73d-268b6f280f6e",
	"translatorType":4,
	"label":"Journal of Vision",
	"creator":"Michael Berkowitz",
	"target":"http://(www.)?journalofvision.org/",
	"minVersion":"1.0.0b4.r5",
	"maxVersion":"",
	"priority":100,
	"inRepository":true,
	"lastUpdated":"2009-01-08 08:19:07"
}

function detectWeb(doc, url) {
	if (url.indexOf("search.aspx?") != -1 ||  url.match(/\d+/g).length == 2) {
		return "multiple";
	} else if (url.match(/\d+/g).length == 3) {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	var urls = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		 if (doc.evaluate('//a[@class="AbsTitle"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		 	var xpath = '//a[@class="AbsTitle"]';
		 } else if (doc.evaluate('//a[@class="toc_ArticleTitle"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		 	var xpath = '//a[@class="toc_ArticleTitle"]';
		 }
		 var articles = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		 var next_art;
		 while (next_art = articles.iterateNext()) {
			 items[next_art.href] = next_art.textContent;
		 }
		items = Zotero.selectItems(items);
		for (var i in items) {
			urls.push(i);
		}
	} else {
		urls.push(url);
	}
	Zotero.debug(urls);
	
	Zotero.Utilities.processDocuments(urls, function(newDoc) {
		var rislink = newDoc.evaluate('//div[@id="block0"]/table/tbody/tr/td[@class="body"]/a', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext().href.replace("info/GetCitation", "AutomaticCitationDownload") + '&type=ReferenceManager';
		var DOI = newDoc.evaluate('//td[2]/span[@class="toc_VolumeLine"]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.match(/doi:\s*(.*)$/)[1];
		var PDF = newDoc.evaluate('//div[@class="jovHistory"]//td[2]/a', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext().href;
		Zotero.debug(rislink);
		Zotero.Utilities.HTTP.doGet(rislink, function(text) {
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
			translator.setString(text);
			translator.setHandler("itemDone", function(obj, item) {
				item.DOI = DOI;
				item.publicationTitle = "Journal of Vision";
				item.attachments = [{url:PDF, title:"Journal of Vision Full Text PDF", mimeType:"application/pdf"}];
				item.complete();
			});
			translator.translate();
		});
	}, function() {Zotero.done();});
}