
var elastic = null;
var response = null;
var pagePos = 0;
var wordList = null;
var posList = null;
var lemmaList = null;
var mixedLine = null;
//var wordPos = 0;
var numberOfMatches = 0;
var stopSearch = false;
var stopLabel = "";
var errorDocs = 0;
var contextWindow = null;
var posArray = null;
var globalHits = 0;
var searchTemplate = null;
var fileResultObject = null;
var wAlert = false;
var gRawWordForms = null;
var jumpWordEnabled = false;
let defaultObj: any;
let defaultSmall: any;
let userId = null;

var defaultSpanNear = JSON.parse("{\"span_near\":{\"clauses\":[],\"slop\":3,\"in_order\":\"true\"}}");

var defaultSpanOr = JSON.parse("{\"span_or\":{\"clauses\":[]}}");
var defaultSpanTerm = JSON.parse("{\"span_term\":{}}");
var searchObject = null;
var runSearchObject = null;
var fieldName = "mixed";
var defaultRegexp = JSON.parse("{\"span_multi\":{\"match\":{\"regexp\":{}}}}");
var defaultWildcard = JSON.parse("{\"span_multi\":{\"match\":{\"wildcard\":{}}}}");
var defaultprefix = JSON.parse("{\"span_multi\":{\"match\":{\"prefix\":{}}}}");

var scrollId = "";

var prefix = "<span class=\"upmark\">";
var postfix = "<\/span>";
var wordSplitter = new RegExp("([\\s.,;:\"\(\)\{\}<>$+=!\\[\\]\\*—\\?\\#_\&%€£@~]+)", "g");
var spaceSplitter = new RegExp("([\\s]+)", "g");
var numberOfTerms = 0;
var workingSpanNear = null;


//var defaultTerm = JSON.parse



function createdefaultObjects() {
  defaultObj = JsonTool.createJsonPath("query.bool.filter");
  defaultObj.from = 0;
  defaultObj.size = ToolsCorpus.pageSize;
  defaultObj.query.bool.filter.bool = JSON.parse("{\"must\":[],\"should\":[],\"must_not\":[]}");
  defaultSmall = JsonTool.cloneJSON(defaultObj);
}

function getRemote(remote_url) {
    return $.ajax({
        type: "GET",
        url: remote_url,
        async: false,
    }).responseText;
}


function urlHasAccessToken() {
  let st: string = sessionStorage.getItem("accessTokenCorpus");
  if (st != "null" && !stringEmpty(st))
    return false;
  let str: string = location.href;
  var pos = str.indexOf("code=");
  if (pos == -1)
    return false;
  pos = pos + 5;
  var token = getRemote("/textcorpus/api/auth?code="+str.substring(pos)).trim();
  sessionStorage.setItem("accessTokenCorpus", token);
//  postPhpReturnText("/textcorpus/api/auth?code="+str.substring(pos),new Object(),getAccessToken);
  //sessionStorage.setItem("accessTokenCorpus", str.substring(pos));
  return true;
}

function getAccessToken(data){
  sessionStorage.setItem("accessTokenCorpus",data); 
  finishInitializing();  
}


function stringEmpty(str) {
  return (!str || 0 === str.length);
}

function initialize() {

  $(document).ready(function () {
    // do jQuery
  });
  if (urlHasAccessToken() == false) {
    let st: string = sessionStorage.getItem("accessTokenCorpus");
    if (st == "null" || stringEmpty(st)) {
       window.location.href = "https://auth.dataporten.no/oauth/authorization?client_id=71886b77-e1c7-4fce-814c-629d524ce441&response_type=code&redirect_uri=http://itfds-utv01.uio.no/morten/text2/built/";
     //  window.location.href = "https://auth.dataporten.no/oauth/authorization?client_id=7cafa14f-757e-4544-8253-0e715358bd26&response_type=code&redirect_uri=https://nabu.usit.uio.no/hf/ilos/elc/";

       return;
    }
  }
   let st: string = sessionStorage.getItem("accessTokenCorpus");
   //if
   if (st == "null" || stringEmpty(st))
     return;
   finishInitializing();
}

