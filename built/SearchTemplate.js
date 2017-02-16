var SearchTemplate = (function () {
    function SearchTemplate(searchString, p) {
        this.TERM = 0;
        this.POS = 1;
        this.LEMMA = 2;
        this.WILDCARD = 3;
        this.posArray = null;
        this.spaceSplitter = new RegExp("([\\s]+)", "g");
        this.qRawText = true;
        this.jumpWordEnabled = false;
        this.debugger = false;
        this.posArray = p;
        this.buildCandidateList(searchString);
    }
    SearchTemplate.prototype.expandPos = function (str) {
        var arr = new Array();
        var temp;
        for (temp = 0; temp < this.posArray.length; temp++) {
            var l = this.posArray[temp].split("-");
            if (l.length == 2) {
                if (l[1].startsWith(str))
                    arr.push(this.posArray[temp]);
            }
            if (l[0].startsWith(str))
                arr.push(this.posArray[temp]);
        }
        return arr;
    };
    SearchTemplate.prototype.buildCandidateList = function (b) {
        b = b.replace(/\*\*/g, "* *");
        b = b.replace(/\+/g, " + ");
        b = b.replace(/([\(\[<])/g, " $1");
        b = b.replace(/([\)\]>])/g, "$1 ");
        b = b.trim();
        var qu;
        qu = b.replace(this.spaceSplitter, "####");
        var c = qu.split("####");
        var temp;
        this.jumpWordEnabled = false;
        this.candidateList = new Array();
        for (temp = 0; temp < c.length; temp++) {
            var obj = new Object();
            obj.token = c[temp];
            if (obj.token.charAt(0) == '<' && obj.token.charAt(obj.token.length - 1) == '>') {
                obj.type = this.POS;
                obj.token = obj.token.substring(1, obj.token.length - 1);
                obj.token = obj.token.toUpperCase();
                obj.token = obj.token.replace(/\*/g, "");
                obj.list = new Array();
                var l = obj.token.split("|");
                for (var i = 0; i < l.length; i++) {
                    obj.list = obj.list.concat(this.expandPos(l[i]));
                }
                this.qRawText = false;
            }
            else if (obj.token.charAt(0) == '[' && obj.token.charAt(obj.token.length - 1) == ']') {
                obj.type = this.LEMMA;
                obj.token = obj.token.substring(1, obj.token.length - 1);
                obj.token = obj.token.toUpperCase();
                obj.list = obj.token.split("|");
                this.qRawText = false;
            }
            else if (obj.token.charAt(0) == '(' && obj.token.charAt(obj.token.length - 1) == ')') {
                obj.type = this.TERM;
                obj.token = obj.token.substring(1, obj.token.length - 1);
                obj.list = obj.token.split("|");
            }
            else {
                if (obj.token.indexOf("*") == -1 && obj.token.indexOf("?") == -1 && obj.token != "+") {
                    obj.type = this.TERM;
                    obj.list = null;
                }
                else {
                    if (obj.token == "*") {
                        obj.removable = true;
                        this.jumpWordEnabled = true;
                    }
                    else
                        obj.removable = false;
                    if (obj.token == "+")
                        obj.token = "*";
                    var q = new RegExp("[\\?]", "g");
                    var s = new RegExp("[\\*]", "g");
                    var question = "[^\\s.,;:\"\(\)<>$+=!\\[\\]\\*—\\?\\#_\&%€£]";
                    var star = "[^\\s.,;:\"\(\)<>$+=!\\[\\]\\*—\\?\\#_\&%€£]*";
                    var str = obj.token;
                    str = "^" + str + "$";
                    str = str.replace(q, question);
                    str = str.replace(s, star);
                    var reg = new RegExp(str);
                    obj.wildcard = reg;
                    obj.type = this.WILDCARD;
                }
            }
            this.candidateList.push(obj);
        }
    };
    SearchTemplate.prototype.calculateSlop = function () {
        var temp;
        var slop = 0;
        for (temp = 0; temp <= this.candidateList.length - 2; temp++) {
            switch (this.candidateList[temp].type) {
                case this.TERM:
                case this.WILDCARD:
                    if (this.candidateList[temp + 1].type == this.TERM || this.candidateList[temp + 1].type == this.WILDCARD)
                        slop += 2;
                    if (this.candidateList[temp + 1].type == this.POS)
                        slop += 4;
                    if (this.candidateList[temp + 1].type == this.LEMMA)
                        slop += 3;
                    break;
                case this.LEMMA:
                    if (this.candidateList[temp + 1].type == this.TERM || this.candidateList[temp + 1].type == this.WILDCARD)
                        slop += 1;
                    if (this.candidateList[temp + 1].type == this.POS)
                        slop += 3;
                    if (this.candidateList[temp + 1].type == this.LEMMA)
                        slop += 2;
                    break;
                case this.POS:
                    if (this.candidateList[temp + 1].type == this.TERM || this.candidateList[temp + 1].type == this.WILDCARD)
                        slop += 0;
                    if (this.candidateList[temp + 1].type == this.POS)
                        slop += 2;
                    if (this.candidateList[temp + 1].type == this.LEMMA)
                        slop += 1;
            }
        }
        return slop;
    };
    SearchTemplate.prototype.qMatch = function (wl, pos, posList, lemmaList) {
        var temp;
        for (temp = 0; temp < this.candidateList.length; temp++) {
            if (pos >= wl.length)
                return false;
            if (this.candidateList[temp].type == this.TERM) {
                if (this.candidateList[temp].list == null) {
                    if (wl[pos] != this.candidateList[temp].token)
                        break;
                }
                else {
                    var i;
                    var found = false;
                    for (i = 0; i < this.candidateList[temp].list.length; i++) {
                        if (wl[pos] == this.candidateList[temp].list[i])
                            found = true;
                    }
                    if (found != true)
                        break;
                }
            }
            if (this.candidateList[temp].type == this.POS) {
                var i;
                var found = false;
                for (i = 0; i < this.candidateList[temp].list.length; i++) {
                    if (posList[pos].startsWith(this.candidateList[temp].list[i]))
                        found = true;
                }
                if (found != true)
                    break;
            }
            if (this.candidateList[temp].type == this.LEMMA) {
                var i;
                var found = false;
                for (i = 0; i < this.candidateList[temp].list.length; i++) {
                    if (lemmaList[pos] == this.candidateList[temp].list[i])
                        found = true;
                }
                if (found != true)
                    break;
            }
            if (this.candidateList[temp].type == this.WILDCARD) {
                if (this.candidateList[temp].removable == true && this.candidateList[temp].isRemoved == true) {
                    continue;
                }
                var match = this.candidateList[temp].wildcard.exec(wl[pos]);
                if (match == null)
                    break;
            }
            pos++;
        }
        return temp == this.candidateList.length ? true : false;
    };
    return SearchTemplate;
}());
