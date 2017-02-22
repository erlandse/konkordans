var FileResult = (function () {
    function FileResult(searchOb, searchTemp, fS, curI, userId) {
        this.listToWrite = null;
        this.firstWrite = false;
        this.userId = "erlandse";
        this.numberOfTerms = 0;
        this.sampleSize = 500;
        this.slider = null;
        this.spaceSplitter = new RegExp("([\\s]+)", "g");
        this.sortedPage = null;
        this.tools = new ToolsCorpus();
        this.searchObject = searchOb;
        this.searchTemplate = searchTemp;
        this.fileSort = fS;
        this.curIndex = curI;
        this.userId = userId;
        this.postPhp = this.postPhp.bind(this);
        this.postNoDataPort = this.postNoDataPort.bind(this);
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
    FileResult.prototype.initCountAggregations = function () {
        var temp;
        var counter = 0;
        for (temp = 0; temp < this.curIndex.aggregations.length; temp++)
            if (this.curIndex.aggregations[temp].inSearch == true) {
                this.curIndex.aggregations[temp].counts = new Array();
                for (var i = 0; i < this.curIndex.aggregations[temp].labels.length; i++) {
                    this.curIndex.aggregations[temp].counts.push(counter);
                }
            }
    };
    FileResult.prototype.setCallBack = function (f, caller) {
        this.postCallBack = f;
    };
    FileResult.prototype.initFileResult = function () {
        document.getElementById("felt").value = "";
        this.listToWrite = "";
        var formData;
        formData = new Object();
        this.firstWrite = true;
        this.numberOfMatches = 0;
        this.errorDocs = 0;
        this.pagePos = 0;
        formData.resturl = this.curIndex.index + "/" + this.curIndex.type + "/_search?scroll=1m";
        //  formdData,resurl = "searchICEScroll?scroll=1m";
        formData.elasticdata = JSON.stringify(this.searchObject, null, 2);
        this.setCallBack(this.writeFileResult, "initFileResult");
        if (this.curIndex.dataPort != "")
            this.postPhp(formData, this.curIndex.dataPort + "/search?scroll=1m");
        else
            this.postNoDataPort(formData);
    };
    FileResult.prototype.postPhpOnSuccess = function (data) {
        this.postCallBack(data);
    };
    FileResult.prototype.fileSplitJump = function (doc, rawText, sunitId, id) {
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
                    }
                    else
                        this.searchTemplate.candidateList[i].isRemoved = false;
                }
            }
            this.splitResult(doc, rawText, sunitId, id);
        }
    };
    FileResult.prototype.writeFileResult = function (data) {
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
        var formData = new Object();
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
    };
    FileResult.prototype.splitResult = function (doc, rawText, sunitId, id) {
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
        }
        else {
            wordList = this.tools.splitTextInWordList(rawText);
            wl = this.tools.splitTextInWordList(rawText.toLowerCase());
        }
        var offset = new Array();
        var pos = 0;
        var temp;
        for (temp = 0; temp < wordList.length; temp++) {
            pos = rawText.indexOf(wordList[temp], pos);
            offset.push(pos);
            pos += wordList[temp].length;
        }
        for (temp = 0; temp < wl.length; temp++) {
            if (this.searchTemplate.qMatch(wl, temp, this.posList, this.lemmaList) == true) {
                this.numberOfMatches += 1;
                var startPos = offset[temp];
                var endPos = offset[temp + (this.numberOfTerms - 1)];
                endPos = endPos + wordList[temp + (this.numberOfTerms - 1)].length;
                var middleString = this.tools.prefix + rawText.substring(startPos, endPos) + this.tools.postfix;
                var firstString = rawText.substring(0, startPos);
                var endString = rawText.substring(endPos);
                if (firstString.length > ToolsCorpus.surroundLength) {
                    firstString = firstString.substring(firstString.length - ToolsCorpus.surroundLength);
                    pos = firstString.indexOf(" ");
                    if (pos != -1)
                        firstString = "..." + firstString.substring(pos);
                }
                else if (this.curIndex.containContext == true)
                    firstString = this.fillLeftContext(doc, firstString);
                if (endString.length > ToolsCorpus.surroundLength) {
                    endString = endString.substring(0, ToolsCorpus.surroundLength);
                    pos = endString.lastIndexOf(" ");
                    if (pos != -1)
                        endString = endString.substring(0, pos);
                    endString += "...";
                }
                else if (this.curIndex.containContext == true)
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
    };
    FileResult.prototype.fillRightContext = function (doc, str) {
        var surround = ToolsCorpus.surroundLength - 5;
        var delim = " <span class='context-delim'>[.]</span> ";
        var right = this.response.getSingleFieldFromDoc(doc, "rightContext");
        if (right == "" || right == undefined || right == null)
            return str;
        if ((str.length + right.length) < ToolsCorpus.surroundLength)
            return str + delim + "<span class='surround-context'>" + right + "</span>";
        var append = ToolsCorpus.surroundLength - str.length;
        /*  if(right.length < append)
            return str+delim+"<span class='surround-context'>"+right+"</span>";*/
        right = right.substring(0, append);
        return str + delim + "<span class='surround-context'>" + right + "...</span>";
    };
    FileResult.prototype.fillLeftContext = function (doc, str) {
        var surround = ToolsCorpus.surroundLength - 5;
        var delim = " <span class='context-delim'>[.]</span> ";
        var left = this.response.getSingleFieldFromDoc(doc, "leftContext");
        if (left == "" || left == undefined || left == null)
            return str;
        if ((str.length + left.length) < ToolsCorpus.surroundLength)
            return "<span class='surround-context'>" + left + "</span>" + delim + str;
        var append = ToolsCorpus.surroundLength - str.length;
        /*  if(left.length < append)
            return "<span class='surround-context'>"+left+"</span>"+ delim + str;*/
        left = left.substring(left.length - append);
        return "<span class='surround-context'>..." + left + "</span>" + delim + str;
    };
    FileResult.prototype.insertInList = function (start, middle, right, sunitId) {
        var chosen = document.getElementById("selectSort").value;
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
    };
    FileResult.prototype.continueFileSearch = function () {
        var hits = this.response.getDocCount();
        var formData;
        if (this.pagePos >= hits) {
            formData = new Object();
            document.getElementById("labelSpan").innerHTML = "Sorting!";
            formData.file = this.userId;
            if (this.fileSort == false) {
                this.setCallBack(this.loadResult, "continuefilesearch 1");
                this.postPhpReturnText("sortFile.php", formData);
            }
            else {
                this.setCallBack(this.finishSaveFile, "continuefilesearch 2");
                this.postPhpReturnText("sortSave.php", formData);
            }
            return;
        }
        formData = new Object();
        document.getElementById("labelSpan").innerHTML = "Fetching matches  found so far " + this.numberOfMatches + ": Done " + Math.floor((this.pagePos * 100) / hits) + "%";
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
        if (curIndex.dataPort != "")
            this.postPhp(formData, this.curIndex.dataPort + "/search?scroll=5m&scrollId=" + this.scrollId);
        else
            this.postNoDataPort(formData);
    };
    FileResult.prototype.loadResult = function () {
        var formData = new Object();
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
    };
    FileResult.prototype.finishSaveFile = function (data) {
        var formData = new Object();
        this.setCallBack(this.insertFileLink, "finishsavefile");
        this.postPhpReturnText("linkToSortResult.php", formData);
        //new
        this.updateLabels();
    };
    FileResult.prototype.writeSortedPage = function (data) {
        this.sortedPage = data;
        var temp;
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
            document.getElementById('nextButtonId').disabled = true;
        else
            document.getElementById('nextButtonId').disabled = false;
        document.getElementById("range").value = this.sortedPage.startOffset;
        document.getElementById('textDiv').scrollTop = 0;
        if (this.slider == null && this.numberOfMatches > ToolsCorpus.pageSize)
            this.writeSampleFile();
    };
    FileResult.prototype.nextSortedPage = function () {
        var formData = new Object();
        formData.offset = this.sortedPage.endOffset;
        formData.file = userId + "_sorted";
        formData.lines = ToolsCorpus.pageSize;
        postPhpReturnJson("loadSortedPage.php", formData, this.writeSortedPage);
        //  loadSortedPage(formData,writeSortedPage);
    };
    FileResult.prototype.writeSampleFile = function () {
        var formData = new Object();
        formData.file = this.userId + "_sorted";
        formData.sample = this.sampleSize;
        //  loadSampleFile(formData,initSlider);
        this.setCallBack(this.initSlider, "writesamplefile");
        this.postPhpReturnJson("loadSampleFile.php", formData);
    };
    FileResult.prototype.initSlider = function (data) {
        this.slider = data;
        document.getElementById("range").max = this.slider.filelength;
        document.getElementById("range").value = 0;
    };
    FileResult.prototype.insertFileLink = function (data) {
        document.getElementById('labelSpan').innerHTML = "<a href='" + data + "'>Download sorted file</a>";
        alert("You can now download the sorted result!");
    };
    //slider functions
    FileResult.prototype.whenMouseDownSlider = function (value) {
        document.getElementById('slidetextdiv').style.visibility = "visible";
        this.showValue(value);
    };
    FileResult.prototype.showValue = function (newValue) {
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
        var div = document.getElementById('slidetextdiv');
        div.style.top = window.innerHeight / 2 + "px";
        div.style.top = (o[1] + (clientHeight / 2)).toLocaleString();
        var c = window.innerWidth / 2;
        div.style.left = (c - (document.getElementById("slidetextdiv").offsetWidth / 2)) + "px";
        div.style.left = (o[0] + (clientWidth / 2) - (div.clientWidth / 2)).toString();
        document.getElementById('slidetextdiv').innerHTML = this.slider.samples[temp].line;
    };
    FileResult.prototype.findPosObject = function (obj) {
        var curleft = 0;
        var curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }
        return [curleft, curtop];
    };
    FileResult.prototype.setTextFromSlider = function (value) {
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
        var formData = new Object();
        formData.offset = offset;
        formData.file = this.userId + "_sorted";
        formData.lines = ToolsCorpus.pageSize;
        this.setCallBack(this.writeSortedPage, "setTextFromSlider");
        this.postPhpReturnJson("loadSortedPage.php", formData);
        //  loadSortedPage(formData,writeSortedPage);
    };
    FileResult.prototype.insertLabels = function (doc) {
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
    };
    FileResult.prototype.updateLabels = function () {
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
    };
    //-------------------------------------------post functions
    FileResult.prototype.postPhp = function (formData, dataPort) {
        dataPort = "/textcorpus/api/" + dataPort;
        $.ajax({
            //      url: "passpost.php",
            url: dataPort,
            type: 'post',
            data: formData.elasticdata,
            contentType: 'application/json',
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
    };
    FileResult.prototype.postNoDataPort = function (formData) {
        $.ajax({
            url: "passpost.php",
            type: 'post',
            data: formData,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
            },
            success: this.postPhpOnSuccess,
            dataType: "json"
        });
    };
    ;
    FileResult.prototype.postPhpReturnText = function (urlToCall, formData) {
        $.ajax({
            url: urlToCall,
            type: 'post',
            data: formData,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
            },
            success: this.postPhpOnSuccess
        });
    };
    FileResult.prototype.postPhpReturnJson = function (urlToCall, formData) {
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
    };
    return FileResult;
}());
