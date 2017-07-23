// depends on MidiFile.js // and Tone.js to work

function Song(path, beatResolution = 16){
  this.basicNotes = ["A", "As", "B", "C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs"];
  this.path = path;
  this.beatResolution = beatResolution;
  this.midiData = null;
  this.midiNotes = null;
  this.noteData = null;
  this.bpMeasure = null;
  this.bpMinute = null;
  this.beatPeriod = null;
  this.measurePeriod = null;
  this.measureResolution = null;
  this.facetLength = null;
}

Song.prototype = {
  parse: function(){
    let s = this;
    return (new Promise( function(resolve, reject){
        MidiConvert.load("bwv-846.midi").then(function(midi){
          s.midiData = midi;
          s.bpMeasure = midi.header.timeSignature[0];
          s.bpMinute = midi.header.bpm;
          s.beatPeriod = (s.bpMinute / 60);
          s.measurePeriod = s.pMeasure * s.beatPeriod;
          s.measureResolution = s.bpMeasure * s.beatResolution;
          s.facetLength = s.measurePeriod / s.measureResolution;
          s.midiNotes = s.getMidiNotes();
          s.noteData = s.getDataNotes();
          resolve(s);
        }).catch(function(err){ reject(err) });
  })) },
  getMidiNotes: function(){
    return this.midiData.tracks.reduce(function(notes,track){
      return !track.isPercussion ? notes.concat(track.notes) : notes
    },[]);
  },
  getDataNotes: function(){
    let s = this;
    return this.midiNotes.map(function(n){ return Object.assign(n,{
      id: s.getNoteId(n),
      letter: s.getNoteLetter(n),
      measure: parseInt(n.time / s.measurePeriod),
      measureBucket: parseInt((n.time % s.measurePeriod) / s.facetLength)
    });});
  },
  getNoteId: function(note){
    return `${note.name}-${note.time}`.replace('#','s').replace('.','-');
  },
  getNoteLetter: function(note){
    return note.name.slice(0,-1).replace('#','s');
  }
}


// MidiConvert.load("bwv-846.midi").then(function(midi){
//   midiData = midi;
//   let bpMeasure = midiData.header.timeSignature[0];
//   let bpMinute = midiData.header.bpm;
//   let beatPeriod = (this.bpMinute / 60);
//   let measurePeriod = this.bpMeasure * this.beatPeriod;
//   let measureResolution = this.bpMeasure * this.beatResolution;
//   let facetLength = this.measurePeriod / this.measureResolution;

//   let notes = midiData.tracks[1].notes.concat(midiData.tracks[2].notes);
//   noteData = notes.map(function(n){ return Object.assign(n, {
//       id: getNoteId(n),
//       keyNumber: parseInt(n.midi),
//       letter: getNoteLetter(n),
//       time: n.time,
//       measure: parseInt(n.time / this.measurePeriod),
//       measureFacet: parseInt((n.time % this.measurePeriod) / this.facetLength)
//   }); });

//   // stackedData = stackNotesByFacet(noteData);
//   // plotRadialChart(stackedData, measureResolution);
//   // freqChart = new FreqChart(noteData, "#freqChart");
//   // freqChart.plot();
//   // plotScrollChart(noteData);
//   // prepAudio(midi);
//   // d3.select(".songBox .songName").text(midiData.header.name);
// });