function finishInitializing(){
  loadIndexes();
  createdefaultObjects();
  (<HTMLButtonElement>document.getElementById('stopButton')).disabled = true;
  (<HTMLButtonElement>document.getElementById('searchButton')).disabled = false;
  (<any>document.getElementById('slidetextdiv')).style.visibility = "hidden";

  if (ToolsCorpus.gup("showjson") != "")
    document.getElementById("felt").style.display = "block";
  else
    document.getElementById("felt").style.display = "none";
  (<HTMLSelectElement>document.getElementById("selectSort")).value = "right";
  showSortDiv(false);
  postPhpReturnText("get_ip.php", new Object(), setUser);
}

function setUser(data) {
  data = data.trim();
  userId = data.replace(/\./g, "_");
}

$(document).on('keyup', function (event) {
  if (event.keyCode == 27) {//slip focus fra aktivt element escape
    (<any>document.activeElement).blur();
    document.getElementById("inputField").focus();
  }
});


function search() {
  if (curIndex.includeLemma == false) {
    var res = (<HTMLInputElement>document.getElementById("inputField")).value.match(/[<>\\[\\]/g);
    if (res != null) {
      alert("This index does not support lemma or wordclass searching!");
      return;
    }
  }
  pagePos = 0;
  clearTable('tableBody');
  showSortDiv(false);
  numberOfMatches = 0;
  stopSearch = false;
  errorDocs = 0;
  workingSpanNear = JsonTool.cloneJSON(defaultSpanNear);
  document.getElementById("labelSpan").innerHTML = "";
  if ((<HTMLInputElement>document.getElementById("inputField")).value == "") {
    alert("Input field must have content");
    return;
  }
  buildQuery();
}

var TERM = 0;
var POS = 1;
var LEMMA = 2;
var WILDCARD = 3;
function buildQuery() {
  searchObject = JsonTool.cloneJSON(defaultObj);
  searchTemplate = new SearchTemplate((<any>document.getElementById("inputField")).value.toLowerCase(), curIndex.wordClasses);
  for (let temp = 0; temp < searchTemplate.candidateList.length; temp++) {
    if (searchTemplate.candidateList[temp].type == searchTemplate.LEMMA) {
      if (searchTemplate.candidateList[temp].list.length == 1) {
        var spanTerm = JsonTool.cloneJSON(defaultSpanTerm);
        eval("spanTerm.span_term." + fieldName + "=\"" + searchTemplate.candidateList[temp].list[0].toUpperCase() + "\"");
        workingSpanNear.span_near.clauses.push(spanTerm);
      } else {
        var spanOr = JsonTool.cloneJSON(defaultSpanOr);
        for (let i = 0; i < searchTemplate.candidateList[temp].list.length; i++) {
          var spanTerm = JsonTool.cloneJSON(defaultSpanTerm);
          eval("spanTerm.span_term." + fieldName + "=\"" + searchTemplate.candidateList[temp].list[i].toUpperCase() + "\"");
          spanOr.span_or.clauses.push(spanTerm);
        }
        workingSpanNear.span_near.clauses.push(spanOr);
      }
    } else if (searchTemplate.candidateList[temp].type == searchTemplate.POS) {
      if (searchTemplate.candidateList[temp].list.length == 1) {
        var prefixTerm = JsonTool.cloneJSON(defaultprefix);
        eval("prefixTerm.span_multi.match.prefix." + fieldName + "=\"" + searchTemplate.candidateList[temp].list[0].toUpperCase() + "\"");
        workingSpanNear.span_near.clauses.push(prefixTerm);
      } else {
        var spanOr = JsonTool.cloneJSON(defaultSpanOr);
        for (let i = 0; i < searchTemplate.candidateList[temp].list.length; i++) {
          var prefixTerm = JsonTool.cloneJSON(defaultprefix);
          eval("prefixTerm.span_multi.match.prefix." + fieldName + "=\"" + searchTemplate.candidateList[temp].list[i].toUpperCase() + "\"");
          spanOr.span_or.clauses.push(prefixTerm);
        }
        workingSpanNear.span_near.clauses.push(spanOr);
      }
    }
    else if (searchTemplate.candidateList[temp].type == searchTemplate.WILDCARD) {
      var regExp = JsonTool.cloneJSON(defaultWildcard);
      eval("regExp.span_multi.match.wildcard." + fieldName + "=\"" + searchTemplate.candidateList[temp].token + "\"");
      workingSpanNear.span_near.clauses.push(regExp);
    } else if (searchTemplate.candidateList[temp].type == searchTemplate.TERM) {
      if (searchTemplate.candidateList[temp].list == null) {
        var spanTerm = JsonTool.cloneJSON(defaultSpanTerm);
        eval("spanTerm.span_term." + fieldName + "=\"" + searchTemplate.candidateList[temp].token + "\"");
        workingSpanNear.span_near.clauses.push(spanTerm);
      } else {
        var spanOr = JsonTool.cloneJSON(defaultSpanOr);
        for (let i = 0; i < searchTemplate.candidateList[temp].list.length; i++) {
          var spanTerm = JsonTool.cloneJSON(defaultSpanTerm);
          eval("spanTerm.span_term." + fieldName + "=\"" + searchTemplate.candidateList[temp].list[i] + "\"");
          spanOr.span_or.clauses.push(spanTerm);
        }
        workingSpanNear.span_near.clauses.push(spanOr);
      }
    }
  }
  runQuery();
}


function runQuery() {
  //
  document.getElementById("labelSpan").innerHTML = "Searching...";
  (<HTMLButtonElement>document.getElementById('stopButton')).disabled = false;
  numberOfTerms = searchTemplate.candidateList.length;
  if (curIndex.includeLemma == true)
    workingSpanNear.span_near.slop = searchTemplate.calculateSlop();
  else
    workingSpanNear.span_near.slop = 0;
  optimize();

  if (workingSpanNear.span_near.clauses.length < 2) {
    handleOneTermQuery();
    return;
  }
  searchObject.query.bool.filter.bool.must.push(workingSpanNear);
  addMetadataToQuery(searchObject);
  var formData: any = new Object();
  formData.resturl = curIndex.index + "/" + curIndex.type + "/_search?scroll=1m";
  runSearchObject = JsonTool.cloneJSON(searchObject);
  searchObject.aggs = getSearchAggregations();
  (<HTMLInputElement>document.getElementById("felt")).value = JSON.stringify(searchObject, null, 2);
  formData.elasticdata = JSON.stringify(searchObject, null, 2);
  postPhp(formData, writeResult,curIndex.dataPort+"/search?scroll=1m");
}

function clearTable(tableId) {
  document.getElementById(tableId).innerHTML = "";
}


function writeResult(data) {
  scrollId = data._scroll_id;
  response = new ElasticClass(data);
  /*   response = new ElasticSearch();
    response.setMainObject(data);*/
  globalHits = response.getDocCount();
  if (pagePos == 0)
    resetSelectionBoxes(response);
  var docs = response.getDocs();
  pagePos += docs.length;
  for (var temp = 0; temp < docs.length; temp++) {
    if (stopSearch == true)
      break;
    if (curIndex.includeLemma == true) {
      posList = splitTextInWordList(response.getSingleFieldFromDoc(docs[temp], "pos"));
      mixedLine = response.getSingleFieldFromDoc(docs[temp], "mixed");
      var b = response.getSingleFieldFromDoc(docs[temp], "rawWordForms");
      var q = b.replace(spaceSplitter, "####");
      gRawWordForms = q.split("####");
      b = response.getSingleFieldFromDoc(docs[temp], "lemma");
      q = b.replace(spaceSplitter, "####");
      lemmaList = q.split("####");
    }
    if (searchTemplate.jumpWordEnabled == false)
      splitInHighlight(response.getSingleFieldFromDoc(docs[temp], "rawText"), response.getSingleFieldFromDoc(docs[temp], "sunitId"), response.getMetadataFieldFromDoc(docs[temp], "_id"));
    else splitJump(response.getSingleFieldFromDoc(docs[temp], "rawText"), response.getSingleFieldFromDoc(docs[temp], "sunitId"), response.getMetadataFieldFromDoc(docs[temp], "_id"));
  }
  if (globalHits == response.getDocs().length) {
    writeLabelResult();
    return;
  }
  continueSearch();
}


function insertContentInTable(content1, content2, content3, sunitId) {
  let table: HTMLTableElement = <HTMLTableElement>document.getElementById('tableBody');
  var row = table.insertRow(-1);
  var cell1 = row.insertCell(0);
  cell1.setAttribute("class", "firstLine"); //For Most Browsers
  cell1.setAttribute("className", "firstLine");
  cell1.innerHTML = content1;

  cell1 = row.insertCell(1);
  cell1.setAttribute("class", "middleLine"); //For Most Browsers
  cell1.setAttribute("className", "middleLine");
  cell1.innerHTML = content2;

  cell1 = row.insertCell(2);
  cell1.innerHTML = content3;

  cell1 = row.insertCell(3);
  cell1.setAttribute("class", "sunitId"); //For Most Browsers
  cell1.setAttribute("className", "sunitId");
  cell1.innerHTML = sunitId;

}


function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop))
      return false;
  }
  return true;
}


