const container = document.getElementById("songs");
const artistsContainer = document.getElementById("artists");
const recentContainer = document.getElementById("recent");

const API_KEY = "ba02ff83d6a8356b395b80892567b71d";

const fixedSongs = ["Shape of You", "Believer"];

let playlist = [];
let currentAudio = null;
let currentIndex = -1;

const playBtn = document.getElementById("play");
const progressBar = document.querySelector(".percentage_bar_of_song");
const playedTime = document.querySelector(".played_time_of_song");
const totalTime = document.querySelector(".total_time_of_song");
const volumeSlider = document.getElementById("volume");
const soundIcon = document.querySelector(".condition_of_sound img");

let lastVolume = volumeSlider.value;
let dragging = false;

function shortenText(text, max = 14) {
    if (text.length > max) {
        return text.slice(0, max) + "...";
    }
    return text;
}

async function createCard(song) {

    const api = `https://itunes.apple.com/search?term=${encodeURIComponent(song)}&entity=song&limit=1`;

    const response = await fetch(api);
    const data = await response.json();

    if (data.results.length === 0) return;

    const music = data.results[0];

    const artwork = music.artworkUrl100.replace("100x100", "1000x1000");

    const card = document.createElement("div");
    card.className = "Trending_songs_card";

    card.innerHTML = `
<img src="${music.artworkUrl100.replace("100x100", "500x500")}">

<div class="song">${shortenText(music.trackName, 20)}</div>

<div class="artist">${music.artistName}</div>

<audio src="${music.previewUrl}"></audio>

<button class="play_button_of_trending_card">
<img src="assets/play.svg">
</button>
`;

    container.appendChild(card);

    const audio = card.querySelector("audio");
    const btn = card.querySelector("button");

    const songObj = {
        audio: audio,
        artwork: artwork,
        name: music.trackName,
        artist: music.artistName
    };

    playlist.push(songObj);

    btn.addEventListener("click", () => {
        playSong(songObj);
    });

}

async function loadSongs() {

    for (const song of fixedSongs) {
        await createCard(song);
    }

    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&limit=35&api_key=${API_KEY}&format=json`);
    const data = await res.json();

    let usedArtists = new Set();

    for (const track of data.tracks.track) {

        if (container.children.length >= 20) break;

        if (!usedArtists.has(track.artist.name)) {

            usedArtists.add(track.artist.name);

            createCard(track.name);

        }

    }

}

loadSongs();

function playSong(songObj) {

    const audio = songObj.audio;

    playlist.forEach(item => {

        if (item.audio !== audio) {

            item.audio.pause();
            item.audio.currentTime = 0;

        }

    });

    currentAudio = audio;
    currentIndex = playlist.indexOf(songObj);

    audio.volume = volumeSlider.value;

    audio.play();

    audio.onended = () => {
        playNext();
    };

    playBtn.querySelector("img").src = "assets/pause.svg";

    document.body.style.backgroundImage = `url(${songObj.artwork})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";

    const nameElement = document.querySelector(".song_name");

    nameElement.textContent = shortenText(songObj.name, 14);

    document.querySelector(".artist_name").textContent = songObj.artist;

    addRecent(songObj);

}

playBtn.addEventListener("click", () => {

    if (!currentAudio) return;

    if (currentAudio.paused) {

        currentAudio.play();
        playBtn.querySelector("img").src = "assets/pause.svg";

    } else {

        currentAudio.pause();
        playBtn.querySelector("img").src = "assets/playofplaybar.svg";

    }

});

function updateProgress() {

    if (currentAudio) {

        const current = currentAudio.currentTime;
        const duration = currentAudio.duration;

        if (duration) {

            const percent = (current / duration) * 100;

            progressBar.style.setProperty("--progress", percent + "%");

            playedTime.textContent = formatTime(current);
            totalTime.textContent = formatTime(duration);

        }

    }

    requestAnimationFrame(updateProgress);

}

requestAnimationFrame(updateProgress);

progressBar.addEventListener("click", (e) => {

    if (!currentAudio) return;

    const rect = progressBar.getBoundingClientRect();

    const percent = (e.clientX - rect.left) / rect.width;

    currentAudio.currentTime = percent * currentAudio.duration;

});

progressBar.addEventListener("mousedown", () => {
    dragging = true;
});

document.addEventListener("mouseup", () => {
    dragging = false;
});

document.addEventListener("mousemove", (e) => {

    if (!dragging || !currentAudio) return;

    const rect = progressBar.getBoundingClientRect();

    const percent = (e.clientX - rect.left) / rect.width;

    currentAudio.currentTime = percent * currentAudio.duration;

});

volumeSlider.addEventListener("input", () => {

    if (!currentAudio) return;

    currentAudio.volume = volumeSlider.value;

    if (volumeSlider.value == 0) {

        soundIcon.src = "assets/mute.svg";

    } else {

        soundIcon.src = "assets/sound.svg";
        lastVolume = volumeSlider.value;

    }

});

