
class FileResult {
  response: ElasticClass;
  searchTemplate: SearchTemplate;
  searchObject: any;
  fileSort: boolean;
  listToWrite: string = null;
  firstWrite: boolean = false;
  numberOfMatches: number;
  errorDocs: number;
  pagePos: number;
  curIndex: any;
  posList: any;
  lemmaList: any;
  gRawWordForms: any;
  mixedLine: any;
  tools: ToolsCorpus;
  userId = "erlandse";
  numberOfTerms = 0;
  scrollId;
  sampleSize = 500;
  postCallBack: Function;
  slider: any = null;
  spaceSplitter = new RegExp("([\\s]+)", "g");
  sortedPage = null;


  constructor(searchOb: any, searchTemp: SearchTemplate, fS: boolean, curI: any, userId: string) {
    this.tools = new ToolsCorpus();
    this.searchObject = searchOb;
    this.searchTemplate = searchTemp;
    this.fileSort = fS;
    this.curIndex = curI;
    this.userId = userId;
    this.postPhp = this.postPhp.bind(this);
    this.postPhpReturnText = this.postPhpReturnText.bind(this);
    this.fileSplitJump = this.fileSplitJump.bind(this);
    this.writeFileResult = this.writeFileResult.bind(this);
    this.splitResult = this.splitResult.bind(this);
    this.fillRightContext = this.fillRightContext.bind(this);
    this.fillLeftContext = this.fillLeftContext.bind(this);
    this.insertInList = this.insertInList.bind(this);
    this.continueFileSearch = this.continueFileSearch.bind(this);
    this.loadResult = this.loadResult.bind(this);
    this.writeSortedPage = this.writeSortedPage.bind(this);
    this.writeSampleFile = this.writeSampleFile.bind(this);
    this.initSlider = this.initSlider.bind(this);
    this.insertFileLink = this.insertFileLink.bind(this);
    this.postPhpReturnJson = this.postPhpReturnJson.bind(this);
    this.postPhpOnSuccess = this.postPhpOnSuccess.bind(this);
    this.setCallBack = this.setCallBack.bind(this);
    this.initCountAggregations();
    this.initFileResult();
  }


  initCountAggregations() {
    var temp;
    let counter = 0;
    for (temp = 0; temp < this.curIndex.aggregations.length; temp++)
      if (this.curIndex.aggregations[temp].inSearch == true) {
        this.curIndex.aggregations[temp].counts = new Array();
        for (var i = 0; i < this.curIndex.aggregations[temp].labels.length; i++) {
          this.curIndex.aggregations[temp].counts.push(counter);
        }
      }
  }


  setCallBack(f: Function, caller: string) {
    this.postCallBack = f;
  }

  initFileResult() {
    (<HTMLTextAreaElement>document.getElementById("felt")).value = "";
    this.listToWrite = "";
    let formData: any;
    formData = new Object();
    this.firstWrite = true;
    this.numberOfMatches = 0;
    this.errorDocs = 0;
    this.pagePos = 0;
    formData.resturl = this.curIndex.index + "/" + this.curIndex.type + "/_search?scroll=1m";

    //  formdData,resurl = "searchICEScroll?scroll=1m";

    formData.elasticdata = JSON.stringify(this.searchObject, null, 2);
    this.setCallBack(this.writeFileResult, "initFileResult");
    this.postPhp(formData,this.curIndex.dataPort+"/search?scroll=1m");

  }

  postPhpOnSuccess(data) {
    this.postCallBack(data);
  }



  fileSplitJump(doc, rawText, sunitId, id) {
    var adder = 1;
    var size = 0;
    var temp;
    for (temp = 0; temp < this.searchTemplate.candidateList.length; temp++) {
      if (this.searchTemplate.candidateList[temp].type == this.searchTemplate.WILDCARD && this.searchTemplate.candidateList[temp].removable == true) {
        this.searchTemplate.candidateList[temp].adder = adder;
        size += adder;
        adder = adder * 2;
      }
    }
    size += 1;
    for (temp = 0; temp < size; temp++) {
      var i;
      this.numberOfTerms = this.searchTemplate.candidateList.length;
      for (i = 0; i < this.searchTemplate.candidateList.length; i++) {
        if (this.searchTemplate.candidateList[i].type == this.searchTemplate.WILDCARD && this.searchTemplate.candidateList[i].removable == true) {
          if (temp & this.searchTemplate.candidateList[i].adder) {
            this.numberOfTerms--;
            this.searchTemplate.candidateList[i].isRemoved = true;
          } else
            this.searchTemplate.candidateList[i].isRemoved = false;
        }
      }
      this.splitResult(doc, rawText, sunitId, id);
    }

  }