function drill(p, path) {
  if (this.isEmpty(p))
    return '';
  let a = path.split(".");
  for (let i in a) {
    var key = a[i];
    if (p[key] == null)
      return '';
    p = p[key];
  }
  return p;
}

function handleOneTermQuery() {
  var formData: any = new Object();
  let ob: any = workingSpanNear.span_near.clauses[0];
  var singleSearch = JsonTool.cloneJSON(defaultSmall);
  singleSearch.query.bool.filter.bool.must.push(ob);
  addMetadataToQuery(singleSearch);
  runSearchObject = JsonTool.cloneJSON(singleSearch);
  singleSearch.aggs = getSearchAggregations();
  (<HTMLTextAreaElement>document.getElementById("felt")).value = JSON.stringify(singleSearch, null, 2);
  formData.resturl = curIndex.index + "/" + curIndex.type + "/_search?scroll=1m";
  formData.elasticdata = JSON.stringify(singleSearch, null, 2);
  postPhp(formData, writeResult,curIndex.dataPort+"/"+"search?scroll=1m");
}


function writeLabelResult() {
  (<HTMLButtonElement>document.getElementById('stopButton')).disabled = true;
  if (curIndex.includeLemma == false)
    document.getElementById("labelSpan").innerHTML = "Found: " + numberOfMatches; // + " in " + pagePos + " records";
  else
    document.getElementById("labelSpan").innerHTML = "Found: " + numberOfMatches; // + " in: " + pagePos + " records. Not handled records: " + errorDocs;
  if (numberOfMatches >= ToolsCorpus.maxResult)
    document.getElementById("labelSpan").innerHTML = document.getElementById("labelSpan").innerHTML + ". To retrieve all matches, click on Sort (this can take a while)";
  document.getElementById("textDiv").focus();
}

