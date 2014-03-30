"use strict";

model.choices = (function() {
  var map = d3.map();
  for (var choice in model.data) {
    map.set(choice, true);
  }
  return map;
}());
// Unavailable: 0
// Available: 1
// Selected: 2
model.tags = (function () {
  var tags = d3.map();
  for(var choice in model.data) { for(var tag in model.data[choice].tags) { tags.set(tag, 1); } }
  return tags;
}());

var view = {
  default_colors:["#00AEEF", "#EA428A", "#EED500", "#F5A70D", "#8BCB30", "#9962C1"],
  update_background:function() {
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
    return this;
  },
  update_basket:function() {
    $("#basket #content").css("margin", "0px " + 
        $("#basket_rside").width() + "px 0px " + 
        $("#basket_lside").width() + "px");

    var item = d3.select("#basket #content")
      .selectAll("div")
      .data(model.choices.entries())
      .enter().append("div")
      .classed({"item":true})
      .append("img")
      .attr("src", function(d) { return model.data[d.key].img; })
      .style("display", function(d) { d.value ? "inline-block" : "none"; });

    return this;
  },
  update_cloud:function(){
    var fill = d3.scale.category20(),
        cloud_width = $(window).width(),
        cloud_height = $(window).height() - $("#basket").height();

    d3.layout.cloud().size([cloud_width, cloud_height])
      .words(model.tags.entries().map(function(d) {
        return {text: d.key, size: 12 + Math.random() * 48, status: d.value};
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
              .style("font-size", function(d) { return d.size + "px"; })
              .style("fill", function(d, i) { 
                if (d.status == 1) {
                  return fill(i); 
                } else {
                  return "#ccc";
                }
              })
              .style("cursor", "pointer")
              .attr("text-anchor", "middle")
              .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
              })
              .text(function(d) { return d.text; })
              .on("mouseenter", function(d) {
                d3.select(this).transition()
                  .style("font-size", "60px")
                  .attr("transform", "translate(" + [d.x, d.y] + ")");
              })
              .on("mouseleave", function(d) {
                d3.select(this).transition()
                  .style("font-size", d.size + "px")
                  .attr("transform", "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")");
              })
              .on("click", function(d) {
                console.log(d.text)
              });
      })
      .start();
  }
};


// update_model_by_checked_tags()

// update_cloud
// update_basket
//  onMouseEnter
//  onMouseLeave


$(function() {
  $("#loading").hide();

  $(window).resize(function(){
    view.update_background().update_basket().update_cloud();
  }).trigger("resize");
});

// // Global variables
// function find_available_tags() {
//   available_choices = [];
//   available_tags = [];

//   for(var choice in choices) {
//     if ($.merge(choices[choice].tags, checked_tags).length == choices[choice].tags.length) {
//       available_choices.push(choice);
//       for(var tag in choices[choice].tags) {
//         if (available_tags.indexOf(tag) == -1) { available_tags.push(tag) }
//       }
//     }
//   }
// }

// function resize_page() {
// 	resize_background_img();
//   // Data
//   find_available_tags
//   // Views
//   refresh_basket();
//   refresh_cloud();
// }
