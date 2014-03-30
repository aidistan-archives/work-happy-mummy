"use strict";

/**
 * Storing all choices and their status
 */
model.choices = (function() {
  var map = d3.map();
  for (var choice in model.data) {
    map.set(choice, true);
  }
  return map;
}());
/**
 * Storing all tags and their status
 *   Unavailable: 0
 *   Available: 1
 *   Selected: 2
 */
model.tags = (function () {
  var tags = d3.map();
  for(var choice in model.data) { for(var tag in model.data[choice].tags) { tags.set(tag, 1); } }
  return tags;
}());
/**
 * Update the model
 */
model.update = function() {
  // Store checked and reset to unavailable
  var checked_tags = [];
  model.tags.forEach(function(key, value){
    if (value == 2) { checked_tags.push(key); }
    model.tags.set(key, 0);
  });

  // Find available choices
  for(var choice in model.data) {
    model.choices.set(choice, true);

    for (var i=0; i<checked_tags.length; i++) {
      if (!model.data[choice].tags[checked_tags[i]]) {
        model.choices.set(choice, false);
        break;
      }
    }
    
    if (model.choices.get(choice)) {
      for(var tag in model.data[choice].tags) {
        model.tags.set(tag, 1);
      }
    }
  }

  // Set checked back
  for (var i=0; i<checked_tags.length; i++) {
    model.tags.set(checked_tags[i], 2); 
  };
}

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

    var choices = []
    model.choices.forEach(function(key, value) {
      if (value) {
        choices.push(key);
      }
    });

    var divs = d3.select("#basket #content")
      .selectAll("div")
      .data(choices)
      .classed({"item":true});
    divs.selectAll("img")
        .attr("src", function(d) { return model.data[d].img; });
    divs.enter().append("div")
      .classed({"item":true})
      .append("img")
      .attr("src", function(d) { return model.data[d].img; });
    divs.exit().remove();

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
            .classed({"tag":true})
            .style("font-size", function(d) { return d.size + "px"; })
            .style("fill", function(d, i) { 
              if (d.status == 1) {
                return fill(i); 
              } else {
                return "#cccccc";
              }
            })
            .style("display", function(d) {
              return d.status > 0 ? "inline-block" : "none";
            })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; })
            .on("mouseenter", function(d) { 
              d3.select("#cloud g").selectAll("text").transition()
                .style("opacity", "0.1");

              d3.select(this).transition()
                .style("opacity", "0.6")
                .style("font-size", "60px")
                .attr("transform", "translate(" + [d.x, d.y] + ")");
            })
            .on("mouseleave", function(d) {
              d3.select("#cloud g").selectAll("text").transition()
                .style("opacity", "1")
                .style("font-size", function(d) { return d.size + "px"; })
                .attr("transform", function(d) {
                  return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                });
            })
            .on("click", function(d) {
              model.tags.set(d.text, d.status==1 ? 2 : 1);
              model.update();
              view.update_basket()
                  .update_cloud();
            });
      })
      .start();
  }
};

$(function() {
  $("#loading").hide();

  $(window).resize(function(){
    view.update_background()
        .update_basket()
        .update_cloud();
  }).trigger("resize");
});
