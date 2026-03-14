const container = document.getElementById("songs");

const API_KEY = "ba02ff83d6a8356b395b80892567b71d";

const fixedSongs = [
    "Shape of You",
    "Believer"
];

async function createCard(song) {

    const api = `https://itunes.apple.com/search?term=${encodeURIComponent(song)}&entity=song&limit=1`;

    const response = await fetch(api);
    const data = await response.json();

    if (data.results.length > 0) {

        const music = data.results[0];

        let songName = music.trackName;
        if (songName.length > 20) {
            songName = songName.slice(0, 20) + "...";
        }

        const card = document.createElement("div");
        card.className = "Trending_songs_card";

        card.innerHTML = `
<img src="${music.artworkUrl100.replace('100x100', '500x500')}">
<div class="song">${songName}</div>
<div class="artist">${music.artistName}</div>
<audio id="audio-${music.trackId}" src="${music.previewUrl}"></audio><button onclick="playSong(
'audio-${music.trackId}',
'${music.artworkUrl100.replace("100x100", "1000x1000")}',
'${music.trackName}',
'${music.artistName}'
)" class="play_button_of_trending_card">
<img src="assets/play.svg">
</button>
`;

        container.appendChild(card);

    }

}

async function loadSongs() {

    for (let song of fixedSongs) {
        await createCard(song);
    }

    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&limit=35&api_key=${API_KEY}&format=json`);
    const data = await res.json();

    let usedArtists = new Set();

    data.tracks.track.forEach(async track => {

        if (container.children.length >= 20) return;

        if (!usedArtists.has(track.artist.name)) {

            usedArtists.add(track.artist.name);

            createCard(track.name);

        }

    });

}

function playSong(id, artwork, name, artist) {

    const audio = document.getElementById(id);

    document.querySelectorAll("audio").forEach(a => {
        if (a.id !== id) {
            a.pause();
            a.currentTime = 0;
        }
    });

    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }

    // background change
    document.body.style.backgroundImage = `url(${artwork})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";

    // play bar update
    document.querySelector(".song_name").textContent = name;
    document.querySelector(".artist_name").textContent = artist;
}

loadSongs();

const artistsContainer = document.getElementById("artists");

async function loadArtists() {

    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&limit=20&api_key=${API_KEY}&format=json`);
    const data = await res.json();

    for (const artist of data.artists.artist) {

        try {

            const wiki = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artist.name)}`);
            const wikiData = await wiki.json();

            if (!wikiData.thumbnail) continue;

            const imageUrl = wikiData.thumbnail.source;

            const card = document.createElement("div");
            card.className = "Artist_card";

            card.innerHTML = `
<img src="${imageUrl}">
<div class="name">${artist.name}</div>
`;

            artistsContainer.appendChild(card);

        } catch (e) {
            console.log("error", artist.name);
        }

    }

}

loadArtists();

// async function searchArtist(name) {
//     const res = await fetch(`https://itunes.apple.com/search?term=${name}&entity=musicArtist`);
//     const data = await res.json();

//     const artistId = data.results[0].artistId;

//     const songs = await fetch(`https://itunes.apple.com/lookup?id=${artistId}&entity=song&limit=25`);
//     const songData = await songs.json();

//     const songList = songData.results
//         .filter(item => item.wrapperType === "track")
//         .map(song => ({
//             name: song.trackName,
//             mp3: song.previewUrl
//         }));

//     console.log(songList);
// }

// searchArtist("arijit singh");