function continueSearch() {
  if (stopSearch == true) {
    document.getElementById("labelSpan").innerHTML = stopLabel;
    (<HTMLButtonElement>document.getElementById('stopButton')).disabled = true;
    return;
  }
  var hits = response.getDocCount();
  if (pagePos >= hits || numberOfMatches >= ToolsCorpus.maxResult) {
    writeLabelResult();
    return;
  }

  let formData: any = new Object();
  document.getElementById("labelSpan").innerHTML = "Fetching text number of matches so far " + numberOfMatches;
  formData.resturl = curIndex.index + "/" + curIndex.type + "_search/scroll/";
  let elasticdata: any = new Object();
/*  elasticdata.scroll = "1m";
  elasticdata.scroll_id = scrollId;
  elasticdata.size = 1000;*/

  formData.resturl = "_search?scroll=5m&scroll_id=" + scrollId + "&";
  formData.elasticdata = "";
//  this.postPhp(formData,this.curIndex.dataPort+"/search?scroll=5m&scrollId=" + this.scrollId);
  
  postPhp(formData, writeResult,curIndex.dataPort+"/search?scroll=5m&scrollId="+scrollId+"&");
}


function seeIfLookUp(event) {
  if (event.keyCode == 13) {
    if (document.activeElement === document.getElementById("inputField"))
      search();
    return;
  }
}

function splitTextInWordList(text) {
  let str = text.replace(wordSplitter, "####");
  let l = str.split("####");
  var l2 = new Array();
  for (let temp = 0; temp < l.length; temp++)
    if (l[temp].length != 0)
      l2.push(l[temp]);
  return l2;
}


function splitJump(rawText, sunitId, id) {
  var adder = 1;
  var size = 0;
  var temp;
  for (temp = 0; temp < searchTemplate.candidateList.length; temp++) {
    if (searchTemplate.candidateList[temp].type == searchTemplate.WILDCARD && searchTemplate.candidateList[temp].removable == true) {
      searchTemplate.candidateList[temp].adder = adder;
      size += adder;
      adder = adder * 2;
    }
  }
  size += 1;
  for (temp = 0; temp < size; temp++) {
    var i;
    numberOfTerms = searchTemplate.candidateList.length;
    for (i = 0; i < searchTemplate.candidateList.length; i++) {
      if (searchTemplate.candidateList[i].type == searchTemplate.WILDCARD && searchTemplate.candidateList[i].removable == true) {
        if (temp & searchTemplate.candidateList[i].adder) {
          numberOfTerms--;
          searchTemplate.candidateList[i].isRemoved = true;
        } else
          searchTemplate.candidateList[i].isRemoved = false;
      }
    }
    splitInHighlight(rawText, sunitId, id);
  }

}