  writeFileResult(data) {
    this.numberOfTerms = this.searchTemplate.candidateList.length;
    this.scrollId = data._scroll_id;
    this.response = new ElasticClass(data);
    var docs = this.response.getDocs();
    this.pagePos += docs.length;
    for (var temp = 0; temp < docs.length; temp++) {
      if (this.curIndex.includeLemma == true) {
        this.posList = this.tools.splitTextInWordList(this.response.getSingleFieldFromDoc(docs[temp], "pos"));
        //        this.lemmaList = this.tools.splitTextInWordList(this.response.getSingleFieldFromDoc(docs[temp], "lemma"));
        this.mixedLine = this.response.getSingleFieldFromDoc(docs[temp], "mixed");
        var b = this.response.getSingleFieldFromDoc(docs[temp], "rawWordForms");
        var q = b.replace(this.spaceSplitter, "####");
        this.gRawWordForms = q.split("####");
        b = this.response.getSingleFieldFromDoc(docs[temp], "lemma");
        q = b.replace(this.spaceSplitter, "####");
        this.lemmaList = q.split("####");
      }
      if (this.searchTemplate.jumpWordEnabled == false)
        this.splitResult(docs[temp], this.response.getSingleFieldFromDoc(docs[temp], "rawText"), this.response.getSingleFieldFromDoc(docs[temp], "sunitId"), this.response.getMetadataFieldFromDoc(docs[temp], "_id"));
      else
        this.fileSplitJump(docs[temp], this.response.getSingleFieldFromDoc(docs[temp], "rawText"), this.response.getSingleFieldFromDoc(docs[temp], "sunitId"), this.response.getMetadataFieldFromDoc(docs[temp], "_id"));
    }
    var formData: any = new Object();
    formData.file = this.userId;
    if (this.fileSort == true) {
      this.listToWrite = this.listToWrite.replace(/<span[^>]+>/g, "");
      this.listToWrite = this.listToWrite.replace(/<a href[^>]+>/g, "");
      this.listToWrite = this.listToWrite.replace(/<\/span>/g, "");
      this.listToWrite = this.listToWrite.replace(/<\/a>/g, "");
    }
    formData.data = this.listToWrite;
    this.listToWrite = "";
    if (this.firstWrite == true)
      formData.mode = "wb";
    else
      formData.mode = "ab";
    this.firstWrite = false;
    this.setCallBack(this.continueFileSearch, "writefileresult");
    this.postPhpReturnText("postToFile.php", formData);
  }


