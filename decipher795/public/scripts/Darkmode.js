var icon = document.getElementById("icon");
icon.onclick = function(){
  document.body.classList.toggle("dark-theme");
  if(document.body.classList.contains("dark-theme")){
    icon.src = "/Icons/sun.png" ;
    logo.src = "/Icons/logo-dark.svg" ;
    logo2.src = "/Icons/logo2-dark.png" ;

  }
  else{
    icon.src = "/Icons/moon.png" ;
    logo.src = "/Icons/logo.svg" ;
    logo2.src = "/Icons/logo.png" ;
  }
}