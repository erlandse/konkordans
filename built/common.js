function postPhp(formData, callBack, dataPort) {
    dataPort = "/textcorpus/api/" + dataPort;
    $.ajax({
        //    url: "passpost.php",
        url: dataPort,
        type: 'post',
        contentType: 'application/json',
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
function postNoDataPort(formData, callBack) {
    //  document.getElementById("felt").value = "server";
    $.ajax({
        url: "passpost.php",
        type: 'post',
        data: formData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            //      document.getElementById("felt").value = "client";
            callBack(data);
        },
        dataType: "json"
    });
}
String.prototype.endsWith = function (pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};
