//dep: d3

function ScrollChart(song, selector, subSelectGraph){
  this.song = song;
  this.selector = selector;
  this.margin = {top: 20, right: 20, bottom: 30, left: 40},
  this.width = 1000 - this.margin.left - this.margin.right,
  this.height = 300 - this.margin.top - this.margin.bottom;
  this.noteHeight = 7;
  this.scaleX = d3.scaleLinear().range([0, this.width]);
  this.scaleY = d3.scaleLinear().range([this.height, 0]);
  this.xAxis = d3.axisBottom(this.scaleX).tickFormat(this.minSecFmt);
  this.yAxis = d3.axisLeft(this.scaleY);
  this.svg = this.makeSvg();

  if (subSelectGraph) {
    this.subSelectGraph = subSelectGraph;
    this.brush = d3.brushX().extent([[0, 0], [this.width, this.height]]).on("end", brushed);
    let sc = this;
    function brushed() {
      let selection = d3.event.selection;
      selectedRange = selection.map(sc.scaleX.invert, sc.scaleX)
      subSelectGraph.subSelection(selectedRange);
    }
  }
}

ScrollChart.prototype = {
  minSecFmt: function(seconds) {
    let min = parseInt(seconds / 60);
    let sec = parseInt(seconds % 60);
    return (min + ":" + (sec < 10 ? '0' : '') + sec)
  },
  makeSvg: function(){
    return d3.select(this.selector).append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);
  },
  playNote: function(event){
    this.svg.select('.playHead')
      .attr("x1", this.scaleX(event.time))
      .attr("x2", this.scaleX(event.time))
    this.svg.select(`#${event.id}`)
      .attr('height',this.noteHeight+2).style('opacity',1)
      .transition().duration(event.duration * 1000)
      .attr('height',this.noteHeight).style('opacity',0.75);
  },
  plot: function(){
    let noteData = this.song.noteData;
    let sc = this;
    this.scaleX.domain(d3.extent(noteData, function(d) { return d.time }));
    this.scaleY.domain([d3.min(noteData, function(d) { return d.midi })-2, 
            d3.max(noteData, function(d) { return d.midi })+2 ]);

    this.svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", this.width)
      .attr("height", this.height);

    let context = this.svg.append("g")
      .attr("class", "context");

    let dots = context.append("g");
    dots.attr("clip-path", "url(#clip)");
    dots.selectAll(".dots")
        .data(noteData)
        .enter().append("rect")
        .attr('class', function(n) { return 'dot' + ' n' + n.letter })
        .attr('id', function(n){return n.id})
        .style("opacity", 1)
        .attr("x", function(n) { return sc.scaleX(n.time) })
        .attr("y", function(n) { return sc.scaleY(n.midi) })
        .attr("width", function(n) { return sc.scaleX(n.noteOff) - sc.scaleX(n.noteOn) })
        .attr("height", this.noteHeight);

    context.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + this.height + ")")
          .call(this.scaleX);

    context.append("g")
          .attr("class", "brush")
          .call(this.brush)
          .call(this.brush.move, this.scaleX.range());

    context.append("line")
        .attr("class", "playHead")
        .attr("x1", this.scaleX(0))
        .attr("y1", this.height + 10)
        .attr("x2", this.scaleX(0))
        .attr("y2", -10)
        .style("opacity", .3)
        .style("stroke", "black");
  }
}
