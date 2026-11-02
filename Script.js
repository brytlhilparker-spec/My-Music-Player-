
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

const audio = document.getElementById("audio");
const playButton = document.querySelector(".play");
const songTitle = document.getElementById("song-title");
const artistName = document.getElementById("artist-name");
const songList = document.getElementById("song-list");
const favoritesList = document.getElementById("favorites-list");
const progressBar = document.getElementById("progress-bar");
const currentTimeText = document.getElementById("current-time");
const durationText = document.getElementById("duration");
const playStatus = document.getElementById("play-status");
const shuffleButton = document.getElementById("shuffle-button");
const repeatButton = document.getElementById("repeat-button");
const searchInput = document.getElementById("search-songs");
const volumeControl = document.getElementById("volume-control");
const volumeValue = document.getElementById("volume-value");
const playlistCount = document.getElementById("playlist-count");

let currentSong = 0;
let isShuffle = false;
let isRepeat = false;
let isSeeking = false;
let favorites = loadFavorites();

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Playback still works if storage is unavailable.
  }
}

function loadFavorites() {
  try {
    const saved = readStorage("mmpFavorites");
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? parsed.filter(index =>
          Number.isInteger(index) &&
          index >= 0 &&
          index < songs.length
        )
      : [];
  } catch (error) {
    return [];
  }
}

function saveFavorites() {
  writeStorage("mmpFavorites", JSON.stringify(favorites));
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return minutes + ":" +
    String(remainingSeconds).padStart(2, "0");
}

function updatePlayButton() {
  const playing = !audio.paused;

  playButton.textContent = playing ? "Ⅱ" : "▶";
  playButton.setAttribute(
    "aria-label",
    playing ? "Pause song" : "Play song"
  );
}

function updateSongDisplay() {
  songTitle.textContent = songs[currentSong].title;
  artistName.textContent = songs[currentSong].artist;
  renderSongList();
}

function renderSongList() {
  songList.replaceChildren();

  const searchTerm = searchInput.value.trim().toLowerCase();
let visibleSongs = 0;
  
songs.forEach((song, index) => {
  if (
    !song.title.toLowerCase().includes(searchTerm) &&
    !song.artist.toLowerCase().includes(searchTerm)
  ) return;
  visibleSongs++;
    const row = document.createElement("div");
    row.className = "song-row";

    const selectButton = document.createElement("button");
    selectButton.className = "song-select";

    if (index === currentSong) {
      selectButton.classList.add("selected");
    }

    const title = document.createElement("strong");
    title.textContent =
      (index === currentSong && !audio.paused ? "♫ " : "") +
      song.title;

    const artist = document.createElement("span");
    artist.textContent = song.artist;

    selectButton.append(title, artist);
    selectButton.setAttribute(
      "aria-label",
      "Play " + song.title
    );

    selectButton.addEventListener("click", function () {
      playSong(index);
    });

    const favoriteButton = document.createElement("button");
    favoriteButton.className = "favorite-button";

    const isFavorite = favorites.includes(index);
    favoriteButton.textContent = isFavorite ? "♥" : "♡";
    favoriteButton.classList.toggle("is-favorite", isFavorite);
    favoriteButton.setAttribute(
      "aria-label",
      isFavorite
        ? "Remove " + song.title + " from favorites"
        : "Add " + song.title + " to favorites"
    );

    favoriteButton.addEventListener("click", function () {
      toggleFavorite(index);
    });

    row.append(selectButton, favoriteButton);
    songList.appendChild(row);
  });
  playlistCount.textContent =
    visibleSongs + (visibleSongs === 1 ? " song" : " songs");
  if (visibleSongs === 0) {
  const message = document.createElement("p");
  message.className = "section-description";
  message.textContent = "No songs found. Try another search.";
  songList.appendChild(message);
  }
}

function renderFavorites() {
  favoritesList.replaceChildren();

  if (favorites.length === 0) {
    const message = document.createElement("p");
    message.className = "section-description";
    message.textContent =
      "Your favorite songs will appear here.";
    favoritesList.appendChild(message);
    return;
  }

  favorites.forEach(index => {
    const song = songs[index];
    if (!song) return;

    const row = document.createElement("div");
    row.className = "song-row";

    const selectButton = document.createElement("button");
    selectButton.className = "song-select";

    const title = document.createElement("strong");
    title.textContent = song.title;

    const artist = document.createElement("span");
    artist.textContent = song.artist;

    selectButton.append(title, artist);
    selectButton.addEventListener("click", function () {
      playSong(index);
    });

    const removeButton = document.createElement("button");
    removeButton.className = "favorite-button is-favorite";
    removeButton.textContent = "♥";
    removeButton.setAttribute(
      "aria-label",
      "Remove " + song.title + " from favorites"
    );

    removeButton.addEventListener("click", function () {
      toggleFavorite(index);
    });

    row.append(selectButton, removeButton);
    favoritesList.appendChild(row);
  });
}

