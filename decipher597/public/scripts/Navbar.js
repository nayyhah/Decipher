(function ($) {"use strict";

  $(function () {
    var header = $(".start-style");
    $(window).scroll(function () {
      var scroll = $(window).scrollTop();

      if (scroll >= 10) {
        header.removeClass('start-style').addClass("scroll-on");
      } else {
        header.removeClass("scroll-on").addClass('start-style');
      }
    });
  });

  //Animation

  $(document).ready(function () {
    $('body.hero-anime').removeClass('hero-anime');
  });

  //Menu On Hover

  $('body').on('mouseenter mouseleave', '.nav-item', function (e) {
    if ($(window).width() > 750) {
      var _d = $(e.target).closest('.nav-item');_d.addClass('show');
      setTimeout(function () {
        _d[_d.is(':hover') ? 'addClass' : 'removeClass']('show');
      }, 1);
    }
  });

  //Switch light/dark

  $("#switch").on('click', function () {
    if ($("body").hasClass("dark")) {
      $("body").removeClass("dark");
      $("#switch").removeClass("switched");
    } else
    {
      $("body").addClass("dark");
      $("#switch").addClass("switched");
    }
  });

})(jQuery);

const mySpan = document.getElementById("mySpan");
const myInput = document.getElementById("cbox");
const navBtns = document.querySelectorAll(".nav-btn");
console.log(navBtns);

window.onload = () => {
  mySpan.addEventListener("click", () => {
    console.log(myInput.checked);
    if (myInput.checked) {
      document.body.style.background = "#FFF";
      document.body.style.color = "#000";
      for (let i=0; i < navBtns.length; i++) {
        navBtns[i].style.color = "#000";
        navBtns[i].addEventListener("mouseover", () => {
          navBtns[i].style.borderColor = "#222";
        });
        navBtns[i].addEventListener("mouseout", () => {
          navBtns[i].style.borderColor = "transparent";
        });
      }
    } else {
      document.body.style.background = "hsl(0, 1%, 8%)";
      for (let i=0; i < navBtns.length; i++) {
        navBtns[i].style.color = "#FFF";
        navBtns[i].addEventListener("mouseover", () => {
          navBtns[i].style.borderColor = "#eee";
        });
        navBtns[i].addEventListener("mouseout", () => {
          navBtns[i].style.borderColor = "transparent";
        });
      }
      document.body.style.color = "#FFF"; 
    }
  });
}