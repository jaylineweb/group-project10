

// 모든 song-item 요소들을 선택
let songItems = document.querySelectorAll('.song-item');

// 각 song-item에 마우스 이벤트 리스너 추가
songItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        // 마우스를 올렸을 때 active 클래스 추가
        item.classList.add('active');
    });

    item.addEventListener('mouseleave', () => {
        // 마우스를 뗐을 때 active 클래스 제거
        item.classList.remove('active');
    });
    // 각 song-item 내의 song-play 버튼 선택
    let playBtn = item.querySelector('.song-play');

    // song-play 버튼에 클릭 이벤트 리스너 추가
    playBtn.addEventListener('click', () => {
        console.log('재생');

        let icon = playBtn.querySelector('i');
        if (icon.classList.contains('fa-play')) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    });
});


//닫기 버튼용
let header = document.getElementById('header');
let closeBtn = document.querySelector('.close-btn');

const navBarActivate=()=>{
    header.classList.add('on');
}

closeBtn.addEventListener('click',()=>{
    console.log('닫기')
    header.classList.remove('on');
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu(); // mobile(760px) 변형 시(resizing) 사이드배너가 열린 상태로 view되는걸 방지
});

//하단 플레이버튼 
let lyricsPlayBtn = document.querySelector('.lyrics-play')
lyricsPlayBtn.addEventListener('click',()=>{
    lyricsPlayBtn.classList.add('pause');
    let icon = lyricsPlayBtn.querySelector('i');
        if (icon.classList.contains('fa-play')) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
})

// API Control

let resultArr = new Array();

// 토큰 받아오는 함수, 클라이언트 크리덴셜 방식(스트리밍은 불가, 조회만 가능)
async function getToken() {

    const clientId = 'b488526ffa804a92b41f45e03760d3ff'; 
    const clientSecret = '7cd6750d4a0a41eba283685a51292362';

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body : 'grant_type=client_credentials'
    });

    const data = await result.json();
    return data.access_token;
}

// keyword('블랙핑크' 등)를 이용하여 검색하면
// json(객체 배열) return
// type = 'album', 'artist', 'track', 'show',
//        'episode', 'playlist'
async function searchItems(keyword) {
    const token = await getToken();

    // 한 번에 출력 가능한 갯수
    let limit = 50;
    // 페이지네이션 시 몇 번 검색결과부터 출력할 것인지?
    let offset = 0;


    // include_external 옵션 : 클라이언트에서 노래 재생 가능
    let searchURL = new URL(`https://api.spotify.com/v1/search?q=${keyword}&market=KR&limit=${limit}&offset=${offset}&type=track&include_external=audio`);

    const result = await fetch(searchURL, {
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + token}
    })

    const data = await result.json();
    console.log(data);

    // data 객체 내부에는 'artists', 'tracks' 등 s가 추가로 붙음
    console.log('total', data.tracks.total);
    console.log('items', data.tracks.items);
    return data.tracks.items;
}



async function searchTracksByInput() {
    const searchValue = document.querySelector('.search-input').value;

    if (searchValue == '') {
        console.log('검색 결과가 없습니다.');
        return;
    }

    result = await searchItems(searchValue);
    //.song-list에 렌더링
    renderBySearch();
}

// 검색창 focus 시 엔터이벤트리스너
const searchInput = document.querySelector('.search-input');

// 엔터 계속 누르고 있으면 계속 검색되는 것을 막기 위한 bool 변수
let isSearched = false;

searchInput.addEventListener('keydown', (event) => {
    if (event.keyCode == 13 && !isSearched) {
        searchTracksByInput();
        isSearched = true;
    }
});

searchInput.addEventListener('keyup', () => {
    isSearched = false;
})

async function renderBySearch() {
    let resultHTML = '';

    const songList = document.querySelector('.song-list');

    // 렌더링 할 때 필요한 정보만 추출
    const resultInfo = result.map((item, i) => {
        const durationInMinutes = Math.floor((Number(item.duration_ms) / 1000) / 60);
        const durationInSeconds = Math.floor((Number(item.duration_ms) / 1000) % 60);
    
        // 두 자리수 형태로 맞추기
        const formattedSeconds = durationInSeconds < 10 ? `0${durationInSeconds}` : durationInSeconds;
    
        return {
            albumJacketUrl: item.album.images[1].url,
            songName: item.name,
            artist: item.artists[0].name,
            totalTime: `${durationInMinutes}:${formattedSeconds}`
        };
    });
    
    // 각각의 item 렌더링
    resultInfo.forEach((item, i) => {
        resultHTML += `<div class="song-item">
                            <div class="song-info">
                                <img src="${item.albumJacketUrl}" alt="Album Art" width="75">
                                <div class="song-details">
                                    <div class="song-title">${item.songName.length > 15 ? item.songName.substring(0, 15) + ' ...' : item.songName}</div>
                                    <div class="song-artist">${item.artist.length > 15 ? item.artist.substring(0, 15) + ' ...' : item.artist}</div>
                                </div>
                            </div>
                            <div class="song-controls">
                                <div class="song-duration">${item.totalTime}</div>
                                <button class="song-play"><i class="fa-solid fa-play"></i></button>
                            </div>
                        </div>`;
    });

    songList.innerHTML = resultHTML;
}

// SDK 컨트롤

// OAuth 2.0 Authorization code 방식
// 인증 URL 생성하고 사용자를 해당 URL로 리디렉션
function redirectToSpotifyAuth() {
    const clientId = 'b488526ffa804a92b41f45e03760d3ff'; 
    const redirectUri = 'http://127.0.0.1:5500/index.html'; 
    const scopes = [
        'streaming',
        'user-read-email',
        'user-read-private'
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

    window.location.href = authUrl;
}

function extractTokenFromHash() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    if (token) {
        localStorage.setItem('spotify_token', token);
        window.location.hash = ''; // URL 해시를 지워서 토큰을 숨깁니다
    }
    return token;
}


window.onload = () => {
    if (!localStorage.getItem('spotify_token')) {
        redirectToSpotifyAuth();
    } else {
        onSpotifyWebPlaybackSDKReady(localStorage.getItem('spotify_token'));
    }
};


// web playback sdk가 load되면 한 번만 호출
window.onSpotifyWebPlaybackSDKReady = (token) => {
    const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
    });

    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error('Initialization Error:', message);
    });

    player.addListener('authentication_error', ({ message }) => {
        console.error('Authentication Error:', message);
    });

    player.addListener('account_error', ({ message }) => {
        console.error('Account Error:', message);
    });

    player.connect().then(success => {
        if (success) {
            console.log('The player has successfully connected!');
        } else {
            console.error('Failed to connect player');
        }
    });

    document.querySelector('.lyrics-play').onclick = () => {
        player.togglePlay();
    };
}