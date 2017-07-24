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
  this.angleScaleByTime = d3.scaleLinear().domain([0,this.song.measurePeriod]).range([0 , 2 * Math.PI]);
  this.radiusScale = d3.scaleLinear().range([20,100]); //TODO: make range dynamic so it doesn't cut off
  this.graphData = this.getStackedData();
}

RhythmChart.prototype = {
  makeSvg: function(){
    return d3.select(this.selector).append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g").attr("transform","translate(" + (this.margin.left + this.width/2) + "," + (this.margin.top + this.height/2) + ")");
  },
  playNote: function(event){
    //console.log(event);
    // this.svg.select(".radialPlayHead")
    //   .attr("x2", Math.cos(this.angleScaleByTime(event.time)) * this.height)
    //   .attr("y2", Math.sin(this.angleScaleByTime(event.time)) * this.height);

    // this.svg.selectAll('.' + event.colorClass)
    //   .style('opacity')
    //   .transition().duration(event.duration * 1000)
    //   .style('opacity',0.75);
  },
  plot: function(){
    let rc = this;
    stackedRadialAreaChart = d3.radialArea()
      .curve(d3.curveBasisClosed)
      .angle(function(d) { return rc.angleScale(d.data.facetIndex) })
      .innerRadius(function(d) { return rc.radiusScale(d[0]) })
      .outerRadius(function(d) { return rc.radiusScale(d[1]) });

    this.svg.selectAll(".layer")
      .data(this.graphData)
      .enter().append("g")
      .attr("class", "layer")
      .append("path")
      .attr("class", function(d){return "area" + " n" + d.key})
      .attr("d", stackedRadialAreaChart);

    // this.svg.append("line")
    //   .attr("class", "radialPlayHead")
    //   .attr("x1", 0)
    //   .attr("y1", 0)
    //   .attr("x2", this.angleScale(0))
    //   .attr("y2", this.height)
    //   .style("opacity", .7)
    //   .style("stroke", "black");

    // let beatFacetPeriod = this.facetCount / song.bpMeasure;
    // for(let b=0; b<this.song.bpMeasure; b++){
    //   //draw line marking each beat
    //   let f = beatFacetPeriod * b;
    //   this.svg.append("line")
    //     .attr("class", "beatLine"+b)
    //     .attr("x1", 0)
    //     .attr("y1", 0)
    //     .attr("x2", Math.cos(this.angleScale(f)) * this.height)
    //     .attr("y2", Math.sin(this.angleScale(f)) * this.height)
    //     .style("opacity", .3)
    //     .style("stroke", "black");
    // }
  },
  getStackedData: function(noteData) {
    noteData = noteData || this.song.noteData;
    let nestByFacet = d3.nest().key(function(n){ return n.measureFacet });

    // function rollupNoteFreq(d){
    //   let ru = d.reduce(function(noteCounts,note){
    //     noteCounts[note.letter] = noteCounts[note.letter] || 0;
    //     noteCounts[note.letter]++;
    //     return noteCounts;
    //   },{});
    //   return ru;
    // }

    function rollupNoteMag(d){
      let ru = d.reduce(function(noteMag,note){
        noteMag[note.letter] = noteMag[note.letter] || 0;
        noteMag[note.letter] += note.velocity * note.duration;
        return noteMag;
      },{});
      return ru;
    }

    function sortAscKey(a,b){return parseInt(a.key) - parseInt(b.key)}

    function flattenFacet(facet){
      return Object.assign(facet.value, { facetIndex: parseInt(facet.key) });
    }

    let dataNest = nestByFacet.rollup(rollupNoteMag).entries(noteData);
    let maxVal = setMaxVal(dataNest);
    dataNest = dataNest.sort(sortAscKey).map(flattenFacet)

    let stack = d3.stack()
      .keys(this.song.basicNotes).value(function(d,key){ return d[key] || 0 })
      .offset(d3.stackOffsetNone);
    
    function setMaxVal(ru){
      return ru.reduce(function(maxVal,facetObj){
        for(let n in facetObj.value){
          maxVal = Math.max(facetObj.value[n], maxVal);
          //if(maxVal == facetObj.value[n]){console.log(n);console.log(maxVal)}
        }
        return maxVal;
      },0);
    }

    this.radiusScale.domain([0,maxVal]);
    return stack(dataNest);
  },
  subSelection: function(timeRange){
    this.graphData = this.getStackedData(this.song.noteData.filter(function(n){
      return n.time >= timeRange[0] && n.time <= timeRange[1];
    }));
    this.redraw();
  },
  redraw: function() {
    this.svg.selectAll(".layer").remove();
    this.svg.selectAll('line').remove();
    this.plot();
  }
}  