function toggleFavorite(index) {
  if (favorites.includes(index)) {
    favorites = favorites.filter(item => item !== index);
    playStatus.textContent = "Removed from favorites";
  } else {
    favorites.push(index);
    playStatus.textContent = "Added to favorites";
  }

  saveFavorites();
  renderSongList();
  renderFavorites();
}

function playSong(index) {
  if (index < 0 || index >= songs.length) return;

  currentSong = index;
  writeStorage("mmpLastSong", String(currentSong));

  audio.src = songs[currentSong].file;
  audio.load();

  updateSongDisplay();
  progressBar.value = 0;
  currentTimeText.textContent = "0:00";
  durationText.textContent = "0:00";
  playStatus.textContent = "Loading song...";

  const playRequest = audio.play();

  if (playRequest && typeof playRequest.catch === "function") {
    playRequest.catch(function () {
      updatePlayButton();
      playStatus.textContent =
        "Could not play this song. Check the MP3 filename and folder.";
    });
  }
}

function togglePlay() {
  if (audio.paused) {
    if (!audio.src) {
      playSong(currentSong);
      return;
    }

    const playRequest = audio.play();

    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(function () {
        playStatus.textContent =
          "Could not play this song. Check the MP3 file.";
      });
    }
  } else {
    audio.pause();
  }
}

function changeSong(direction) {
  const nextIndex =
    (currentSong + direction + songs.length) % songs.length;

  playSong(nextIndex);
}

playButton.addEventListener("click", togglePlay);

document.getElementById("previous-button")
  .addEventListener("click", function () {
    changeSong(-1);
  });

document.getElementById("next-button")
  .addEventListener("click", function () {
    if (isShuffle && songs.length > 1) {
      playRandomSong();
    } else {
      changeSong(1);
    }
  });

function playRandomSong() {
  if (songs.length < 2) {
    playSong(currentSong);
    return;
  }

  let nextIndex = currentSong;

  while (nextIndex === currentSong) {
    nextIndex = Math.floor(Math.random() * songs.length);
  }

  playSong(nextIndex);
}

shuffleButton.addEventListener("click", function () {
  isShuffle = !isShuffle;
  shuffleButton.classList.toggle("active", isShuffle);
  playStatus.textContent = isShuffle
    ? "Shuffle is on"
    : "Shuffle is off";
});

repeatButton.addEventListener("click", function () {
  isRepeat = !isRepeat;
  repeatButton.classList.toggle("active", isRepeat);
  playStatus.textContent = isRepeat
    ? "Repeat current song is on"
    : "Repeat is off";
});

audio.addEventListener("play", function () {
  updatePlayButton();
  updateSongDisplay();
  playStatus.textContent = "Now playing";
});

audio.addEventListener("pause", function () {
  updatePlayButton();
  renderSongList();
});

audio.addEventListener("loadedmetadata", function () {
  durationText.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", function () {
  if (!isSeeking && Number.isFinite(audio.duration) &&
      audio.duration > 0) {
    progressBar.value =
      (audio.currentTime / audio.duration) * 100;
  }

  currentTimeText.textContent = formatTime(audio.currentTime);
});

progressBar.addEventListener("input", function () {
  isSeeking = true;
});

progressBar.addEventListener("change", function () {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime =
      (Number(progressBar.value) / 100) * audio.duration;
  }

  isSeeking = false;
});


audio.addEventListener("ended", function () {
  // Read the selected playback setting
  const mode = playbackMode.value;

  // Stop after the current song
  if (mode === "stop") {
    audio.pause();
    audio.currentTime = 0;
    playStatus.textContent = "Playback stopped.";
    updatePlayButton();
    return;
  }

  // Repeat the current song
  if (mode === "repeat-song" || isRepeat) {
    audio.currentTime = 0;

    const playRequest = audio.play();

    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(function () {
        playStatus.textContent = "Tap play to continue.";
      });
    }

    return;
  }

  // Continue with shuffle or the next song
  if (isShuffle) {
    playRandomSong();
  } else {
    changeSong(1);
  }
});


audio.addEventListener("error", function () {
  playStatus.textContent =
    "Song could not load. Check that the MP3 is in the project folder.";
  updatePlayButton();
});

// Restore the last selected song when storage is available.
const savedSong = Number(readStorage("mmpLastSong"));

