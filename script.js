const clientId = 'c7a2f9c35e984ab5ab2c5e2a07227817';
const clientSecret = '1b7a001df0bd4dbfa3d1f0537f39c1f5';

let accessToken;
let player;

window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'YOUR_ACCESS_TOKEN'; // 이 토큰은 서버에서 생성해야 합니다.
    player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    // Connect to the player!
    player.connect();
};

async function getAccessToken() {
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    return data.access_token;
}

async function getTop100Tracks(accessToken) {
    let allTracks = [];
    let offset = 0;
    
    while (allTracks.length < 100) {
        const result = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=50&offset=${offset}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const data = await result.json();
        allTracks = allTracks.concat(data.items);
        offset += 50;

        if (data.items.length < 50) break; // 더 이상 가져올 트랙이 없으면 중단
    }

    return allTracks.slice(0, 100); // 정확히 100개만 반환
}

function displayTracks(tracks) {
    const container = document.getElementById('top100-list');
    tracks.forEach((item, index) => {
        const track = item.track;
        const trackElement = document.createElement('div');
        trackElement.classList.add('track');
        trackElement.innerHTML = `
            <img src="${track.album.images[2].url}" alt="${track.name}">
            <div class="track-info">
                <div class="track-name">${index + 1}. ${track.name}</div>
                <div class="track-artist">${track.artists[0].name}</div>
            </div>
            <button class="play-button" data-uri="${track.uri}">▶</button>
        `;
        container.appendChild(trackElement);
    });

    // 모든 플레이 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.play-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // 버블링 방지
            const uri = button.getAttribute('data-uri');
            playTrack(uri);
        });
    });
}

function playTrack(uri) {
    if (!player) {
        console.error('Spotify player is not initialized');
        return;
    }

    player.resume().then(() => {
        fetch(`https://api.spotify.com/v1/me/player/play`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                uris: [uri]
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('HTTP status ' + response.status);
            }
            console.log('Playback started');
        }).catch(error => {
            console.error('Error:', error);
        });
    }).catch(error => {
        console.error('Failed to resume playback:', error);
    });
}

async function init() {
    try {
        accessToken = await getAccessToken();
        const tracks = await getTop100Tracks(accessToken);
        displayTracks(tracks);
    } catch (error) {
        console.error('Error:', error);
    }
}

init();