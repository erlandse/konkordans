var ToolsCorpus = (function () {
    function ToolsCorpus() {
        this.wordSplitter = new RegExp("([\\s.,;:\"\(\)\{\}<>$+=!\\[\\]\\*—\\?\\#_\&%€£@~]+)", "g");
        this.prefix = "<span class=\"upmark\">";
        this.postfix = "<\/span>";
        this.surroundLength = 56;
        this.pageSize = 1000;
        this.maxResult = 1000;
    }
    ToolsCorpus.prototype.splitTextInWordList = function (text) {
        var str = text.replace(this.wordSplitter, "####");
        var l = str.split("####");
        var l2 = new Array();
        for (var temp = 0; temp < l.length; temp++)
            if (l[temp].length != 0)
                l2.push(l[temp]);
        return l2;
    };
    ToolsCorpus.addOption = function (elSel, text, value) {
        var elOptNew = document.createElement('option');
        elOptNew.text = text;
        elOptNew.value = value;
        elSel.appendChild(elOptNew);
    };
    ToolsCorpus.removeOptionSelected = function (selectId) {
        var elSel = document.getElementById(selectId);
        var i;
        for (i = elSel.length - 1; i >= 0; i--) {
            if (elSel.options[i].selected) {
                elSel.remove(i);
            }
        }
    };
    ToolsCorpus.removeAllOptions = function (selectId) {
        var elSel = document.getElementById(selectId);
        while (elSel.length > 0)
            elSel.remove(elSel.length - 1);
    };
    ToolsCorpus.selectAllOptions = function (selectId) {
        var sel = document.getElementById(selectId);
        for (var temp = 0; temp < sel.length; temp++)
            sel.options[temp].selected = true;
    };
    ToolsCorpus.gup = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null)
            return "";
        else
            return results[1];
    };
    ToolsCorpus.prototype.createLeftString = function (str) {
        var pos = str.lastIndexOf("</span>");
        if (pos != -1)
            str = str.substring(pos + 7);
        var wl = this.splitTextInWordList(str);
        if (wl.length == 0)
            return "";
        var temp = wl.length - 1;
        var ret = "";
        while (temp >= 0) {
            ret += wl[temp] + " ";
            temp--;
        }
        return ret;
    };
    ToolsCorpus.prototype.pickUpMatchWords = function (str) {
        var pos = str.indexOf(this.prefix, 0);
        var pos2 = str.indexOf(this.postfix, pos);
        return str.substring(pos + this.prefix.length, pos2);
    };
    ToolsCorpus.prototype.clearTable = function (tableId) {
        document.getElementById(tableId).innerHTML = "";
    };
    ToolsCorpus.prototype.showSortDiv = function (show) {
        if (show == false)
            document.getElementById('sortDiv').style.visibility = 'hidden';
        else
            document.getElementById('sortDiv').style.visibility = 'visible';
    };
    ToolsCorpus.prototype.insertContentInTable = function (content1, content2, content3, sunitId) {
        var table = document.getElementById('tableBody');
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
    };
    return ToolsCorpus;
}());