soundIcon.addEventListener("click", () => {

    if (!currentAudio) return;

    if (soundIcon.src.includes("sound.svg")) {

        lastVolume = volumeSlider.value;

        currentAudio.volume = 0;
        volumeSlider.value = 0;

        soundIcon.src = "assets/mute.svg";

    } else {

        currentAudio.volume = lastVolume;
        volumeSlider.value = lastVolume;

        soundIcon.src = "assets/sound.svg";

    }

});

function playNext() {

    if (currentIndex < playlist.length - 1) {

        playlist[currentIndex].audio.pause();

        currentIndex++;

        playSong(playlist[currentIndex]);

    }

}

document.getElementById("next").addEventListener("click", () => {

    playNext();

});

document.getElementById("prev").addEventListener("click", () => {

    if (currentIndex > 0) {

        playlist[currentIndex].audio.pause();

        currentIndex--;

        playSong(playlist[currentIndex]);

    }

});

document.addEventListener("ended", (e) => {

    if (e.target.tagName === "AUDIO") {
        playNext();
    }

}, true);

function addRecent(songObj) {

    const card = document.createElement("div");

    card.className = "recent_item";

    card.innerHTML = `
    <img src="${songObj.artwork}" width="40">
    <span>${shortenText(songObj.name, 18)}</span>
    `;

    card.addEventListener("click", () => {
        playSong(songObj);
    });

    recentContainer.prepend(card);

    if (recentContainer.children.length > 50) {
        recentContainer.removeChild(recentContainer.lastChild);
    }

}

function formatTime(sec) {

    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;

}

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

async function searchMusic() {

    const query = document.getElementById("search_input").value;

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=20`;

    const res = await fetch(url);
    const data = await res.json();

    const results = document.getElementById("results");
    results.innerHTML = "";

    data.results.forEach(song => {

        const div = document.createElement("div");
        div.className = "song";

        div.innerHTML = `
        <img src="${song.artworkUrl100}">
        <div class="info">
        <h3>${song.trackName}</h3>
        <p>${song.artistName}</p>
        </div>
        `;

        results.appendChild(div);

        div.addEventListener("click", () => {

            const audio = new Audio(song.previewUrl);

            const songObj = {
                audio: audio,
                artwork: song.artworkUrl100.replace("100x100", "1000x1000"),
                name: song.trackName,
                artist: song.artistName
            };

            playlist.push(songObj);

            playSong(songObj);

        });

    });

}

document.addEventListener("click", function (e) {

    const searchBox = document.getElementById("searchbox");
    const searchBtn = document.getElementById("search");

    // agar click searchbox ya search button ke andar nahi hua
    if (!searchBox.contains(e.target) && !searchBtn.contains(e.target)) {
        searchBox.style.display = "none";
        document.getElementById("active_button").style.background = "linear-gradient(145deg, #6f8cff, #5b2fff)";
        document.getElementById("active_button").style.top = "33%";
    }

});

document.getElementById("searchbox_button").addEventListener("click", () => { searchMusic(); });

document.getElementById("home").onclick = function () {
    document.getElementById("searchbox").style.display = "none";
    document.getElementById("active_button").style.background = "linear-gradient(145deg, #6f8cff, #5b2fff)";
    document.getElementById("active_button").style.top = "33%";
};

document.getElementById("search").onclick = function () {
    document.getElementById("searchbox").style.display = "block";
    document.getElementById("active_button").style.background = "linear-gradient(145deg, #7de0ff, #4a8dff)";
    document.getElementById("active_button").style.top = "47.5%";
};

document.getElementById("libary").onclick = function (e) {

    e.stopPropagation();

    document.getElementById("searchbox").style.display = "none";

    document.getElementById("active_button").style.background =
        "linear-gradient(145deg, #ff7b7b, #ff3a3a)";

    document.getElementById("active_button").style.top = "62.4%";
};

const randomSongs = [
"Blinding Lights",
"Stay",
"Believer",
"Shape of You",
"Starboy",
"Bad Guy",
"Heat Waves",
"Senorita",
"Levitating",
"Peaches"
];

async function playRandomSong(){

    const randomIndex = Math.floor(Math.random() * randomSongs.length);

    const songName = randomSongs[randomIndex];

    const api = `https://itunes.apple.com/search?term=${encodeURIComponent(songName)}&entity=song&limit=1`;

    const res = await fetch(api);
    const data = await res.json();

    if(data.results.length === 0) return;

    const music = data.results[0];

    const audio = new Audio(music.previewUrl);

    const songObj = {
        audio: audio,
        artwork: music.artworkUrl100.replace("100x100","1000x1000"),
        name: music.trackName,
        artist: music.artistName
    };

    playlist.push(songObj);

    playSong(songObj);

}

document.getElementById("next").addEventListener("click", () => {

    if (currentIndex < playlist.length - 1) {

        playNext();

    } 
    else {

        playRandomSong();

    }

});