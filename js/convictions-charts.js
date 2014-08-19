(function(window, document, d3, Convictions) {
  window.Convictions = Convictions;

  var charts = Convictions.charts = Convictions.charts || {};

  /**
    Factory to generate a reusable bar chart.

    @returns A function that can be called on a d3 selection to add
       an SVG element containing a chart.

    The returned function should be applied to a d3 selection using the
    call() method.  For example:

    var chart = barChart(); 
    var selection = d3.select('#chart-container')
      .datum(data)
      .call(chart);

    It expects the bound data to be objects with 'label' and 'value'
    properties.

    The returned function has the following getters/setters that can be used
    to configure the chart.

    * margin
    * aspectRatio
    * tooltipFn
   
    References:
    * http://bost.ocks.org/mike/bar/3/
    * http://bost.ocks.org/mike/chart/
    * http://blog.apps.npr.org/2014/05/19/responsive-charts.html
  */
  function barChart() {
    // Configuration variables

    // Public
    // These can be get/set with accessors defined below
    var margin = {top: 20, right: 30, bottom: 30, left: 60};
    var aspectRatio = 16 / 9; // Width to height
    var tooltipFn; // Function to render tooltip

    // Private

    var width, height; // Internal width and height of the chart
    // Class that will be set on popup elements 
    var tooltipClass = 'tooltip-chart'; 
    // Distance from the pointer to where the tooltip is rendered
    var tooltipOffset = 4; 
    // Margins of the popup element
    var tooltipMargin = {top: 4, right: 4, bottom: 4, left: 4};

    /**
     * Position a popup relative to mouse position.
     *
     * @param selection - d3 selection for an SVG group element for
     *   the tooltip.
     *   
     */
    function positionTooltip(selection) {
      // This should get the DOM Node for the inner chart element
      var container = selection.node().parentNode;
      // We reference the global height and width variables rather than
      // getting height and width using container.getBBox() because the
      // calculated width and height change as we add our popup element.
      var containerWidth = width;
      var containerHeight = height;
      var position = d3.mouse(container);
      var bbox = selection.node().getBBox();
      var x = position[0];
      var y = position[1];

      // Generally, the tooltip should be positioned below and to the right
      // of the mouse pointer.  However, if this results in the element 
      // falling outside of the chart boundary we need to position it above
      // or to the left of the mouse.
      if (x + bbox.width > containerWidth) {
        x -= (tooltipOffset + bbox.width);
      }
      else {
        x += tooltipOffset;
      }

      if (y + bbox.height > containerHeight) {
        y -= (tooltipOffset + bbox.height);
      }
      else {
        y += tooltipOffset;
      }

      selection.attr('transform', 'translate(' + x + ',' + y + ')');
    }

    /**
     * Populate a popup element.
     */
    function renderTooltip(selection) {
      var border = selection.append('rect');
      var text = selection.append('text')
          .attr('text-anchor', 'start')
          .attr('x', tooltipMargin.left)
          .attr('y', tooltipMargin.top)
          .attr('dy', '0.75em');
      var margin = tooltipMargin;
      var bbox;

      text.append('tspan')
          .attr('class', 'label')
          .attr('x', tooltipMargin.left)
          .text(function(d) { return d.label; });

      text.append('tspan')
          .attr('class', 'value')
          .attr('x', tooltipMargin.left)
          .attr('dy', '1.5em')
          .text(function(d) {
            return d.value;
          });

      bbox = text.node().getBBox();

      border.attr('width', bbox.width + margin.left + margin.right)
          .attr('height', bbox.height + margin.top + margin.bottom);
    }

    // Set the default tooltip rendering function.  This can be overridden
    // with the setter below.
    tooltipFn = renderTooltip;

    function chart(selection) {
      selection.each(function(data, i) {
        var containerWidth = parseInt(d3.select(this).style('width'), 10);
        width = containerWidth - margin.left - margin.right;
        height = Math.ceil(width * (1 / aspectRatio)) - margin.top - margin.bottom;
        var x = d3.scale.ordinal()
          .domain(data.map(function(d) { return d.label; }))
          .rangeRoundBands([0, width], 0.1);
        var y = d3.scale.linear()
          .domain([0, d3.max(data, function(d) { return d.value; })])
          .range([height, 0]);
        var xAxis = d3.svg.axis()
            .scale(x);
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');
        var svg = d3.select(this).append('svg')
            .attr('class', 'chart-bar')
            .attr("width", containerWidth)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var tooltip = null;
        var bar = svg.selectAll(".bar")
            .data(data)
          .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', function(d) { return x(d.label); })
            .attr('y', function(d) { return y(d.value); })
            .attr('height', function(d) { return height - y(d.value); })
            .attr('width', x.rangeBand())
            .on('mouseover', function(d, i) {
              tooltip = svg.append('g')
                  .datum(d)
                  .attr('class', tooltipClass)
                  .call(tooltipFn)
                  .call(positionTooltip);
            })
            .on('mousemove', function(d, i) {
              if (tooltip !== null) {
                tooltip.call(positionTooltip);
              }
            })
            .on('mouseout', function(d, i) {
              if (tooltip !== null) {
                tooltip.remove();
              }
              tooltip = null;
            });


        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis);

      });
    }

    // Getters/setters for public configuration properties

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.aspectRatio = function(_) {
      if (!arguments.length) return aspectRatio;
      aspectRatio = _;
      return chart;
    };

    chart.tooltipFn = function(_) {
      if (!arguments.length) return tooltipFn;
      tooltipFn = _;
      return chart;
    };

    return chart;
  }

  charts.barChart = barChart;
})(window, document, d3, window.Convictions || {});
