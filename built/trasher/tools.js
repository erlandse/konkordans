function addOption(elSel,text,value){
  var elOptNew = document.createElement('option');
  elOptNew.text = text;
  elOptNew.value = value;
  elSel.appendChild(elOptNew);
}

function removeOptionSelected(selectId)
{
  var elSel = document.getElementById(selectId);
  var i;
  for (i = elSel.length - 1; i>=0; i--) {
    if (elSel.options[i].selected) {
      elSel.remove(i);
    }
  }
}

function removeAllOptions(selectId){
 var elSel = document.getElementById(selectId);
 while(elSel.length > 0)
      elSel.remove(elSel.length-1);
}

function selectAllOptions(selectId){
 var sel = document.getElementById(selectId);
 for(var temp = 0; temp < sel.length;temp++)
    sel.options[temp].selected = true;
}



function postPhp(formData,callBack){
//  document.getElementById("felt").value = "server";
  $.ajax({
     url: "passpost.php", 
     type: 'post',
     data:formData,
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
//      document.getElementById("felt").value = "client";
       callBack(data);
     },
     dataType:"json"
  });  
}  


function getRemote(remote_url) {
	return $.ajax({
		type: "GET",
		url: remote_url,
		async: false
	}).responseText;
 }


function gup( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}



function postPhpReturnText(urlToCall,formData,callBack){
//  document.getElementById("felt").value = "server";
  $.ajax({
     url: urlToCall, 
     type: 'post',
     data:formData,
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
//     document.getElementById("felt").value = "client";

       callBack(data);
     }
  });  
}  

String.prototype.endsWith = function(pattern) {
  var d = this.length - pattern.length;
  return d >= 0 && this.lastIndexOf(pattern) === d;
};

function postPhpReturnJson(urlToCall,formData,callBack){
//  document.getElementById("felt").value = "server";
  $.ajax({
     url: urlToCall, 
     type: 'post',
     data:formData,
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
//       document.getElementById("felt").value = "client";
       callBack(data);
     },
     dataType:"json"
  });  
}  