if (
  readStorage("mmpLastSong") !== null &&
  Number.isInteger(savedSong) &&
  savedSong >= 0 &&
  savedSong < songs.length
) {
  currentSong = savedSong;
}

// Prepare the first/current song without playing it automatically.
audio.src = songs[currentSong].file;
updateSongDisplay();
renderFavorites();
updatePlayButton();

// Offline support may be unavailable in some local-file APKs.
// This does not stop normal music playback.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch(function (error) {
        console.log("Offline worker unavailable:", error);
      });
  });
}
// Search songs by title or artist
searchInput.addEventListener("input", function () {
  renderSongList();
});

// Volume control
audio.volume = Number(volumeControl.value) / 100;

volumeControl.addEventListener("input", function () {
  audio.volume = Number(volumeControl.value) / 100;
  volumeValue.textContent = volumeControl.value + "%";
});

/* Show or hide the password */
const showPassword = document.getElementById("show-password");
const loginPassword = document.getElementById("login-password");

showPassword.addEventListener("change", function () {
  loginPassword.type = showPassword.checked
    ? "text"
    : "password";
});

/* Demo sign-in */
/* Firebase email sign-in */
const loginForm = document.getElementById("login-form");
const loginScreen = document.getElementById("login-screen");
const loginMessage = document.getElementById("login-message");
const loginEmail = document.getElementById("login-email");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!window.firebaseAuth) {
    loginMessage.textContent =
      "Firebase is not ready. Refresh and try again.";
    return;
  }

  loginMessage.textContent = "Signing in...";

  try {
    const result =
      await window.firebaseAuth.signInWithEmailAndPassword(
        window.firebaseAuth.auth,
        email,
        password
      );

    profileEmail.textContent = result.user.email || email;
    loginMessage.textContent = "Sign-in successful!";
    loginScreen.style.display = "none";
  } catch (error) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      loginMessage.textContent = "Email or password is incorrect.";
    } else if (error.code === "auth/network-request-failed") {
      loginMessage.textContent = "Check your internet connection.";
    } else {
      loginMessage.textContent =
        "Sign-in failed: " + error.message;
    }
  }
});


/* Navigate between Sign In and Registration */
const createAccountButton =
  document.getElementById("create-account-button");
const registrationScreen =
  document.getElementById("registration-screen");
const backToSignIn =
  document.getElementById("back-to-sign-in");

createAccountButton.addEventListener("click", function () {
  loginMessage.textContent = "";
  registrationScreen.style.display = "flex";
  loginScreen.style.display = "none";
});

backToSignIn.addEventListener("click", function () {
  registrationScreen.style.display = "none";
  loginScreen.style.display = "flex";
});


/* Firebase registration */
const registrationForm =
  document.getElementById("registration-form");
const registrationMessage =
  document.getElementById("registration-message");

registrationForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const fullName =
    document.getElementById("register-full-name").value.trim();
  const email =
    document.getElementById("register-email").value.trim();
  const password =
    document.getElementById("register-password").value;
  const confirmPassword =
    document.getElementById("register-confirm-password").value;

  if (password !== confirmPassword) {
    registrationMessage.textContent = "Passwords do not match.";
    return;
  }

  if (!window.firebaseAuth) {
    registrationMessage.textContent =
      "Firebase is not ready. Refresh and try again.";
    return;
  }

  registrationMessage.textContent = "Creating your account...";

  try {
    const result =
      await window.firebaseAuth.createUserWithEmailAndPassword(
        window.firebaseAuth.auth,
        email,
        password
      );

    const { updateProfile } = await import(
      "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js"
    );

    await updateProfile(result.user, { displayName: fullName });

    registrationMessage.textContent =
      "Account created successfully! Welcome, " + fullName + ".";

    registrationForm.reset();
    registrationScreen.style.display = "none";
    loginScreen.style.display = "none";

    if (typeof profileEmail !== "undefined") {
      profileEmail.textContent = result.user.email || email;
    }
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      registrationMessage.textContent =
        "This email already has an account. Please sign in.";
    } else if (error.code === "auth/weak-password") {
      registrationMessage.textContent =
        "Choose a stronger password with at least 6 characters.";
    } else if (error.code === "auth/invalid-email") {
      registrationMessage.textContent =
        "Please enter a valid email address.";
    } else if (error.code === "auth/network-request-failed") {
      registrationMessage.textContent =
        "Check your internet connection and try again.";
    } else {
      registrationMessage.textContent =
        "Registration error: " + error.message;
    }
  }
});
  
// Always show the sign-in screen when the app opens
loginScreen.style.display = "flex";
// Sign out and return to the sign-in screen
const logoutButton = document.getElementById("logout-button");

