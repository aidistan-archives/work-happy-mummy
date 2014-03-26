"use strict";
var tag_colors = ["#00AEEF", "#EA428A", "#EED500", "#F5A70D", "#8BCB30", "#9962C1"];
var tag_sizes = ["14px", "16px", "18px", "24px", "36px"];
var tags = ["die()", "error()", "event.currentTarget()", "event.data()", "event.delegateTarget()", "event.isDefaultPrevented()", "event.isImmediatePropagationStopped()", "event.isPropagationStopped()", "event.namespace()", "event.pageX()", "event.pageY()", "event.preventDefault()", "event.relatedTarget()", "event.result()", "event.stopImmediatePropagation()", "event.stopPropagation()", "event.target()", "event.timeStamp()", "event.type()", "event.which()", "focus()", "focusin()", "focusout()", "hover()", "keydown()", "keypress()", "keyup()", "live()", "load()", "mousedown()", "mouseenter()", "mouseleave()", "mousemove()", "mouseout()", "mouseover()", "mouseup()"];

$(function() {
  // Hide loading layer
  $("#loading").hide();

  /*
   * Set callbacks
   */
  $(window).resize(resize_page).trigger("resize");
});

function resize_page() {
	refresh_background_img();
  refresh_basket();
  refresh_cloud();
}

function refresh_background_img() {
  var win = $(window),
      img = $("#background img"),
      win_ratio = win.width() / win.height(),
      img_ratio = img.width() / img.height();
  // Fit center
  if ( win_ratio < img_ratio ) {
    img.css("width", "auto");
    img.css("height", win.height());
    img.css("left", -0.5*(img.width()-win.width()));
    img.css("top", 0);
  } else {
    img.css("width", win.width());
    img.css("height", "auto");
    img.css("left", 0);
    img.css("top", -0.5*(img.height()-win.height()));
  }
}

function refresh_basket() {
  $("#basket #content").css("margin", "0px " + 
      $("#basket_rside").width() + "px 0px " + 
      $("#basket_lside").width() + "px");
}

function refresh_cloud() {
  var cloud_height = $(window).height() - $("#basket").height();
  $("#cloud").css("height", cloud_height > 0 ? cloud_height : 0)
  $("#cloud").empty();

  $.each(tags, function(index, value) {
    var color = tag_colors[Math.floor(Math.random()*tag_colors.length)],
        size = tag_sizes[Math.floor(Math.random()*tag_sizes.length)];
    // Append tag
    var tag = $("<p/>").text(value).addClass('tag').css({
        "color":color,
        "font-size":size
    });
    $("#cloud").append(tag);
    // Set position according to measurement
    tag.css({
        "left":Math.floor(10 + Math.random()*($(window).width()-tag.width()-20)),
        "top":Math.floor(10 + Math.random()*(cloud_height-tag.height()-20)),
    });
    
  });
}
