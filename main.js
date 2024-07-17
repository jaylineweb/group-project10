


// 모든 song-item 요소들을 선택
let songItems = document.querySelectorAll('.song-item');

const menus = document.querySelectorAll('#header .site-gnb .site-gnb-list .gnb-item a');

menus.forEach((menu) => {
    menu.addEventListener('click', (event) => {
        event.preventDefault(); // 기본 동작 차단
        const category = event.target.textContent.trim().toLowerCase(); // 텍스트 추출
        console.log('카테고리:', category); // 확인용
        displayAlbums(category); // 카테고리로 앨범 표시
    });
});


const token ='BQAaWmiR3JzBno18vuP1d2fsd7f2At12NhmmjVdTyKkyQzmGA-1m5t8Y3m-tL69t7UwVfAgdzk3RKKy02Qz3T7sufEjtMQHQXaW-Snr0h3Ok0UYrxtNsyeGfRm20HggilLWpvdZwJvxUI1YpuozF9a0Rv6as5hRDLcVmAaN4pJDBIl1KfoZtrM1K1Bk319Yk_53kq67UoqkJX2JDDYvvTkTVFd044kA1ykBG9Vc9mF8wNF_F3W18gvPfkTZnh8PJEU0MB_ooRfUVxtaY7hbueBBr';
//const token = '여기에_실제_토큰_값_입력';

const getMusicByCategory = async (category) => {
    const url = new URL(`https://api.spotify.com/v1/search`);
    url.search = new URLSearchParams({
        q: category,
        type: 'album',
        limit: 50
    });

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log(data);
        return data.albums.items;
        //displayAlbums(category);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const displayAlbums = async (category) => {
    const albums = await getMusicByCategory(category);
    const songList = document.querySelector('.song-list');
    songList.innerHTML = ''; // Clear existing content

    albums.forEach(album => {
        const albumElement = document.createElement('div');
        albumElement.className = 'song-item';
        albumElement.innerHTML = `
            <div class="song-info">
                <img src="${album.images[1].url}" alt="Album Art" style="height: 75px;">
                <div class="song-details">
                    <div class="song-title">${album.name}</div>
                    <div class="song-artist">${album.artists.map(artist => artist.name).join(', ')}</div>
                </div>
            </div>
            <div class="song-controls">
                <button class="song-play"><i class="fa-solid fa-play"></i></button>
            </div>
        `;

        // 여기에서 이벤트 리스너를 직접 추가
        addEventListenersToItem(albumElement);

        songList.appendChild(albumElement);
    });
};

function addEventListenersToItem(item) {
    item.addEventListener('mouseenter', () => {
        item.classList.add('active');
    });

    item.addEventListener('mouseleave', () => {
        item.classList.remove('active');
    });

    const playBtn = item.querySelector('.song-play');
    playBtn.addEventListener('click', () => {
        const icon = playBtn.querySelector('i');
        if (icon.classList.contains('fa-play')) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
        console.log('재생 버튼 클릭');
    });
}
//songItems.forEach(item => {
//});


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

