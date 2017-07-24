// depends on MidiFile.js & d3.js

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
        MidiConvert.load(s.path).then(function(midi){
          s.midiData = midi;
          s.bpMeasure = midi.header.timeSignature[0];
          s.bpMinute = midi.header.bpm;
          s.beatPeriod = (s.bpMinute / 60);
          s.measurePeriod = s.bpMeasure * s.beatPeriod;
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
      colorClass: s.getColorClass(n),
      letter: s.getNoteLetter(n),
      measure: parseInt(n.time / s.measurePeriod),
      measureFacet: parseInt((n.time % s.measurePeriod) / s.facetLength)
    });});
  },
  getNoteId: function(note){
    return `${note.name}-${note.time}`.replace('#','s').replace('.','-');
  },
  getNoteLetter: function(note){
    return note.name.slice(0,-1).replace('#','s');
  },
  getColorClass: function(note){
    return 'n' + this.getNoteLetter(note);
  }
}