  splitResult(doc, rawText, sunitId, id) {
    var wordList;
    var wl;
    if (rawText == "" || rawText == undefined || rawText == null) {
      this.errorDocs++;
      return;
    }
    if (this.curIndex.includeLemma == true && this.searchTemplate.qRawText == false) {
      wordList = this.gRawWordForms;
      wl = new Array();
      for (var t = 0; t < wordList.length; t++)
        wl.push(wordList[t].toLowerCase());
      if (this.lemmaList.length != wordList.length) {
        this.errorDocs++;
        return;
      }
      if (this.posList.length != wordList.length) {
        this.errorDocs++;

        return;
      }
    } else {
      wordList = this.tools.splitTextInWordList(rawText);
      wl = this.tools.splitTextInWordList(rawText.toLowerCase());
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
      if (this.searchTemplate.qMatch(wl, temp, this.posList, this.lemmaList) == true) {
        this.numberOfMatches += 1;
        let startPos = offset[temp];
        let endPos = offset[temp + (this.numberOfTerms - 1)];
        endPos = endPos + wordList[temp + (this.numberOfTerms - 1)].length;
        let middleString = this.tools.prefix + rawText.substring(startPos, endPos) + this.tools.postfix;
        let firstString = rawText.substring(0, startPos);
        let endString = rawText.substring(endPos);
        if (firstString.length > ToolsCorpus.surroundLength) {
          firstString = firstString.substring(firstString.length - ToolsCorpus.surroundLength);
          pos = firstString.indexOf(" ");
          if (pos != -1)
            firstString = "..." + firstString.substring(pos);
        } else if (this.curIndex.containContext == true)
          firstString = this.fillLeftContext(doc, firstString);
        if (endString.length > ToolsCorpus.surroundLength) {
          endString = endString.substring(0, ToolsCorpus.surroundLength);
          pos = endString.lastIndexOf(" ");
          if (pos != -1)
            endString = endString.substring(0, pos);
          endString += "...";
        } else if (this.curIndex.containContext == true)
          endString = this.fillRightContext(doc, endString);
        middleString = middleString.trim();
        middleString = "<a href='javascript:loadContext(\"" + id + "\")'>" + middleString + "</a>";
        firstString = firstString.trim();
        endString = endString.trim();
        //      
        this.insertInList(firstString, middleString, endString, sunitId);
        this.insertLabels(doc);
      }
    }
  }


  fillRightContext(doc, str) {
    let surround = ToolsCorpus.surroundLength - 5;
    let delim = " <span class='context-delim'>[.]</span> ";
    let right = this.response.getSingleFieldFromDoc(doc, "rightContext");
    if (right == "" || right == undefined || right == null)
      return str;
    if ((str.length + right.length) < ToolsCorpus.surroundLength)
      return str + delim + "<span class='surround-context'>" + right + "</span>";
    var append = ToolsCorpus.surroundLength - str.length;
    /*  if(right.length < append)
        return str+delim+"<span class='surround-context'>"+right+"</span>";*/
    right = right.substring(0, append);
    return str + delim + "<span class='surround-context'>" + right + "...</span>";
  }



  fillLeftContext(doc, str) {
    let surround = ToolsCorpus.surroundLength - 5;
    let delim = " <span class='context-delim'>[.]</span> ";
    let left = this.response.getSingleFieldFromDoc(doc, "leftContext");
    if (left == "" || left == undefined || left == null)
      return str;
    if ((str.length + left.length) < ToolsCorpus.surroundLength)
      return "<span class='surround-context'>" + left + "</span>" + delim + str;
    var append = ToolsCorpus.surroundLength - str.length;
    /*  if(left.length < append)
        return "<span class='surround-context'>"+left+"</span>"+ delim + str;*/
    left = left.substring(left.length - append);
    return "<span class='surround-context'>..." + left + "</span>" + delim + str;
  }

  insertInList(start: string, middle: string, right: string, sunitId) {
    var chosen = (<HTMLSelectElement>document.getElementById("selectSort")).value;
    var sortString;
    switch (chosen) {
      case 'left':
        sortString = this.tools.createLeftString(start);
        break;
      case "middle":
        sortString = this.tools.pickUpMatchWords(middle) + " " + right.trim();
        break;
      case "right":
        var pos = right.indexOf("<span");
        if (pos != -1)
          sortString = right.substring(0, pos);
        else
          sortString = right;
        break;
      case 'document':
        sortString = sunitId;
        break;
      default:
        sortString = "";
        break;
    }
    this.listToWrite += sortString.toLowerCase() + "\t" + start + "\t" + middle + "\t" + right + "\t" + sunitId + "\n";
  }


