function FreqChart(noteData, selector) {
  this.rawData = noteData;
  this.graphData = this.formatData(noteData);
  this.selector = selector;
  this.margin = {top: 20, right: 20, bottom: 30, left: 40};
  this.width = 500 - this.margin.left - this.margin.right;
  this.height = 300 - this.margin.top - this.margin.bottom;
  this.xScale = d3.scaleBand().range([0, this.width]).padding(0.1);
  this.yScale = d3.scaleLinear().range([this.height, 0]);
  this.svg = this.makeSvg();
}

FreqChart.prototype = {
  formatData: function(noteData) {
    return d3.nest().key(function(n){ return n.letter })
      .rollup(function(notes){ return notes.length })
      .entries(noteData);
  },
  subSelection: function(timeRange){
    let filteredRaw = this.rawData.filter(function(n){
      return n.time >= timeRange[0] && n.time <= timeRange[1];
    });
    this.graphData = this.formatData(filteredRaw);
    this.redraw();
  },
  makeSvg: function(){
    return d3.select(this.selector).append('svg')
              .attr("width", this.width + this.margin.left + this.margin.right)
              .attr("height", this.height + this.margin.top + this.margin.bottom)
              .append("g").attr("transform","translate(" + this.margin.left + "," + this.margin.top + ")");
  },
  plot: function() {
    let fc = this;
    this.xScale.domain(NOTES);
    this.yScale.domain([0, d3.max(this.graphData, function(d) { return d.value; })]);

    this.svg.selectAll(".bar").data(this.graphData).enter()
      .append("rect")
        .attr('class', function(d) { return 'bar' + ' n' + d.key; })
        .attr("x", function(d) { return fc.xScale(d.key); })
        .attr("width", fc.xScale.bandwidth())
        .attr("y", function(d) { return fc.yScale(d.value); })
        .attr("height", function(d) { return fc.height - fc.yScale(d.value); });
    this.svg.append("g")
        .attr("transform", "translate(0," + fc.height + ")")
        .call(d3.axisBottom(fc.xScale));
    this.svg.append("g")
        .call(d3.axisLeft(fc.yScale));
  },
  redraw: function() {
    this.svg.selectAll(".bar").remove();
    this.svg.selectAll('g').remove();
    this.plot();
  }
};
