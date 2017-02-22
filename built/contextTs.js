var startEs = null;
var startDoc = null;
var startLocalId;
var span = 5;
var ts;
function initializeContext() {
    $(document).ready(function () {
        // do jQuery
    });
    startUp();
}
function startUp() {
    var ob = JsonTool.createJsonPath("query.match_phrase");
    ts = new ToolsCorpus();
    ob.query.match_phrase._id = ToolsCorpus.gup("id");
    var formData = new Object();
    formData.elasticdata = JSON.stringify(ob, null, 2);
    document.getElementById("spanSelect").value = "5";
    if (ToolsCorpus.gup("resturl") != "")
        postPhp(formData, loadContextInContext, ToolsCorpus.gup("resturl"));
    else {
        formData.resturl = ToolsCorpus.gup("noPort");
        postNoDataPort(formData, loadContextInContext);
    }
}
function changeContent() {
    document.getElementById('tableBody').innerHTML = "";
    startUp();
}
function loadContextInContext(data) {
    startEs = new ElasticClass(data);
    var docs = startEs.getDocs();
    startDoc = docs[0];
    startLocalId = startEs.getSingleFieldFromDoc(docs[0], "localId");
    if (startLocalId == "") {
        alert("This index cannot show th context to a match");
        return;
    }
    var ob = JsonTool.createJsonPath("query.bool");
    ob.query.bool.must = new Array();
    ob.from = 0;
    ob.size = (span * 2);
    var m = JsonTool.createJsonPath("match_phrase");
    m.match_phrase.textId = startEs.getSingleFieldFromDoc(docs[0], "textId");
    ob.query.bool.must.push(m);
    var pos = startEs.getSingleFieldFromDoc(docs[0], "localId");
    var r = JsonTool.createJsonPath("range.localId");
    r.range.localId.gte = pos - span;
    r.range.localId.lte = pos + span;
    ob.query.bool.must.push(r);
    ob.sort = new Array();
    var s = JsonTool.createJsonPath("localId");
    s.localId.order = "asc";
    ob.sort.push(s);
    var formData = new Object();
    document.getElementById('felt').value = JSON.stringify(ob, null, 2);
    formData.elasticdata = JSON.stringify(ob, null, 2);
    if (ToolsCorpus.gup("resturl") != "")
        postPhp(formData, writeOut, ToolsCorpus.gup("resturl"));
    else {
        formData.resturl = ToolsCorpus.gup("noPort");
        postNoDataPort(formData, writeOut);
    }
}
var prefix = "<span class=\"upmark\">";
var postfix = "<\/span>";
function writeOut(data) {
    var es = new ElasticClass(data);
    var docs = es.getDocs();
    for (var temp = 0; temp < docs.length; temp++) {
        var rawText;
        var checkbox = document.getElementById('originalTextId');
        if (checkbox.checked == false)
            rawText = es.getSingleFieldFromDoc(docs[temp], "rawText");
        else {
            if (es.getSingleFieldFromDoc(docs[temp], "localId") == startLocalId) {
                rawText = es.getSingleFieldFromDoc(docs[temp], "origText");
                rawText = rawText.replace(/&</g, "&amp;");
                rawText = rawText.replace(/\</g, "&lt;");
                rawText = rawText.replace(/\>/g, "&gt;");
            }
            else
                rawText = es.getSingleFieldFromDoc(docs[temp], "rawText");
        }
        if (es.getSingleFieldFromDoc(docs[temp], "localId") == startLocalId)
            rawText = prefix + rawText + postfix;
        insertContentInContextTable(rawText, es.getSingleFieldFromDoc(docs[temp], "sunitId"));
    }
}
function insertContentInContextTable(content1, sunitId) {
    var table = document.getElementById('tableBody');
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    cell1.innerHTML = content1;
    cell1 = row.insertCell(1);
    cell1.setAttribute("class", "sunitId"); //For Most Browsers
    cell1.setAttribute("className", "sunitId");
    cell1.innerHTML = sunitId;
}
function rewriteTable() {
    document.getElementById('tableBody').innerHTML = "";
    span = parseInt((document.getElementById("spanSelect")).value);
    var ob = new Object();
    ob.query = new Object();
    ob.query.match_phrase = new Object();
    ob.query.match_phrase._id = ToolsCorpus.gup("id");
    var formData = new Object();
    formData.elasticdata = JSON.stringify(ob, null, 2);
    if (ToolsCorpus.gup("resturl") != "")
        postPhp(formData, loadContextInContext, ToolsCorpus.gup("resturl"));
    else {
        formData.resturl = ToolsCorpus.gup("noPort");
        postNoDataPort(formData, loadContextInContext);
    }
}