logoutButton.addEventListener("click", function () {
  loginForm.reset();
  loginMessage.textContent = "";
  loginScreen.style.display = "flex";
});

/* Profile menu */
const profileButton = document.getElementById("profile-button");
const profileMenu = document.getElementById("profile-menu");
const profileEmail = document.getElementById("profile-email");
const settingsButton = document.getElementById("settings-button");

profileButton.addEventListener("click", function () {
  profileMenu.hidden = !profileMenu.hidden;
});

/* Close the menu when Settings is tapped */
const settingsPanel = document.getElementById("settings-panel");
const closeSettings = document.getElementById("close-settings");

settingsButton.addEventListener("click", function () {
  profileMenu.hidden = true;
  settingsPanel.hidden = false;
});

closeSettings.addEventListener("click", function () {
  settingsPanel.hidden = true;
});

/* Close the menu after signing out */
logoutButton.addEventListener("click", function () {
  profileMenu.hidden = true;
});

/* Settings: theme and volume */
const themeSelect = document.getElementById("theme-select");
const settingsVolume = document.getElementById("settings-volume");
const settingsVolumeValue =
  document.getElementById("settings-volume-value");

/* Apply and remember the selected theme */
function applyTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  themeSelect.value = theme;

  try {
    localStorage.setItem("music-player-theme", theme);
  } catch (error) {
    // Theme still works for this session if saving is unavailable.
  }
}

let savedTheme = "dark";

try {
  savedTheme = localStorage.getItem("music-player-theme") || "dark";
} catch (error) {
  savedTheme = "dark";
}

applyTheme(savedTheme);

themeSelect.addEventListener("change", function () {
  applyTheme(themeSelect.value);
});

/* Keep the Settings volume and player volume synchronized */
settingsVolume.value = volumeControl.value;
settingsVolumeValue.textContent = volumeControl.value + "%";

settingsVolume.addEventListener("input", function () {
  const level = Number(settingsVolume.value);

  audio.volume = level / 100;
  volumeControl.value = level;
  volumeValue.textContent = level + "%";
  settingsVolumeValue.textContent = level + "%";
});

/* Choose and display a profile picture */
const profilePictureInput =
  document.getElementById("profile-picture-input");
const profilePicture =
  document.getElementById("profile-picture");
const profileAvatar =
  document.getElementById("profile-avatar");

profilePictureInput.addEventListener("change", function () {
  const file = profilePictureInput.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please choose an image.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    profilePicture.src = reader.result;
    profilePicture.hidden = false;
    profileAvatar.style.display = "none";

    try {
      localStorage.setItem("music-player-profile-picture", reader.result);
    } catch (error) {
      alert("The picture is too large to save. Try a smaller image.");
    }
  };

  reader.readAsDataURL(file);
});

/* Restore the saved picture */
try {
  const savedPicture =
    localStorage.getItem("music-player-profile-picture");

  if (savedPicture) {
    profilePicture.src = savedPicture;
    profilePicture.hidden = false;
    profileAvatar.style.display = "none";
  }
} catch (error) {
  // The default avatar remains available.
}

/* Sleep timer */
const sleepTimerSelect =
  document.getElementById("sleep-timer-select");
const sleepTimerStatus =
  document.getElementById("sleep-timer-status");
const cancelSleepTimer =
  document.getElementById("cancel-sleep-timer");

let sleepTimerId = null;
let sleepTimerEnd = null;

function cancelSleepTimerNow() {
  if (sleepTimerId !== null) {
    clearTimeout(sleepTimerId);
  }

  sleepTimerId = null;
  sleepTimerEnd = null;
  sleepTimerSelect.value = "0";
  sleepTimerStatus.textContent = "Sleep timer is off.";
}

sleepTimerSelect.addEventListener("change", function () {
  if (sleepTimerId !== null) {
    clearTimeout(sleepTimerId);
  }

  const minutes = Number(sleepTimerSelect.value);

  if (minutes === 0) {
    cancelSleepTimerNow();
    return;
  }

  sleepTimerEnd = Date.now() + minutes * 60 * 1000;

  sleepTimerId = setTimeout(function () {
    audio.pause();
    audio.currentTime = 0;
    cancelSleepTimerNow();
    sleepTimerStatus.textContent = "Timer finished. Music stopped.";
  }, minutes * 60 * 1000);

  sleepTimerStatus.textContent =
    "Music will stop in " + minutes + " minutes.";
});

cancelSleepTimer.addEventListener("click", function () {
  cancelSleepTimerNow();
});
const playbackMode = document.getElementById("playback-mode");
