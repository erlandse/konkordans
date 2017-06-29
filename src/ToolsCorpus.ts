class ToolsCorpus {
    wordSplitter = new RegExp("([\\s.,;:\"\(\)\{\}<>$+=!\\[\\]\\*—\\?\\#_\&%€£@~]+)", "g");
    
    prefix:string = "<span class=\"upmark\">";
    postfix:string = "<\/span>";
    static surroundLength = 56;
    static pageSize = 1000;
    static maxResult = 1000;

    constructor() {

    }

    splitTextInWordList(text) {
        const str = text.replace(this.wordSplitter, "####");
        const l = str.split("####");
        
        const l2 = new Array();
        for (let temp = 0; temp < l.length; temp++)
            if (l[temp].length != 0)
                l2.push(l[temp]);
        return l2;
    }

 static   addOption(elSel: HTMLSelectElement, text: string, value: any) {
        let elOptNew: HTMLOptionElement = document.createElement('option');
        elOptNew.text = text;
        elOptNew.value = value;
        elSel.appendChild(elOptNew);
    }

  static  removeOptionSelected(selectId: string) {
        let elSel: any = <HTMLSelectElement>document.getElementById(selectId);
        var i;
        for (i = elSel.length - 1; i >= 0; i--) {
            if (elSel.options[i].selected) {
                elSel.remove(i);
            }
        }
    }

   static removeAllOptions(selectId: string) {
        let elSel: HTMLSelectElement = <HTMLSelectElement>document.getElementById(selectId);
        while (elSel.length > 0)
            elSel.remove(elSel.length - 1);
    }

   static selectAllOptions(selectId: string) {
        let sel: any = <HTMLSelectElement>document.getElementById(selectId);
        for (var temp = 0; temp < sel.length; temp++)
            sel.options[temp].selected = true;
    }

   static gup(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null)
            return "";
        else
            return results[1];
    }


createLeftString(str){
  var pos = str.lastIndexOf("</span>");
  if(pos != -1)
    str = str.substring(pos+7);
  let wl = this.splitTextInWordList(str);
  if(wl.length == 0)
    return "";
  var temp = wl.length -1;  
  let ret = "";
  while (temp >= 0){
    ret += wl[temp] + " ";
    temp --;
  }
  return ret;
}

pickUpMatchWords(str){
  var pos = str.indexOf(this.prefix,0);
  var pos2 = str.indexOf(this.postfix,pos);
  return str.substring(pos+this.prefix.length,pos2);
}

clearTable(tableId){
  document.getElementById(tableId).innerHTML = ""; 
}

showSortDiv(show){
  if(show == false)
   document.getElementById('sortDiv').style.visibility = 'hidden';
  else 
   document.getElementById('sortDiv').style.visibility = 'visible';
}

insertContentInTable(content1,content2,content3,sunitId){
  var table= <HTMLTableElement> document.getElementById('tableBody');
  var row=table.insertRow(-1);
  var cell1=row.insertCell(0);
  cell1.setAttribute("class", "firstLine"); //For Most Browsers
  cell1.setAttribute("className", "firstLine");
  cell1.innerHTML =content1;

  cell1=row.insertCell(1);
  cell1.setAttribute("class", "middleLine"); //For Most Browsers
  cell1.setAttribute("className", "middleLine");
  cell1.innerHTML =content2;

  cell1=row.insertCell(2);
  cell1.innerHTML =content3;
  
  cell1=row.insertCell(3);
  cell1.setAttribute("class", "sunitId"); //For Most Browsers
  cell1.setAttribute("className", "sunitId");
  cell1.innerHTML =sunitId;
}


}