  continueFileSearch() {
    var hits = this.response.getDocCount();
    let formData: any;
    if (this.pagePos >= hits) {
      formData = new Object();
      document.getElementById("labelSpan").innerHTML = "Sorting!";
      formData.file = this.userId;
      if (this.fileSort == false) {
        this.setCallBack(this.loadResult, "continuefilesearch 1");
        this.postPhpReturnText("sortFile.php", formData);
      } else {
        this.setCallBack(this.finishSaveFile, "continuefilesearch 2");
        this.postPhpReturnText("sortSave.php", formData);
      }
      return;
    }
    formData = new Object();
    document.getElementById("labelSpan").innerHTML = "Fetching matches  found so far " + this.numberOfMatches + ": Done " + Math.floor((this.pagePos * 100)/hits) + "%";
    //    formData.resturl = this.curIndex.index + "/" + this.curIndex.type + "_search/scroll/";
    /*  let elasticdata: any = new Object();
      elasticdata.scroll = "1m";
      elasticdata.scroll_id = this.scrollId;
      elasticdata.size = ToolsCorpus.pageSize;//xxxx
  */
    formData.resturl = "_search/scroll?scroll=5m&scroll_id=" + this.scrollId + "&";
    //    formData.resturl = "searchICEScroll?scroll=5m&scrollId="this.scrollId);
    formData.elasticdata = "";
    this.setCallBack(this.writeFileResult, "continue filesearch 3");
    this.postPhp(formData,this.curIndex.dataPort+"/search?scroll=5m&scrollId=" + this.scrollId);
  }


  loadResult() {
    let formData: any = new Object();
    formData.offset = 0;
    formData.file = this.userId + "_sorted";
    formData.lines = ToolsCorpus.pageSize;
    this.setCallBack(this.writeSortedPage, "loadresult 1");
    this.postPhpReturnJson("loadSortedPage.php", formData);
    var str = "Number of matches: " + this.numberOfMatches;
    if (this.errorDocs > 0)
      str += ". Number of not handled records: " + this.errorDocs;
    document.getElementById("labelSpan").innerHTML = str;
    this.updateLabels();
  }

  finishSaveFile(data) {
    var formData: any = new Object();
    this.setCallBack(this.insertFileLink, "finishsavefile");
    this.postPhpReturnText("linkToSortResult.php", formData);
    //new
    this.updateLabels();
    
  }

  writeSortedPage(data) {
    this.sortedPage = data;
    let temp;
    this.tools.clearTable('tableBody');
    var l;
    if (this.numberOfMatches > ToolsCorpus.maxResult)
      this.tools.showSortDiv(true);
    else
      this.tools.showSortDiv(false);
    for (temp = 0; temp < this.sortedPage.lines.length; temp++) {
      l = this.sortedPage.lines[temp].split("\t");
      if (l.length != 5) {
        continue;
      }
      this.tools.insertContentInTable(l[1], l[2], l[3], l[4]);
    }
    if (this.sortedPage.lines.length < ToolsCorpus.pageSize)
      (<HTMLButtonElement>document.getElementById('nextButtonId')).disabled = true;
    else
    (<HTMLButtonElement>document.getElementById('nextButtonId')).disabled = false;
    (<HTMLInputElement>document.getElementById("range")).value = this.sortedPage.startOffset;
    document.getElementById('textDiv').scrollTop = 0;
    if (this.slider == null && this.numberOfMatches > ToolsCorpus.pageSize)
      this.writeSampleFile();
  }

  nextSortedPage() {
    let formData: any = new Object();
    formData.offset = this.sortedPage.endOffset;
    formData.file = userId + "_sorted";
    formData.lines = ToolsCorpus.pageSize;
    postPhpReturnJson("loadSortedPage.php", formData, this.writeSortedPage);
    //  loadSortedPage(formData,writeSortedPage);
  }

  writeSampleFile() {
    let formData: any = new Object();
    formData.file = this.userId + "_sorted";
    formData.sample = this.sampleSize;
    //  loadSampleFile(formData,initSlider);
    this.setCallBack(this.initSlider, "writesamplefile");
    this.postPhpReturnJson("loadSampleFile.php", formData);

  }

  initSlider(data) {
    this.slider = data;
    (<HTMLInputElement>document.getElementById("range")).max = this.slider.filelength;
    (<HTMLProgressElement>document.getElementById("range")).value = 0;
  }

  insertFileLink(data) {
    document.getElementById('labelSpan').innerHTML = "<a href='" + data + "'>Download sorted file</a>";
    alert("You can now download the sorted result!");
  }

  //slider functions
  whenMouseDownSlider(value) {
    document.getElementById('slidetextdiv').style.visibility = "visible";
    this.showValue(value);
  }

