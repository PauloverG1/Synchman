(() => {
  mobileOnlySlider(".banking-carousel", true, true);

  function mobileOnlySlider($slidername, $dots, $arrows) {
    var slider = $($slidername);
    var settings = {
      autoplay:true,
      autoplaySpeed: 5000,
      dots: $dots,
      arrows: $arrows,
      slidesToShow: 1,
      infinite: true,
      prevArrow:
        "<img alt='previous' id='banking-carousel-about-prev' class='a-left control-c prev slick-prev' src='/sites/syc/img/button-slider-left-white.png' tabindex='0'>",
      nextArrow:
        "<img alt='next' id='banking-carousel-about-next' class='a-right control-c next slick-next' src='/sites/syc/img/button-slider-right-white.png' tabindex='0'>",
    };

    slider.slick(settings);

    $("#banking-carousel-about-prev").keypress(function (e) {
      if (e.which == 13) {	
        $(".banking-carousel").slick("slickPrev");
      }
    });

    $("#banking-carousel-about-next").keypress(function (e) {
      if (e.which == 13) {
        $(".banking-carousel").slick("slickNext");
      }
    });
  } // Mobile Only Slider
})();