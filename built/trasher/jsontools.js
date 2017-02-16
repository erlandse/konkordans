/*
function createJsonPath(str){
   list = str.split(".");
   obj = new Object();
   var nPath = "";
   for(temp = 0;temp< list.length;temp++){
     eval("obj."+nPath+list[temp]+"= new Object()");
     nPath+=list[temp]+".";
   }
   return obj;
}
*/


function createJsonPath(str){
   list = str.split(".");
   obj = new Object();
   var nPath = "";
   for(temp = 0;temp< list.length;temp++){
     if(list[temp].endsWith("[]")){
       eval("obj."+nPath+list[temp].substring(0,list[temp].length-2)+"= new Array()");
       break;
     }  
     else{
       eval("obj."+nPath+list[temp]+"= new Object()");
     }  
     nPath+=list[temp]+".";
   }
   return obj;
}



function insertField(obj,str){
  var l = str.split(":");
  var i;
  i = parseInt(l[1]);
  if(isNaN(i)){
    eval("obj."+l[0]+"=\""+l[1]+"\"");
  }else{
     i = parseInt(l[1]);
     eval("obj."+l[0]+"="+i);
  }
}


function createJsonParallel(str){
  var obj = new Object();
  list = str.split("&");
  for(temp =0;temp< list.length;temp++){
    st = list[temp];
    if(st.endsWith("[]")){
      st = st.substr(0,st.length-2);
      eval("obj."+st+"= new Array()");
    }else if(st.indexOf(":")!=-1){
      insertField(obj,st);
    }  
    else  
      eval("obj."+st+"= new Object()");
  } 
  return obj;
  
}

function cloneJSON(obj) {
    // basic type deep copy
    if (obj === null || obj === undefined || typeof obj !== 'object')  {
        return obj
    }
    // array deep copy
    if (obj instanceof Array) {
        var cloneA = [];
        for (var i = 0; i < obj.length; ++i) {
            cloneA[i] = cloneJSON(obj[i]);
        }              
        return cloneA;
    }                  
    // object deep copy
    var cloneO = {};   
    for (var i in obj) {
        cloneO[i] = cloneJSON(obj[i]);
    }                  
    return cloneO;
}
