

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

// 토큰 받아오는 함수
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

    await console.log(data.access_token);
    return data.access_token;
}

// keyword('블랙핑크' 등)를 이용하여 검색하면
// json(객체 배열) return
// type = 'album', 'artist', 'track', 'show',
//        'episode', 'playlist'
async function searchItems(keyword, type) {
    const token = await getToken();

    // 한 번에 출력 가능한 갯수
    let limit = 50;
    // 페이지네이션 시 몇 번 검색결과부터 출력할 것인지?
    let offset = 0;


    // include_external 옵션 : 클라이언트에서 노래 재생 가능
    let searchURL = new URL(`https://api.spotify.com/v1/search?q=${keyword}&market=KR&limit=${limit}&offset=${offset}&type=${type}&include_external=audio`);

    const result = await fetch(searchURL, {
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + token}
    })

    const data = await result.json();
    console.log('total', data.tracks.total);
    console.log('items', data.tracks.items);
    return data.tracks.items;
}

// searchItems('블랙핑크', 'track');