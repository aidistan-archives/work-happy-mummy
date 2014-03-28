"use strict";

// Global variables
var tag_colors = ["#00AEEF", "#EA428A", "#EED500", "#F5A70D", "#8BCB30", "#9962C1"];
var all_choices = $.map(choices, function(value, key) { return key; });
var all_tags = (function () {
  var tags = {};
  for(var choice in choices) { for(var tag in choices[choice].tags) { tags[tag] = true } }
  return $.map(tags, function(value, key) { return key; });
}).call();
var checked_tags = [];
var available_choices;
var available_tags;

function find_available_tags() {
  available_choices = [];
  available_tags = [];

  for(var choice in choices) {
    if ($.merge(choices[choice].tags, checked_tags).length == choices[choice].tags.length) {
      available_choices.push(choice);
      for(var tag in choices[choice].tags) {
        if (available_tags.indexOf(tag) == -1) { available_tags.push(tag) }
      }
    }
  }
}

// onLoad
$(function() {
  // Hide loading layer
  $("#loading").hide();

  $(window).resize(resize_page).trigger("resize");
});

function resize_page() {
	resize_background_img();
  // Data
  find_available_tags
  // Views
  refresh_basket();
  refresh_cloud();
}

function resize_background_img() {
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

  d3.select("#basket #content")
    .selectAll("div")
    .data(d3.map(choices).values())
    .enter().append("div")
    .classed({"item":true})
    .append("img")
    .attr("src", function(d) { return d.img; });
}

function refresh_cloud() {
  var fill = d3.scale.category20(),
      cloud_width = $(window).width(),
      cloud_height = $(window).height() - $("#basket").height();;

  d3.layout.cloud().size([cloud_width, cloud_height])
    .words(all_tags.map(function(d) {
      return {text: d, size: 10 + Math.random() * 60};
    }))
    .padding(5)
    .rotate(function() { return ~~(Math.random() * 5) * 30 - 60; })
    .fontSize(function(d) { return d.size; })
    .on("end", function(words) { // Fired when all words have been placed. 
      $("#cloud").empty();
      d3.select("#cloud")
        .attr("width", cloud_width)
        .attr("height", cloud_height)
        .append("g")
        .attr("transform", "translate("+cloud_width/2+","+cloud_height/2+")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .classed({"tag":true})
        .style("font-size", function(d) { return d.size + "px"; })
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
    }) 
    .start();
}