function splitInHighlight(rawText, sunitId, id) {
  if (numberOfMatches >= ToolsCorpus.maxResult) {
    stopLabel = "The application stops at " + ToolsCorpus.maxResult + " matches. To retrieve all matches, click on Sort (this can take a while)";
    stopSearch = true;
    return;
  }
  var wordList;
  var wl;
  if (curIndex.includeLemma == true && searchTemplate.qRawText == false) {
    wordList = gRawWordForms;
    wl = new Array();
    for (var t = 0; t < wordList.length; t++)
      wl.push(wordList[t].toLowerCase());

    if (lemmaList.length != wordList.length) {
      errorDocs++;
      return;
    }
    if (posList.length != wordList.length) {
      errorDocs++;
      return;
    }
  } else {
    wordList = splitTextInWordList(rawText);
    wl = splitTextInWordList(rawText.toLowerCase());
  }
  let offset = new Array();
  let pos = 0;
  var temp;
  for (temp = 0; temp < wordList.length; temp++) {
    pos = rawText.indexOf(wordList[temp], pos);
    offset.push(pos);
    pos += wordList[temp].length;
  }
  for (temp = 0; temp < wl.length; temp++) {
    if (searchTemplate.qMatch(wl, temp, posList, lemmaList) == true) {
      numberOfMatches += 1;
      let startPos = offset[temp];
      let endPos = offset[temp + (numberOfTerms - 1)];
      endPos = endPos + wordList[temp + (numberOfTerms - 1)].length;
      let middleString = prefix + rawText.substring(startPos, endPos) + postfix;
      let firstString = rawText.substring(0, startPos);
      let endString = rawText.substring(endPos);
      if (firstString.length > ToolsCorpus.surroundLength) {
        firstString = firstString.substring(firstString.length - ToolsCorpus.surroundLength);
        pos = firstString.indexOf(" ");
        if (pos != -1)
          firstString = "..." + firstString.substring(pos);
      }
      if (endString.length > ToolsCorpus.surroundLength) {
        endString = endString.substring(0, ToolsCorpus.surroundLength);
        pos = endString.lastIndexOf(" ");
        if (pos != -1)
          endString = endString.substring(0, pos);
        endString += "...";
      }
      middleString = middleString.trim();
      middleString = "<a href='javascript:loadContext(\"" + id + "\")'>" + middleString + "</a>";
      firstString = firstString.trim();
      endString = endString.trim();
      insertContentInTable(firstString, middleString, endString, sunitId);
    }
  }
}


function optimize() {
  if (curIndex.includeLemma == false) {
    removeWildcardOnly("rawText");
    return;
  }
  var onlyWords = true;
  for (temp = 0; temp < searchTemplate.candidateList.length; temp++) {
    if (searchTemplate.candidateList[temp].type != TERM && searchTemplate.candidateList[temp].type != WILDCARD)
      onlyWords = false;

  }
  if (onlyWords == true) {
    var str = JSON.stringify(workingSpanNear);
    str = str.replace(/\"mixed\":/g, "\"rawText\":");
    workingSpanNear = JSON.parse(str);
    workingSpanNear.span_near.slop = 0;
    removeWildcardOnly("rawText");
  }
  var onlyLemma = true;
  for (temp = 0; temp < searchTemplate.candidateList.length; temp++) {
    if (searchTemplate.candidateList[temp].type != LEMMA)
      onlyLemma = false;

  }
  if (onlyLemma == true) {
    var str = JSON.stringify(workingSpanNear);
    str = str.replace(/\"mixed\":/g, "\"lemma\":");
    workingSpanNear = JSON.parse(str);
    workingSpanNear.span_near.slop = 0;
    return;
  }
  var onlyPos = true;
  for (var temp = 0; temp < searchTemplate.candidateList.length; temp++) {
    if (searchTemplate.candidateList[temp].type != POS)
      onlyPos = false;
  }
  if (onlyPos == true) {
    var str = JSON.stringify(workingSpanNear);
    str = str.replace(/\"mixed\":/g, "\"pos\":");
    workingSpanNear = JSON.parse(str);
    workingSpanNear.span_near.slop = 0;
    return;
  }

  if (onlyWords == false && onlyLemma == false && onlyPos == false) {
    removeWildcardOnly("mixed");
  }
}


