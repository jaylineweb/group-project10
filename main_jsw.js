const clientId = "33ad25dafa3f42e5b3909a3a813f8532";
const redirectUri = "https://group10spotify.netlify.app";
const authEndpoint = "https://accounts.spotify.com/authorize";
const scopes = ["playlist-read-private", "playlist-read-collaborative", "user-read-playback-state", "user-modify-playback-state", "user-read-currently-playing", "streaming"];

let isPlaying = false;
let currentTrackUri = null;
let currentTrackIndex = -1;
let player;
let deviceId;
let tracksList = [];
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  const loginButton = document.getElementById("login-button");
  loginButton.href = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`;

  const hash = window.location.hash
    .substring(1)
    .split("&")
    .reduce((initial, item) => {
      if (item) {
        const parts = item.split("=");
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});

  console.log("Hash:", hash);

  window.location.hash = "";

  let _token = hash.access_token;
  if (_token) {
    localStorage.setItem("spotify_token", _token);
  } else {
    _token = localStorage.getItem("spotify_token");
  }

  if (_token) {
    console.log("Token found:", _token);
    document.getElementById("login").style.display = "none";
    initializePlayer(_token);
    fetchPlaylists(_token);
    setupPlaybackControls(_token);
  } else {
    console.log("No token found");
  }
});

/**
 * Spotify 플레이어를 초기화
 * @param {string} token - Spotify API 토큰
 */
const initializePlayer = (token) => {
  const script = document.createElement("script");
  script.src = "https://sdk.scdn.co/spotify-player.js";
  script.async = true;

  document.body.appendChild(script);

  window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotify.Player({
      name: "Web Playback SDK",
      getOAuthToken: (cb) => {
        cb(token);
      },
      volume: 0.5,
    });

    player.addListener("ready", ({ device_id }) => {
      console.log("Ready with Device ID", device_id);
      deviceId = device_id;
      activateDevice(token, device_id);
    });

    player.addListener("not_ready", ({ device_id }) => {
      console.log("Device ID has gone offline", device_id);
    });

    player.addListener("player_state_changed", (state) => {
      if (!state) {
        return;
      }
      isPlaying = !state.paused;
      currentTrackUri = state.track_window.current_track.uri;
      updatePlayButton();
      renderCurrentTrack(state.track_window.current_track);
    });

    player.connect().then((success) => {
      if (success) {
        console.log("The Web Playback SDK successfully connected to Spotify!");
      } else {
        console.error("The Web Playback SDK could not connect to Spotify");
      }
    });
  };
};

/**
 * Spotify 디바이스를 활성화
 * @param {string} token - Spotify API 토큰
 * @param {string} deviceId - Spotify 디바이스 ID
 */
const activateDevice = async (token, deviceId) => {
  try {
    await fetch(`https://api.spotify.com/v1/me/player`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false,
      }),
    });
    console.log("Device activated");
  } catch (error) {
    console.error("Error activating device:", error);
  }
};

/**
 * 사용자 플레이리스트를 Spotify에서 가져오기
 * @param {string} token - Spotify API 토큰
 */
const fetchPlaylists = async (token) => {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("Playlists:", data);
    if (data.items.length > 0) {
      fetchTracks(token, data.items[0].id);
    }
  } catch (error) {
    console.error("Error fetching playlists:", error);
  }
};

/**
 * Spotify 플레이리스트에서 트랙 가져오기
 * @param {string} token - Spotify API 토큰
 * @param {string} playlistId - Spotify 플레이리스트 ID
 */
const fetchTracks = async (token, playlistId) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("Tracks:", data);
    tracksList = data.items; // 현재 재생 목록 저장
    renderTracks(tracksList);
    getCurrentPlayingTrack(token); // 트랙을 렌더링한 후 현재 재생 중인 트랙 정보를 가져옴
  } catch (error) {
    console.error("Error fetching tracks:", error);
  }
};

/**
 * 페이지에 트랙 렌더링
 * @param {Array} tracks - 렌더링할 트랙 목록
 */
const renderTracks = (tracks) => {
  const songList = document.getElementById("song-list");
  const tracksHTML = tracks
    .map((track, index) => {
      const { name, album, artists, duration_ms } = track.track;
      const minutes = Math.floor(duration_ms / 60000);
      const seconds = ((duration_ms % 60000) / 1000).toFixed(0);
      const duration = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
      return `
      <div class="song-item" data-index="${index}">
        <div class="song-info">
          <img src="${album.images[0].url}" alt="Album Art">
          <div class="song-details">
            <div class="song-title">${name}</div>
            <div class="song-artist">${artists.map((artist) => artist.name).join(", ")}</div>
          </div>
        </div>
        <div class="song-controls">
          <div class="song-duration">${duration}</div>
          <button class="song-play" onclick="playTrack('${track.track.uri}', ${index})"><i class="fa-solid fa-play"></i></button>
        </div>
      </div>
    `;
    })
    .join("");
  songList.innerHTML = tracksHTML;
};

/**
 * 재생, 일시 정지, 다음, 이전 트랙에 대한 재생 제어 설정
 * @param {string} token - Spotify API 토큰
 */
const setupPlaybackControls = (token) => {
  const playButton = document.querySelector(".lyrics-play");
  playButton.addEventListener("click", () => togglePlayback(token));
  document.querySelector(".lyrics-next").addEventListener("click", () => playNextTrack(token));
  document.querySelector(".lyrics-prev").addEventListener("click", () => playPreviousTrack(token));
};

/**
 * 재생 상태 토글 (재생/일시 정지)
 * @param {string} token - Spotify API 토큰
 */
