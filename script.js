const container = document.getElementById("songs");
const artistsContainer = document.getElementById("artists");
const recentContainer = document.getElementById("recent");
const favoritesContainer = document.getElementById("favorites");

const playBtn = document.getElementById("play");
const progressBar = document.querySelector(".percentage_bar_of_song");
const playedTime = document.querySelector(".played_time_of_song");
const totalTime = document.querySelector(".total_time_of_song");

const volumeSlider = document.getElementById("volume");
const soundIcon = document.querySelector(".condition_of_sound img");

const searchBox = document.getElementById("searchbox");
const favoriteBox = document.getElementById("favorite_songs");
const activeBtn = document.getElementById("active_button");

const API_KEY = "ba02ff83d6a8356b395b80892567b71d";

let playlist = [];
let currentAudio = null;
let currentIndex = -1;

let favoriteList = JSON.parse(localStorage.getItem("favorites")) || [];
let recentList = JSON.parse(localStorage.getItem("recent")) || [];

function shortenText(text, max = 14) {
    return text.length > max ? text.slice(0, max) + "..." : text;
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function setActive(top, color) {
    activeBtn.style.top = top;
    activeBtn.style.background = color;
}

document.getElementById("home").onclick = () => {
    searchBox.style.display = "none";
    favoriteBox.style.display = "none";
    setActive("33%", "linear-gradient(145deg, #6f8cff, #5b2fff)");
};

document.getElementById("search").onclick = () => {
    searchBox.style.display = "block";
    favoriteBox.style.display = "none";
    setActive("47.5%", "linear-gradient(145deg, #7de0ff, #4a8dff)");
};

document.getElementById("libary").onclick = (e) => {
    e.stopPropagation();
    favoriteBox.style.display = "block";
    searchBox.style.display = "none";
    setActive("62.4%", "linear-gradient(145deg, #ff7b7b, #ff3a3a)");
};

async function createCard(song) {

    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(song)}&entity=song&limit=1`);
    const data = await res.json();

    if (!data.results.length) return;

    const music = data.results[0];

    const card = document.createElement("div");
    card.className = "Trending_songs_card";

    card.innerHTML = `
<img class="fav" src="assets/favorite.svg">
<img class="card_img" src="${music.artworkUrl100}">
<div class="song">${shortenText(music.trackName, 20)}</div>
<div class="artist">${music.artistName}</div>
<audio src="${music.previewUrl}"></audio>
<button class="play_button_of_trending_card"><img src="assets/play.svg"></button>
`;

    container.appendChild(card);

    const audio = card.querySelector("audio");
    const btn = card.querySelector("button");
    const favBtn = card.querySelector(".fav");

    const songObj = {
        audio,
        artwork: music.artworkUrl100.replace("100x100", "1000x1000"),
        name: music.trackName,
        artist: music.artistName
    };

    playlist.push(songObj);

    btn.onclick = () => playSong(songObj);

    if (favoriteList.some(s => s.name === songObj.name)) {
        favBtn.src = "assets/filed_favorite.svg";
    }

    favBtn.onclick = (e) => {
        e.stopPropagation();

        const exists = favoriteList.some(s => s.name === songObj.name);

        if (!exists) {
            favBtn.src = "assets/filed_favorite.svg";
            addToFavorites(songObj);
        } else {
            favBtn.src = "assets/favorite.svg";
            removeFromFavorites(songObj);
        }
    };
}

async function loadSongs() {
    const songs = [
        "Shape of You",
        "Believer",
        "Blinding Lights",
        "Stay",
        "Levitating",
        "Senorita"
    ];

    for (let s of songs) {
        await createCard(s);
    }
}
loadSongs();

function playSong(songObj) {

    playlist.forEach(s => {
        s.audio.pause();
        s.audio.currentTime = 0;
    });

    currentAudio = songObj.audio;
    currentIndex = playlist.indexOf(songObj);

    currentAudio.play();

    playBtn.querySelector("img").src = "assets/pause.svg";

    document.querySelector(".song_name").textContent = shortenText(songObj.name);
    document.querySelector(".artist_name").textContent = songObj.artist;

    document.body.style.backgroundImage = `url(${songObj.artwork})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";

    addRecent(songObj);
}

playBtn.onclick = () => {
    if (!currentAudio) return;

    if (currentAudio.paused) currentAudio.play();
    else currentAudio.pause();
};

