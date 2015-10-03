"use strict";

/**
 * Model
 */
var model = {}

model.ajax = {
  "data":false
}

// model.ajax.data
$.ajax({
  url: "data.json",
  beforeSend: function(xhr) {
    if (xhr.overrideMimeType) { xhr.overrideMimeType("application/json"); }
  },
  dataType: 'json',
  success: function(json) { 
    model.data = json;
    /*
     * Storing all choices and their status
     *   true: choices matched selected tags
     *   false: choices unmatched selected tags
     *
     * @note: It is a map. Use map.get and map.set!
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
     *   0: tags in conflict with selected tags
     *   1: tags compatible with selected tags
     *   2: selected tags
     *
     * @note: It is a map. Use map.get and map.set!
     */
    model.tags = (function () {
      var tags = d3.map();
      for(var choice in model.data) { for(var tag in model.data[choice].tags) { tags.set(tag, 1); } }
      return tags;
    }());
    // Set the flag
    model.ajax.data = true;
  }
});

model.update = function() {
  // Store checked and reset to unavailable
  var selected_tags = [];
  model.tags.forEach(function(key, value){
    if (value == 2) { selected_tags.push(key); }
    model.tags.set(key, 0);
  });
  // Find available choices
  for(var choice in model.data) {
    model.choices.set(choice, true);

    for (var i=0; i<selected_tags.length; i++) {
      if (!model.data[choice].tags[selected_tags[i]]) {
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
  // Set selected flag back
  for (var i=0; i<selected_tags.length; i++) {
    model.tags.set(selected_tags[i], 2); 
  };
}

/**
 * View
 */

var view = {}

view.refresh = function(status) {
  switch (typeof status !== "undefined" ? status : ctrl.status) {
  case 'loading': break;
  case 'welcome': this.welcome.refresh(); break;
  case 'feature': this.feature.refresh(); break;
  case 'product': break;
  }
  return this
}

view.onResize = function() { view.refresh(); }

view.welcome = {}

view.welcome.enter = function() {
  $("#welcome #tips").hide();
  $("#welcome #title")
    .hide().fadeIn(1000)
    .click(function(){
      $(this).unbind();
      ctrl.moveOn();
    });
  this.refresh();
}

view.welcome.refresh = function() {
  $("#welcome #wrapper").css("top", ($(window).height() - $("#welcome #wrapper").height())>>1);
  $("#welcome #title").css("left", ($(window).width() - $("#welcome #title").width())>>1);
}

view.welcome.leave = function() {
  // Dismiss the title
  $("#welcome #title").fadeOut(1000, function(){
    // Show the tips
    $("#welcome #tips").fadeIn(500, function(){
      // Prepare feature stage
      view.feature.prepare();
      // Delay then dismiss welcome
      $("#welcome").delay(1000).fadeOut(500);
    });
  });
}

view.feature = {}

view.feature.prepare = function() {
  d3.selectAll("#basket .button")
    .on("mouseover", view.basket.button.onMouseover)
    .on("mouseout", view.basket.button.onMouseout)
    .on("click.button", view.basket.button.onClick)
    .transition().style("opacity", 0.6);
  // Hack for logo
  d3.select("#logo")
    .on("mouseout", function(){
      d3.select(this).transition().style("opacity", 0.6).style("width", "66px").style("height", "66px")
        .select("img").style("width", "66px").style("height", "66px");
    })
    .on("click.button", function(){
      var trans = d3.select(this).transition().duration(100).style("width", "54px").style("height", "54px")
      trans.select("img").style("width", "54px").style("height", "54px");
      trans.transition().duration(100).style("width", "66px").style("height", "66px")
           .select("img").style("width", "66px").style("height", "66px");
    });

  d3.select("#basket #reset.button").on("click", function(){
    // Reset
    model.tags.forEach(function(key){ model.tags.set(key, 1); });
    // Update
    model.update();
    view.feature.update();
    d3.selectAll("#cloud g text").transition().style("opacity", function(d) { return d.opacity; });
  });
  d3.select("#basket #comment.button").on("click", function(){ ctrl.showOff("comment"); });
  d3.select("#basket #logo.button").on("click", function(){ ctrl.showOff("logo"); });

  this.refresh();
}

view.feature.refresh = function() {
  view.cloud.refresh();
  view.basket.refresh();
}

view.feature.update = function() {
  view.cloud.update();
  view.basket.refresh();
}

view.basket = {
  refresh:function() {
    // Calculate the width
    $("#basket #content").css("margin", "0px " + 
        ($("#basket #right.side").width()+0) + "px 0px " + 
        ($("#basket #left.side").width()+0) + "px");
    // Count the number of choices to show
    view.basket.choices = []
    model.choices.forEach(function(key, value) {
      if (value) {
        view.basket.choices.push(key);
      }
    });
    // Show the first page
    view.basket.page = 0;
    view.basket.length = ~~($("#basket #content").width() / 100);
    view.basket.pageMax = ~~(view.basket.choices.length / view.basket.length);
    view.basket.scrollTo(0);
    return this;
  },
  scrollTo:function(page) {
    var choices = view.basket.choices.slice(
      page*view.basket.length, 
      (page == view.basket.pageMax) ? view.basket.choices.length : (page*view.basket.length + view.basket.length)
    );
    // Content
    var divs = d3.select("#basket #content")
      .selectAll("div")
      .data(choices, function(d, i){ return d; });
    divs.enter().append("div")
      .classed({"item":true})
      .style("border-color", function(d){ return model.data[d].basket_color })
      .append("img")
      .attr("title", function(d) { return d; })
      .attr("src", function(d) { return model.data[d].basket_img; })
      .on("click", function(){ ctrl.showOff(d3.select(this).attr("title")); })
      .style("opacity",0).transition().style("opacity",1);
    divs.exit().transition().style("opacity",0).remove();
    // Buttons
    if(page > 0) {
      d3.select("#basket #up.button").style("cursor", "pointer")
        .on("mouseover", view.basket.button.onMouseover)
        .on("mouseout", view.basket.button.onMouseout)
        .on("click.scroll", view.basket.scrollUp)
        .transition().style("opacity", 0.3);
    } else {
      d3.select("#basket #up.button").style("cursor", "default")
        .on("mouseover", null).on("mouseout", null).on("click.scroll", null)
        .transition().delay(200).style("opacity", 0);
    }
    if(page < view.basket.pageMax) {
      d3.select("#basket #down.button").style("cursor", "pointer")
        .on("mouseover", view.basket.button.onMouseover)
        .on("mouseout", view.basket.button.onMouseout)
        .on("click.scroll", view.basket.scrollDown)
        .transition().style("opacity", 0.3);
    } else {
      d3.select("#basket #down.button").style("cursor", "default")
        .on("mouseover", null).on("mouseout", null).on("click.scroll", null)
        .transition().delay(200).style("opacity", 0);
    }
    view.basket.page = page;
  },
  scrollUp:function() { view.basket.scrollTo(view.basket.page - 1); },
  scrollDown:function() { view.basket.scrollTo(view.basket.page + 1); }
}

view.basket.button = {}

view.basket.button.onMouseover = function() {
  d3.select(this).transition().style("opacity", 1);
}

view.basket.button.onMouseout = function() {
  d3.select(this).transition().style("opacity", 0.6).style("width", "30px").style("height", "30px")
    .select("img").style("width", "30px").style("height", "30px");
}

view.basket.button.onClick = function() {
  var trans = d3.select(this).transition().duration(100).style("width", "24px").style("height", "24px")
  trans.select("img").style("width", "24px").style("height", "24px");
  trans.transition().duration(100).style("width", "30px").style("height", "30px")
       .select("img").style("width", "30px").style("height", "30px");
}

view.cloud = {
  refresh:function(){
    var cloud_width = $(window).width(),
        cloud_height = $(window).height() - $("#basket").height();
    /**
     *   Find the positions of words
     */
    d3.layout.cloud().size([cloud_width, cloud_height])
      .padding(5).font("奶油甜心")
      .words(model.tags.entries().map(function(d) {
        return {
          text: d.key,
          size: 14 + Math.random() * 36,
          status: d.value,
          opacity: d.value > 0 ? 1 : 0.1,
        };
      }))
      .rotate(function(d) { return ~~(Math.random() * 5) * 15 - 30; })
      .fontSize(function(d) { return d.size; })
      /**
       *   When all words have been placed
       */
      .on("end", function(words) {
        $("#cloud").empty();
        d3.select("#cloud")
          .attr("width", cloud_width).attr("height", cloud_height)
          .append("g")
          .attr("transform", "translate("+cloud_width/2+","+cloud_height/2+")")
          .selectAll("text").data(words).enter().append("text")
          .classed({"tag":true, "NaiYou":true})
          .style("font-size", function(d) { return d.size + "px"; })
          .style("fill", view.tag.color)
          .style("opacity", function(d) { return d.opacity; })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; })
          .on("mouseover", view.tag.onMouseover)
          .on("mouseout", view.tag.onMouseout)
          .on("click", view.tag.onClick);
      })
      .start();
      return this;
  },
  update:function(){
    var data = d3.selectAll("#cloud g text").data();
    for (var i=0; i<data.length; i++) {
      data[i].status = model.tags.get(data[i].text);
      data[i].opacity = data[i].status > 0 ? 1 : 0.1
    }
    d3.selectAll("#cloud g text").style("fill", view.tag.color);
  }
}

view.tag = {}

view.tag.colors = ["#00AEEF", "#EA428A", "#EED500", "#F5A70D", "#8BCB30", "#9962C1"];

view.tag.color = function(d, i) {
  switch(d.status) {
  case 0: return "#ccc";
  case 1: return view.tag.colors[i % view.tag.colors.length];
  case 2: return "#333";
  }
}

view.tag.onMouseover = function(d) {
  if (d.status == 0) { return; }
  d3.selectAll("#cloud g text").transition()
    .style("opacity", "0.1")
    .style("font-size", function(d) { return d.size + "px"; })
    .attr("transform", function(d) {
      return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    });

  d3.select(this).transition()
    .style("opacity", "1")
    .style("font-size", 60 + "px")
    .attr("transform", "translate(" + [d.x, d.y] + ")");
}

view.tag.onMouseout = function(d) {
  if (d.status == 0) { return; }
  d3.selectAll("#cloud g text").transition()
    .style("opacity", function(d) { return d.opacity; })
    .style("font-size", function(d) { return d.size + "px"; })
    .attr("transform", function(d) {
      return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    });
}

view.tag.onClick = function(d) {
  if (d.status == 0) { return; }
  model.tags.set(d.text, d.status==1 ? 2 : 1);
  d3.select(this).transition().style("font-size", "0px")
                 .transition().style("font-size", "60px");
  // Update model
  model.update();
  // Update views
  view.feature.update();
}

/**
 * Controller
 */

window.onload = function() {
  // Initialization
  $("#product").hide();

  // Set AJAX watcher
  ctrl.ajax = setInterval(function(){
    var allDone = true;
    
    for(var flag in model.ajax) {
      console.log(flag + ":" + model.ajax[flag]) // DEBUG
      if (!model.ajax[flag]) {
        allDone = false;
        break;
      }
    }

    if (allDone) {
      clearInterval(ctrl.ajax);
      ctrl.moveOn();
    }
  }, 1000);

  // Set window resizer
  $(window).resize(view.onResize);
}

var ctrl = {
  status:"loading",
  states:{
    loading:0,
    welcome:1,
    feature:2,
    product:3
  }
}

ctrl.moveOn = function() {
  switch (ctrl.status) {
  case 'loading':
    $("#loading").hide();
    ctrl.status = "welcome";
    view.welcome.enter();
    break;
  case 'welcome':
    view.welcome.leave();
    ctrl.status = "feature";
    break;
  }
  return this;
}

ctrl.showOff = function(choice) {
  if (choice == "logo") {
    $("#product #title").text("关于乳芽").addClass("NaiYou").css("color", "#8BCB30");
    $("#product #image").hide();
    $("#product #desc").text("我们其实是来打酱油的");
  } else if (choice == "comment") {
    $("#product #title").text("吐槽一下").addClass("NaiYou").css("color", "#00AEEF");
    $("#product #image").hide();
    $("#product #desc").text("槽池已满...");
  } else {
    // Product
    $("#product #title").text(choice).removeClass("NaiYou").css("color", "white");
    $("#product #image").attr("src", model.data[choice].product_img).show();
    $("#product #desc").html(model.data[choice].desc);
  }
  // For exit
  $("#product").fadeIn('fast').click(function(){ $("#product").unbind().fadeOut('fast'); });
}
