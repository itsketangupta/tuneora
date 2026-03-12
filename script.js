// function randomSong() {
//   const letters = "abcdefghijklmnopqrstuvwxyz";
//   const randomLetter = letters[Math.floor(Math.random() * letters.length)];

//   fetch(`https://itunes.apple.com/search?term=${randomLetter}&entity=song&limit=20`)
//     .then(res => res.json())
//     .then(data => {
//       const randomIndex = Math.floor(Math.random() * data.results.length);
//       const song = data.results[randomIndex];

//       console.log(song.trackName);
//       console.log(song.artistName);
//       console.log(song.previewUrl);
//     });
// }

// randomSong();