function updateProgress() {

    if (currentAudio) {
        const cur = currentAudio.currentTime;
        const dur = currentAudio.duration;

        if (dur) {
            const percent = (cur / dur) * 100;
            progressBar.style.setProperty("--progress", percent + "%");

            playedTime.textContent = formatTime(cur);
            totalTime.textContent = formatTime(dur);
        }
    }

    requestAnimationFrame(updateProgress);
}
updateProgress();

progressBar.onclick = (e) => {
    if (!currentAudio) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;

    currentAudio.currentTime = percent * currentAudio.duration;
};

volumeSlider.oninput = () => {
    if (!currentAudio) return;

    currentAudio.volume = volumeSlider.value;
    soundIcon.src = volumeSlider.value == 0 ? "assets/mute.svg" : "assets/sound.svg";
};

document.getElementById("next").onclick = () => {
    if (currentIndex < playlist.length - 1) {
        currentIndex++;
        playSong(playlist[currentIndex]);
    }
};

document.getElementById("prev").onclick = () => {
    if (currentIndex > 0) {
        currentIndex--;
        playSong(playlist[currentIndex]);
    }
};

function addToFavorites(songObj) {

    if (favoriteList.some(s => s.name === songObj.name)) return;

    favoriteList.push({
        name: songObj.name,
        artist: songObj.artist,
        artwork: songObj.artwork,
        preview: songObj.audio.src
    });

    localStorage.setItem("favorites", JSON.stringify(favoriteList));
    renderFavorites();
}

function removeFromFavorites(songObj) {

    favoriteList = favoriteList.filter(s => s.name !== songObj.name);

    localStorage.setItem("favorites", JSON.stringify(favoriteList));
    renderFavorites();
}

function renderFavorites() {

    favoritesContainer.innerHTML = "";

    favoriteList.forEach(song => {

        const div = document.createElement("div");
        div.className = "recent_item";

        div.innerHTML = `
<img src="${song.artwork}" width="40">
<span>${shortenText(song.name, 18)}</span>
`;

        div.onclick = () => {

            const obj = {
                audio: new Audio(song.preview),
                artwork: song.artwork,
                name: song.name,
                artist: song.artist
            };

            playlist.push(obj);
            playSong(obj);
        };

        favoritesContainer.appendChild(div);
    });
}

function addRecent(songObj) {

    const data = {
        name: songObj.name,
        artist: songObj.artist,
        artwork: songObj.artwork,
        preview: songObj.audio.src
    };

    recentList = recentList.filter(s => s.name !== data.name);
    recentList.unshift(data);

    localStorage.setItem("recent", JSON.stringify(recentList));
    renderRecent();
}

function renderRecent() {

    recentContainer.innerHTML = "";

    recentList.forEach(song => {

        const div = document.createElement("div");
        div.className = "recent_item";

        div.innerHTML = `
<img src="${song.artwork}" width="40">
<span>${shortenText(song.name, 18)}</span>
`;

        div.onclick = () => {

            const obj = {
                audio: new Audio(song.preview),
                artwork: song.artwork,
                name: song.name,
                artist: song.artist
            };

            playlist.push(obj);
            playSong(obj);
        };

        recentContainer.appendChild(div);
    });
}

async function loadArtists() {

    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&limit=10&api_key=${API_KEY}&format=json`);
    const data = await res.json();

    for (const artist of data.artists.artist) {

        try {
            const wiki = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artist.name)}`);
            const wikiData = await wiki.json();

            if (!wikiData.thumbnail) continue;

            const card = document.createElement("div");
            card.className = "Artist_card";

            card.innerHTML = `
<img src="${wikiData.thumbnail.source}">
<div class="name">${artist.name}</div>
`;

            artistsContainer.appendChild(card);

        } catch {}
    }
}
loadArtists();

renderFavorites();
renderRecent();

document.addEventListener("click", (e) => {

    const isSearchOpen = searchBox.style.display === "block";
    const isFavOpen = favoriteBox.style.display === "block";

    const clickedInsideSearch = searchBox.contains(e.target);
    const clickedInsideFav = favoriteBox.contains(e.target);
    const clickedSearchBtn = document.getElementById("search").contains(e.target);
    const clickedLibBtn = document.getElementById("libary").contains(e.target);

    if ((isSearchOpen || isFavOpen) &&
        !clickedInsideSearch &&
        !clickedInsideFav &&
        !clickedSearchBtn &&
        !clickedLibBtn) {

        searchBox.style.display = "none";
        favoriteBox.style.display = "none";

        setActive("33%", "linear-gradient(145deg, #6f8cff, #5b2fff)");
    }
});
