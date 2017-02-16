var curIndex = null;
var CELLS = 3;
var indexObject = null;
function  loadIndexes(){
  for(temp = 0;temp < indexList.length;temp++){
    addOption(document.getElementById("idIndexSelect"),indexList[temp].displayName,indexList[temp].index);
  }
  document.getElementById("idIndexSelect").selectedIndex=0;
  fillMetadataTable();
}

function fillMetadataTable(){
  curIndex = indexList[document.getElementById("idIndexSelect").selectedIndex];
  CELLS = curIndex.cellsInRow;
  clearTable("metadataTable");
  insertAggregationFields();
  initMetadataTable();
  if(curIndex.includeLemma == false)
    fieldName = "rawText";
  else  
    fieldName = "mixed";
  clearTable('tableBody');
  document.getElementById("labelSpan").innerHTML = "";
}

function insertAggregationFields(){
  var temp;
  for(temp=0; temp < curIndex.aggregations.length;temp++){
    var str = "<select id='select"+temp+"' ";
    if(curIndex.aggregations[temp].multiValued == true)
      str += " multiple";
    str += " onclick='changeClick("+temp+")'></select>";
    insertInMetadataTable(curIndex.aggregations[temp].displayName,str,temp%CELLS);
  }
}

function getAggregations(){
  var aggs = new Object();
  for(var temp = 0; temp < curIndex.aggregations.length;temp++){
    var ob = new Object();
    ob.terms = new Object();
    ob.terms.field = curIndex.aggregations[temp].fieldName;
    ob.terms.min_doc_count = 0;
    ob.terms.order = new Object();
    ob.terms.order._term = "asc";
    ob.terms.size = 1000;
    eval("aggs."+ curIndex.aggregations[temp].fieldName+"=ob;");
  }
  return aggs;
}

function getSearchAggregations(){
  var aggs = new Object();
  for(var temp = 0; temp < curIndex.aggregations.length;temp++){
    if(curIndex.aggregations[temp].inSearch == false)
      continue;
    var ob = new Object();
    ob.terms = new Object();
    ob.terms.field = curIndex.aggregations[temp].fieldName;
    ob.terms.min_doc_count = 0;
    ob.terms.order = new Object();
    ob.terms.order._term = "asc";
    ob.terms.size = 1000;
    eval("aggs."+ curIndex.aggregations[temp].fieldName+"=ob;");
  }
  return aggs;
}



function insertInMetadataTable(content1,content2,qRow){
  var table= document.getElementById('metadataTable');
  var row;
  if(qRow == 0)
    row=table.insertRow(-1);
  else
    row= table.rows[table.rows.length-1];
  cellSize = row.cells.length;
  var cell1=row.insertCell(cellSize);

  cell1.innerHTML =content1;
  cell1=row.insertCell(cellSize+1);
  cell1.innerHTML =content2;
}


function initMetadataTable(){
  ob = new Object();
  ob.aggs = getAggregations();
  removeAllOptions("selectWordclasses");
/*  if(curIndex.includeLemma == true){
    var o = new Object();
    o.terms = new Object();
    o.terms.field = "pos";
    o.terms.min_doc_count = 0;
    o.terms.order = new Object();
    o.terms.order._term = "asc";
    ob.aggs.pos = o;
  }*/
  var formData = new Object();
  formData.resturl= curIndex.index+"/"+curIndex.type+"/_search?";
  document.getElementById("felt").value = JSON.stringify(ob,null,2);
  formData.elasticdata = JSON.stringify(ob,null,2);
  postPhp(formData,initMetadataTables);
}

function initMetadataTables(data){
  es = new ElasticClass(data);
  fillAggregations(es);
}

function fillAggregations(es){
  var sel;
  for(var temp = 0; temp < curIndex.aggregations.length;temp++){
     sel = document.getElementById("select"+temp);
     var arr = es.getFacetFieldWithFacetName(curIndex.aggregations[temp].fieldName);
     addOption(sel,curIndex.aggregations[temp].displayEmpty,"");
     for(var i = 0; i < arr.length;i++){
        var bucket = arr[i];
        addOption(sel,bucket.key,bucket.key);
     }
  }
  if(curIndex.includeLemma == false)
    return;
  posArray = new Array();
  sel = document.getElementById("selectWordclasses");
  addOption(sel,"Choose","");
    for(var i = 0; i < curIndex.wordClasses.length;i++){
      addOption(sel,curIndex.wordClasses[i],curIndex.wordClasses[i]);
      posArray.push(curIndex.wordClasses[i]);
    } 
 }

function changeClick(id){
  var el = document.getElementById("select"+id);
  if(el.options[0].selected == true){
    for(temp =1; temp < el.options.length;temp++)
      el.options[temp].selected = false;
  }
}

function addMetadataToQuery(query){
  var el; 
  for(temp = 0; temp < curIndex.aggregations.length;temp++){
    el = document.getElementById("select"+temp);
    if(curIndex.aggregations[temp].multiValued == false){
      if(el.selectedIndex != -1 && el.value != ""){
         var field = JSON.parse("{\""+curIndex.aggregations[temp].fieldName+"\":\""+el.value+"\"}");
         var ob= new Object();
         ob.term=field;
         query.query.bool.filter.bool.must.push(ob);
      }
    }else{
      var str = ""; 
      var arr = new Array();
      for(var i =0;i < el.options.length;i++)
        if(el.options[i].selected == true && el.options[i].value!="")
          arr.push(el.options[i].value);
      if(arr.length == 0)
        continue;
      termOr = JSON.parse("{\"bool\":{\"must\":[],\"should\":[],\"must_not\":[]}}");        
      for(var i = 0;i <arr.length;i++){
         var t =new Object();
         t.term = new Object();
         eval("t.term."+curIndex.aggregations[temp].fieldName+"=\""+arr[i]+"\"");
         termOr.bool.should.push(t);
      }
      query.query.bool.filter.bool.must.push(termOr);
    }
  }
}


function updateSelectionBoxes(es){
  var temp;
  var sel = null;
  for(temp=0;temp< curIndex.aggregations.length;temp++){
     if(curIndex.aggregations[temp].inSearch==false)
       continue;
     sel = document.getElementById("select"+temp);
     var arr = es.getFacetFieldWithFacetName(curIndex.aggregations[temp].fieldName);
     for(var i = 0; i < arr.length;i++){
        var bucket = arr[i];
        sel.options[i+1].text = bucket.key+" ("+bucket.doc_count+")";
     }
  }
}