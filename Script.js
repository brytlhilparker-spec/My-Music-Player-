const songs = [
  {
    file: "1 spirit & Theophilus Sunday chant song.mp3",
    title: "Spirit Chant",
    artist: "Theophilus Sunday"
  },
  {
    file: "Joe Mettle. song.mp3",
    title: "My Favourite Song",
    artist: "Joe Mettle"
  },
  {
    file: "MIDNIGHT CREW...JGWE 1 song.mp3",
    title: "Midnight Crew",
    artist: "Midnight Crew"
  },
  {
    file: "Minister GUC - Obinigwe song.mp3",
    title: "Obinigwe",
    artist: "Minister GUC"
  },
  {
    file: "Moses Bliss - Too Faithful song.mp3",
    title: "Too Faithful",
    artist: "Moses Bliss"
  }
];

let currentSong = 0;

const audio = document.getElementById("audio");
const playButton = document.querySelector(".play");

function playSong(index) {
  currentSong = index;

  audio.src = songs[currentSong].file;

  document.getElementById("song-title").textContent =
    songs[currentSong].title;

  document.getElementById("artist-name").textContent =
    songs[currentSong].artist;

  audio.play().catch(function () {
    alert("Could not play this song. Check the filename.");
  });
}


playButton.addEventListener("click", function () {
  if (audio.paused) {
    playSong(currentSong);
    playButton.textContent = "Ⅱ";
  } else {
    audio.pause();
    playButton.textContent = "▶";
  }
});

audio.addEventListener("ended", function () {
  currentSong = (currentSong + 1) % songs.length;
  playSong(currentSong);
});
const buttons = document.querySelectorAll(".controls button");

buttons[0].addEventListener("click", function () {
  currentSong = (currentSong - 1 + songs.length) % songs.length;
  playSong(currentSong);
});

buttons[2].addEventListener("click", function () {
  currentSong = (currentSong + 1) % songs.length;
  playSong(currentSong);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./service-worker.js")
      .then(function () {
        console.log("Offline support registered!");
      })
      .catch(function (error) {
        console.error("Service worker registration failed:", error);
      });
  });
}