  showValue(newValue) {
    if (this.slider == null)
      return;
    var temp;
    for (temp = 0; temp < this.slider.samples.length; temp++) {
      if (this.slider.samples[temp].offset > newValue)
        break;
    }
    if (temp == this.slider.samples.length) {
      document.getElementById('slidetextdiv').style.visibility = "hidden";
      return;
    }


    var clientHeight = document.getElementById('textDiv').clientHeight;
    var clientWidth = document.getElementById('textDiv').clientWidth;
    var o = this.findPosObject(document.getElementById("textDiv"));


    let div = <HTMLDivElement>document.getElementById('slidetextdiv');

    div.style.top = window.innerHeight / 2 + "px";
    div.style.top = (o[1] + (clientHeight / 2)).toLocaleString();


    var c = window.innerWidth / 2;
    div.style.left = (c - (document.getElementById("slidetextdiv").offsetWidth / 2)) + "px";

    div.style.left = (o[0] + (clientWidth / 2) - (div.clientWidth / 2)).toString();
    document.getElementById('slidetextdiv').innerHTML = this.slider.samples[temp].line;
  }

  findPosObject(obj) {

    var curleft = 0;
    var curtop = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
    }
    return [curleft, curtop];
  }

  setTextFromSlider(value) {
    var temp;
    var offset;
    for (temp = 0; temp < this.slider.samples.length; temp++) {
      if (this.slider.samples[temp].offset > value)
        break;
    }
    offset = this.slider.samples[temp].offset;
    if (offset > 500)
      offset = offset - 500;
    document.getElementById("slidetextdiv").style.visibility = 'hidden';
    let formData: any = new Object();
    formData.offset = offset;
    formData.file = this.userId + "_sorted";
    formData.lines = ToolsCorpus.pageSize;
    this.setCallBack(this.writeSortedPage, "setTextFromSlider");
    this.postPhpReturnJson("loadSortedPage.php", formData);
    //  loadSortedPage(formData,writeSortedPage);
  }


  insertLabels(doc) {
    var temp;
    var i;
    for (temp = 0; temp < this.curIndex.aggregations.length; temp++) {
      if (this.curIndex.aggregations[temp].inSearch == false)
        continue;
      var agg = this.response.getSingleFieldFromDoc(doc, this.curIndex.aggregations[temp].fieldName);

      for (i = 0; i < this.curIndex.aggregations[temp].labels.length; i++)
        if (agg == this.curIndex.aggregations[temp].labels[i]) {
          this.curIndex.aggregations[temp].counts[i] = this.curIndex.aggregations[temp].counts[i] + 1;
          break;
        }
    }
  }



  updateLabels() {
    var temp;
    var sel = null;
    for (temp = 0; temp < this.curIndex.aggregations.length; temp++) {
      if (curIndex.aggregations[temp].inSearch == false)
        continue;
      sel = document.getElementById("select" + temp);
      for (var i = 0; i < this.curIndex.aggregations[temp].counts.length; i++) {
        sel.options[i + 1].text = sel.options[i + 1].value + " (" + this.curIndex.aggregations[temp].counts[i] + ")";
      }
    }
  }

  //-------------------------------------------post functions
  postPhp(formData,dataPort) {
    dataPort="/textcorpus/api/"+dataPort;
    $.ajax({
//      url: "passpost.php",
      url:dataPort,
      type: 'post',
      data: formData.elasticdata,
      contentType:'application/json',      
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("accessTokenCorpus"),
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert('Sorry. You have to log in again.');
        sessionStorage.setItem("accessTokenCorpus", null);
        window.location.href = "index.html";
      },
      success: this.postPhpOnSuccess,
      dataType: "json"
    });
  }


  postPhpReturnText(urlToCall, formData) {
    $.ajax({
      url: urlToCall,
      type: 'post',
      data: formData,
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
      },
      success: this.postPhpOnSuccess
    });
  }

  postPhpReturnJson(urlToCall, formData) {
    $.ajax({
      url: urlToCall,
      type: 'post',
      data: formData,
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
      },
      success: this.postPhpOnSuccess,
      dataType: "json"
    });
  }


}