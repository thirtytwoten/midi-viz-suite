let fs = require('fs'),
    path = require('path'),
    MidiConvert = require('./third-party/MidiConvert');

let songPath, beatLength;

if(!process.argv[2]) {
  console.log('ERROR: no midi file path provided');
  console.log('USAGE-EXAMPLE$ npm run add-song public/songs/bwv-846.midi');
  process.exit(1);
} else {
  songPath = process.argv[2];
}

fs.readFile(songPath, "binary", function(err, midiBlob) {
  if (err) {
    console.log(err)
    process.exit(1);
  } else {
    midiData = MidiConvert.parse(midiBlob);
    beatLength = 60 / midiData.header.bpm;
    createStackGraphData(midiData);
  }
});

function createStackGraphData(midiData) {
  // use schema as data obj base
  let stackGraphData = schema;
  // populate song header data
  Object.assign(stackGraphData.songHeader, midiData.header);
  // populate notesStack
  let notes = midiData.tracks[2].notes;
  populateNotesStack(stackGraphData, notes);
}

function playOrder(a,b) {
  if( a.time < b.time) {
    return -1;
  } else if (a.time > b.time) {
    return 1;
  } else {
    return 0;
  }
}

function getNoteLetter(note) {
  return note.name.slice(0,-1).replace('#','s');
}

function populateNotesStack(stackGraphData, notes) {
  let notesStack = stackGraphData.notesStack;
  let delayMax = beatLength / 8;
  // sort notes
  notes.sort(playOrder);
  // link notes
  for(let i = 0; i < notes.length; i++){
    if(i > 0){
      let prev = notes[i-1];
      if(notes[i].noteOn < prev.noteOff + delayMax) {
        notes[i].leading = getNoteLetter(prev);
      }
    }
    if(i < notes.length - 1) {
      let next = notes[i+1];
      if(next.noteOn < notes[i].noteOff + delayMax) {
        notes[i].following = getNoteLetter(next);
      }
    }
  }
  // build data stack
  for(let i = 0; i < notes.length; i++){
    let curr = notes[i];
    let currScaleLetter = getNoteLetter(curr);
    curr.leading ? notesStack[currScaleLetter].leading[curr.leading] += 1 : null;
    curr.following ? notesStack[currScaleLetter].following[curr.following] += 1 : null;
  }
  // output stackGraphData to file
  let outputPath = __dirname + `/../public/songs/${path.basename(songPath)}.json`;
  outputFile(JSON.stringify(stackGraphData), outputPath);
}

function outputFile(data, path) {
  fs.writeFile(path, data, function(err) {
    if(err) {
      console.log(`error writing to file: ${err}`);
      process.exit(1);
    } else {
      console.log(`process successful: data written to ${path}`);
      process.exit(0);
    }
  });
}

