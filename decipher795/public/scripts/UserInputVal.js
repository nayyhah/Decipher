function UserInput() {
    var x = document.getElementById("decipherform");
    var linkurl = x.elements[0].value;
    var i1 = false;

    if( (linkurl != undefined || linkurl != '') ){
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        match = linkurl.match(regExp);
        i1 = (match && match[2].length == 11) ? true : false ;
    }
    

    if(i1){
        var block1 = document.getElementById('content');
        var block2 = document.getElementById('loading');
        var block3 = document.getElementById('footer');
        block1.style.display = "none";
        block2.style.display = "block";
        block3.style.position = "fixed";
        block3.style.left = "0";
        block3.style.bottom = "0";
        block3.style.width = "100%";
    }
    
    else{
       document.getElementById("error").innerHTML = ( linkurl != '' ) ? "Please Enter a valid url." : "Please Enter the url to proceed." ;
    }

}