const togglePlayback = async (token) => {
  if (isPlaying) {
    await pausePlayback(token);
  } else {
    if (currentTrackUri) {
      await playTrack(currentTrackUri, token, currentTrackIndex);
    } else {
      const firstTrackButton = document.querySelector(".song-play");
      if (firstTrackButton) {
        firstTrackButton.click();
      }
    }
  }
  isPlaying = !isPlaying;
  updatePlayButton();
};

/**
 * 재생/일시 정지 버튼 아이콘 업데이트
 */
const updatePlayButton = () => {
  const playButtonIcon = document.querySelector(".lyrics-play i");
  playButtonIcon.classList.toggle("fa-play", !isPlaying);
  playButtonIcon.classList.toggle("fa-pause", isPlaying);
};

/**
 * 재생 일시 정지
 * @param {string} token - Spotify API 토큰
 */
const pausePlayback = async (token) => {
  try {
    await fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Playback paused");
  } catch (error) {
    console.error("Error pausing playback:", error);
  }
};

/**
 * 다음 트랙으로 건너뛰기
 * @param {string} token - Spotify API 토큰
 */
const skipToNext = async (token) => {
  if (!deviceId) {
    console.error("No active device available");
    return;
  }

  try {
    await fetch(`https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Skipped to next track");
  } catch (error) {
    console.error("Error skipping to next track:", error);
  }
};

/**
 * 이전 트랙으로 건너뛰기
 * @param {string} token - Spotify API 토큰
 */
const skipToPrevious = async (token) => {
  if (!deviceId) {
    console.error("No active device available");
    return;
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/previous?device_id=${deviceId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log("Skipped to previous track");
    } else {
      console.error("Error skipping to previous track:", response.statusText);
    }
  } catch (error) {
    console.error("Error skipping to previous track:", error);
  }
};

/**
 * 재생 목록에서 다음 트랙 재생
 * @param {string} token - Spotify API 토큰
 */
const playNextTrack = (token) => {
  if (currentTrackIndex < tracksList.length - 1) {
    currentTrackIndex++;
    playTrack(tracksList[currentTrackIndex].track.uri, token, currentTrackIndex);
  } else {
    console.log("This is the last track in the playlist.");
  }
};

/**
 * 재생 목록에서 이전 트랙 재생
 * @param {string} token - Spotify API 토큰
 */
const playPreviousTrack = (token) => {
  if (currentTrackIndex > 0) {
    currentTrackIndex--;
    playTrack(tracksList[currentTrackIndex].track.uri, token, currentTrackIndex);
  } else {
    console.log("This is the first track in the playlist.");
  }
};

/**
 * 특정 트랙 재생
 * @param {string} uri - Spotify 트랙 URI
 * @param {string} token - Spotify API 토큰
 * @param {number} index - 재생 목록에서의 트랙 인덱스
 */
const playTrack = async (uri, token, index) => {
  if (!token) {
    token = localStorage.getItem("spotify_token");
    if (!token) {
      console.error("No token available");
      return;
    }
  }

  if (!deviceId) {
    console.error("No active device available");
    return;
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [uri],
      }),
    });

    if (response.ok) {
      console.log("Track is playing");
      currentTrackUri = uri;
      currentTrackIndex = index;
      isPlaying = true;
      updatePlayButton();
      getCurrentPlayingTrack(token);
    } else {
      console.error("Error playing track:", response.statusText);
    }
  } catch (error) {
    console.error("Error playing track:", error);
  }
};

/**
 * 현재 재생 중인 트랙을 Spotify에서 가져오기
 * @param {string} token - Spotify API 토큰
 */
const getCurrentPlayingTrack = async (token) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("Currently playing:", data);
    if (data && data.item) {
      currentTrackUri = data.item.uri;
      currentTrackIndex = tracksList.findIndex((track) => track.track.uri === currentTrackUri);
      renderCurrentTrack(data.item);
    }
  } catch (error) {
    console.error("Error fetching current playing track:", error);
  }
};

/**
 * 현재 재생 중인 트랙 정보 렌더링
 * @param {Object} track - 현재 재생 중인 트랙에 대한 정보가 포함된 객체
 */
const renderCurrentTrack = (track) => {
  const bottomLine = document.getElementById("bottom-line");
  if (!bottomLine) {
    console.error("No bottom-line element found");
    return;
  }

  const { name, album, artists, duration_ms } = track;
  const minutes = Math.floor(duration_ms / 60000);
  const seconds = ((duration_ms % 60000) / 1000).toFixed(0);
  const duration = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const currentTrackHTML = `
        <div class="lyrics-controls">
            <img src="${album.images[0].url}" alt="Album Art" class="lyrics-view">
            <div class="lyrics-title">${name}</div>
            <div class="lyrics-artist">${artists.map((artist) => artist.name).join(", ")}</div>
            <div class="lyrics-album">${album.name}</div>
            <button class="lyrics-prev"><span class="skip">이전곡</span><i class="fa-solid fa-backward"></i></button>
            <button class="lyrics-play"><span class="skip">재생버튼</span><i class="fa-solid fa-play"></i></button>
            <button class="lyrics-next"><span class="skip">다음곡</span><i class="fa-solid fa-forward"></i></button>
            <div class="lyrics-duration">${duration}</div>
            <div class="lyrics-checkbox"><input type="checkbox" style="border: 1px solid red;"></div>
        </div>
    `;

  bottomLine.innerHTML = currentTrackHTML;
  setupPlaybackControls(localStorage.getItem("spotify_token"));
};
