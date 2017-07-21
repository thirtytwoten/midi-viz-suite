let noteData = [];

notes.forEach(function(n){
  let nd = {
    letter: getNoteLetter(n),
    time: n.time
  }
  noteData.push(nd);
});
