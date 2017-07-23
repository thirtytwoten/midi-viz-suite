//dep: d3

function RhythmChart(song, selector){
  this.song = song;
  this.selector = selector;
  this.facetCount = song.measureResolution;
  this.margin = {top: 20, right: 20, bottom: 30, left: 40};
  this.width = 400 - this.margin.left - this.margin.right;
  this.height = 400 - this.margin.top - this.margin.bottom;
  this.svg = this.makeSvg();
  this.angleScale = d3.scaleLinear().domain([0,this.facetCount - 1]).range([0 , 2 * Math.PI]);
  this.radiusScale = d3.scaleLinear().range([15,30]); //TODO: make range dynamic
  this.graphData = this.getStackedData();
}

RhythmChart.prototype = {
  makeSvg: function(){
    return d3.select(this.selector).append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g").attr("transform","translate(" + (this.margin.left + this.width/2) + "," + (this.margin.top + this.height/2) + ")");
  },
  plot: function(){
    let rc = this;
    stackedRadialAreaChart = d3.radialArea()
      .curve(d3.curveBasisClosed)
      .angle(function(d, i) { return rc.angleScale(d.data.facetIndex) })
      .innerRadius(function(d, i) { return rc.radiusScale(d[0]) })
      .outerRadius(function(d, i) { return rc.radiusScale(d[1]) });

    this.svg.selectAll(".layer")
      .data(this.graphData)
      .enter().append("g")
      .attr("class", "layer")
      .append("path")
      .attr("class", function(d){return "area" + " n" + d.key})
      .attr("d", stackedRadialAreaChart);
  },
  getStackedData: function() {
    let nestByFacet = d3.nest().key(function(n){ return n.measureFacet });

    function rollupNoteFreq(d){ return d.reduce(function(noteCounts,facet){
      noteCounts[facet.letter] = noteCounts[facet.letter] || 0;
      noteCounts[facet.letter]++;
      return noteCounts;
    },{})}

    function sortAscKey(a,b){return parseInt(a.key) - parseInt(b.key)}

    function flattenFacet(facet){
      return Object.assign(facet.value, { facetIndex: parseInt(facet.key) });
    }

    let dataNest = nestByFacet.rollup(rollupNoteFreq).entries(this.song.noteData)
                    .sort(sortAscKey).map(flattenFacet);

    let stack = d3.stack()
      .keys(this.song.basicNotes).value(function(d,key){ return d[key] || 0 })
      .offset(d3.stackOffsetNone);

    return stack(dataNest);
  }

}  
