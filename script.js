"use strict";

var model = {}, view = {}, ctrl = {}; $(function() { ctrl.onLoad(); });

/**
 * Model
 */

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

/**
 * View
 */

view.onResize = function() { view.refresh(ctrl.status); }

view.refresh = function(status) {
  if (status == "welcome") {
    view.welcome.refresh();
  } else if (status == "feature") {
    view.refresh_background()
        .refresh_cloud();
    view.basket.refresh();
  }
  return this
}

view.welcome = { 
  enter:function() {
    this.refresh();
    $("#welcome #tips").hide();
    $("#welcome #title")
      .hide().fadeIn(1000)
      .click(function(){
        $(this).unbind();
        ctrl.gotoFeature();
      });
  },
  refresh:function() {
    $("#welcome #wrapper").css("top", ($(window).height() - $("#welcome #wrapper").height())>>1);
  },
  leave:function() {
    $("#welcome #title").fadeOut(1000, function(){
      // Dismiss the title
      $("#welcome #title").hide();
      // Show the tips
      $("#welcome #tips").fadeIn(500, function(){
        // Prepare feature layer
        view.refresh("feature");
        // Delay then dismiss welcome
        $("#welcome").delay(1000).fadeOut(500, function() {$(this).hide(); });
      });
    });
  }
}

view.refresh_background = function() {
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
}

view.basket = {
  refresh:function() {
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
      .append("img")
      .attr("title", function(d) { return d; })
      .attr("src", function(d) { return model.data[d].basket_img; })
      .on("click", function(){ ctrl.gotoProduct(d3.select(this).attr("title")); })
      .style("opacity",0).transition().style("opacity",1);
    divs.exit().transition().style("opacity",0).remove();
    // Buttons
    if(page > 0) {
      d3.select("#basket #up.button").style("cursor", "pointer")
        .on("mouseover", function(){ d3.select(this).transition().style("opacity", 0.6); })
        .on("mouseout", function(){ d3.select(this).transition().style("opacity", 0.3); })
        .on("click", view.basket.scrollUp)
        .transition().style("opacity", 0.3);
    } else {
      d3.select("#basket #up.button").style("cursor", "default")
        .on("mouseover", null)
        .on("mouseout", null)
        .on("click", null)
        .transition().style("opacity", 0);
    }
    if(page < view.basket.pageMax) {
      d3.select("#basket #down.button").style("cursor", "pointer")
        .on("mouseover", function(){ d3.select(this).transition().style("opacity", 0.6); })
        .on("mouseout", function(){ d3.select(this).transition().style("opacity", 0.3); })
        .on("click", view.basket.scrollDown)
        .transition().style("opacity", 0.3);
    } else {
      d3.select("#basket #down.button").style("cursor", "default")
        .on("mouseover", null)
        .on("mouseout", null)
        .on("click", null)
        .transition().style("opacity", 0);
    }
    view.basket.page = page;
  },
  scrollUp:function() { view.basket.scrollTo(view.basket.page - 1); },
  scrollDown:function() { view.basket.scrollTo(view.basket.page + 1); }
}


view.refresh_cloud = function(){
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
}

view.tag = {
  colors:["#00AEEF", "#EA428A", "#EED500", "#F5A70D", "#8BCB30", "#9962C1"],
  color:function(d, i) {
    switch(d.status) {
    case 0: return "#ccc";
    case 1: return view.tag.colors[i % view.tag.colors.length];
    case 2: return "#333";
    }
  },
  onMouseover:function(d) {
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
  },
  onMouseout:function(d) {
    if (d.status == 0) { return; }
    d3.selectAll("#cloud g text").transition()
      .style("opacity", function(d) { return d.opacity; })
      .style("font-size", function(d) { return d.size + "px"; })
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      });
  },
  onClick:function(d) {
    if (d.status == 0) { return; }
    // Flip the status
    model.tags.set(d.text, d.status==1 ? 2 : 1);
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
    // Update the data for cloud
    var data = d3.selectAll("#cloud g text").data();
    for (var i=0; i<data.length; i++) {
      data[i].status = model.tags.get(data[i].text);
      data[i].opacity = data[i].status > 0 ? 1 : 0.1
    }
    // Update views
    view.basket.refresh();
    d3.selectAll("#cloud g text").style("fill", view.tag.color);
    // Animation
    d3.select(this).transition().style("font-size", "0px");
  }
}

/**
 * Controller
 */

/**
 * Status of the controller
 *   loading:0
 *   welcome:1
 *   feature:2
 *   product:3
 */
ctrl.status = "loading"

ctrl.onLoad = function() {
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
      ctrl.gotoWelcome();
    }
  }, 1000);

  // Set window resizer
  $(window).resize(view.onResize);
}

ctrl.gotoWelcome = function() {
  $("#loading").hide();
  ctrl.status = "welcome";
  view.welcome.enter();
}

ctrl.gotoFeature = function() {
  view.welcome.leave();
  ctrl.status = "feature";
}

ctrl.gotoProduct = function(choice) {
  $("#product #title").text(choice);
  $("#product #image").attr("src", model.data[choice].product_img);
  $("#product #desc").text(model.data[choice].desc);
  $("#product").fadeIn('fast').click(ctrl.backtoFeature);
}

ctrl.backtoFeature = function() {
  $("#product").unbind().fadeOut('fast');
}
