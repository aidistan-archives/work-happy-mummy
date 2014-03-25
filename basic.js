current_dish = 1;

$(function() {

  $(window).resize(resize_page).trigger("resize");

  /*
   * Temp
   */
  $("div.basket div.content").css("margin", "0px " + 
  	$("#basket_rside").width() + "px 0px " + 
  	$("#basket_lside").width() + "px");
  $("div.foreground").css("height", $(window).height()-100);

  $("div.plate").click(function() {
  	$("#dish_"+current_dish).addClass("hidden");
  	current_dish = $(this).text();
  	$("#dish_"+current_dish).removeClass("hidden");
  });


});

function resize_page() {
	/*
	 * Resize background_img
	 */
  var win = $(window),
      img = $("#background_img"),
      win_ratio = win.width() / win.height(),
      img_ratio = img.width() / img.height();
  // Fit center
  if ( win_ratio < img_ratio ) {
    img.css("width", "auto");
    img.css("height", win.height());
		img.css("left", -0.5*(img.width()-win.width()))
    img.css("top", 0)
  } else {
    img.css("width", win.width());
    img.css("height", "auto");
    img.css("left", 0)
    img.css("top", -0.5*(img.height()-win.height()))
  }
}