function removeWildcardOnly(field) {
  var l = workingSpanNear.span_near.clauses.length;
  l--;
  while (l >= 0) {
    var str = drill(workingSpanNear.span_near.clauses[l], "span_multi.match.wildcard." + field);
    if (str == "*") {
      workingSpanNear.span_near.clauses.splice(l, 1);
      workingSpanNear.span_near.slop += 1;
    }
    l--;
  }
}

function readTable(tableId) {
  let oTable: HTMLTableElement = <HTMLTableElement>document.getElementById(tableId);
  var rowLength = oTable.rows.length;
  var line = "";
  var stringList = new Array();
  for (let i = 0; i < rowLength; i++) {
    line = "";
    var oCells = oTable.rows.item(i).cells;
    var cellLength = oCells.length;
    for (var j = 0; j < cellLength; j++) {
      line += oCells.item(j).innerHTML + "\t";
    }
    stringList.push(line.substring(0, line.length - 1));
  }
  return stringList;
}


function createLeftString(str) {
  var pos = str.lastIndexOf("</span>");
  if (pos != -1)
    str = str.substring(pos + 7);
  let wl: any = splitTextInWordList(str);
  if (wl.length == 0)
    return "";
  var temp = wl.length - 1;
  let ret: any = "";
  while (temp >= 0) {
    ret += wl[temp] + " ";
    temp--;
  }
  return ret;
}

function pickUpMatchWords(str) {
  var pos = str.indexOf(prefix, 0);
  var pos2 = str.indexOf(postfix, pos);
  return str.substring(pos + prefix.length, pos2);
}

function sortResult() {
  //    initFileResult(false);
  fileResultObject = new FileResult(runSearchObject, searchTemplate, false, curIndex, userId);
}

function sortToFile() {
  //    initFileResult(false);
  var fb = new FileResult(runSearchObject, searchTemplate, true, curIndex, userId);
}

function stopSearching() {
  stopLabel = "Search has been canceled!";
  stopSearch = true;
}

function loadContext(id) {
  if (contextWindow != null)
    contextWindow.close();
//  contextWindow = window.open("context.html?id=" + id + "&resturl=" + curIndex.index + "/" + curIndex.type + "/_search?", "context");
  contextWindow = window.open("context.html?id=" + id + "&resturl="+curIndex.dataPort+"/search?", "context");

//curIndex.dataPort+"/search?
  contextWindow.focus();
}

function insertWordclassInSearchField() {
  if ((<HTMLSelectElement>document.getElementById("selectWordclasses")).value == "")
    return;
  (<HTMLInputElement>document.getElementById("inputField")).value = (<HTMLInputElement>document.getElementById("inputField")).value + "<" + (<HTMLSelectElement>document.getElementById("selectWordclasses")).value + ">";
}

function expandPos(str) {
  var arr = new Array();
  for (let temp = 0; temp < posArray.length; temp++) {
    var l = posArray[temp].split("-");
    if (l.length == 2) {
      if (l[1].startsWith(str))
        arr.push(posArray[temp]);
    }
    if (l[0].startsWith(str))
      arr.push(posArray[temp]);
  }
  return arr;
}


function showSortDiv(show) {
  if (show == false)
    document.getElementById('sortDiv').style.visibility = 'hidden';
  else
    document.getElementById('sortDiv').style.visibility = 'visible';
}


//------------------------
function postPhpReturnText(urlToCall, formData, callBack) {
  //  document.getElementById("felt").value = "server";
  $.ajax({
    type: 'post',
    url: urlToCall,
    data: formData,
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      alert('status:' + XMLHttpRequest.status + ', status tekst: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
    },
    success: function (data) {
      //     document.getElementById("felt").value = "client";

      callBack(data);
    }
  });
}

function postPhpReturnJson(urlToCall, formData, callBack) {
  //  document.getElementById("felt").value = "server";
  $.ajax({
    url: urlToCall,
    type: 'post',
    data: formData,
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
    },
    success: function (data) {
      //       document.getElementById("felt").value = "client";
      callBack(data);
    },
    dataType: "json"
  });
}

 
