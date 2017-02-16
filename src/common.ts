function postPhp(formData, callBack,dataPort) {
  dataPort="/textcorpus/api/"+dataPort;
  $.ajax({
//    url: "passpost.php",
    url:dataPort,
    type: 'post',
    contentType:'application/json',
    headers: {
      "Authorization": "Bearer " + sessionStorage.getItem("accessTokenCorpus"),
    },
    data: formData.elasticdata,
    error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert('Sorry. You have to log in again.');
        sessionStorage.setItem("accessTokenCorpus", null);
        window.location.href = "index.html";
    },
    success: function (data) {
      /*       if((data,"error.invalidToken")!= ""){
                 window.location.href = "index.html";
                 return;
      
             }
      */
      //      document.getElementById("felt").value = "client";
      callBack(data);
    },
    dataType: "json"
  });
} 

interface String {
  endsWith(pattern): any;
}

String.prototype.endsWith = function (pattern) {
  var d = this.length - pattern.length;
  return d >= 0 && this.lastIndexOf(pattern) === d;
};
