//netlify 테스트

document.addEventListener('DOMContentLoaded', () => {
    // 메뉴 항목 선택
    const menus = document.querySelectorAll('#header .site-gnb .site-gnb-list .gnb-item a');

    // 메뉴 클릭 이벤트 리스너
    menus.forEach((menu) => {
        menu.addEventListener('click', (event) => {
            event.preventDefault(); // 기본 동작 차단
            const category = event.target.textContent.trim().toLowerCase(); // 텍스트 추출
            console.log('카테고리:', category); // 확인용
            displayAlbums(category); // 카테고리로 앨범 표시
        });
    });

    const token = 'BQB4hC4uP42VdpVpGuwwgGgKCTIpSj1XXoT9Y5F2A83wcK8Bs_6mojqDF4zGMp0vhIpFYbL98AHNL08TR1hi8LY9MOMeBXTInlX5oPSa4KIeQMS3xZo';

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
            return data.albums.items; // 수정된 부분: data.albums.items로 변경
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const displayAlbums = async (category) => {
        const albums = await getMusicByCategory(category);
        const songList = document.querySelector('.song-list');
        songList.innerHTML = ''; // 기존 내용 제거

        albums.forEach(album => {
            const albumElement = document.createElement('div');
            albumElement.className = 'song-item';
            const truncatedTitle = album.name.length > 15 ? album.name.substring(0, 15) + ' ...' : album.name;
            const truncatedArtist = album.artists.map(artist => artist.name).join(', ').length > 15 ? album.artists.map(artist => artist.name).join(', ').substring(0, 15) + ' ...' : album.artists.map(artist => artist.name).join(', ');
            albumElement.innerHTML = `
                <div class="song-info">
                    <img src="${album.images[1].url}" alt="Album Art" style="height: 75px;">
                    <div class="song-details">
                        <div class="song-title">${truncatedTitle}</div>
                        <div class="song-artist">${truncatedArtist}</div>
                    </div>
                </div>
                <div class="song-controls">
                    <div class="song-duration">${album.totalTime}</div>
                    <button class="song-play"><i class="fa-solid fa-play"></i></button>
                </div>
            `;

            // 이벤트 리스너 추가
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

    function formatDuration(totalTime) {
        const [minutes, seconds] = totalTime.split(':');
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
        return `${minutes}:${formattedSeconds}`;
    }

    // 닫기 버튼용
    let header = document.getElementById('header');
    let closeBtn = document.querySelector('.close-btn');

    const navBarActivate = () => {
        header.classList.add('on');
    }

    closeBtn.addEventListener('click', () => {
        console.log('닫기')
        header.classList.remove('on');
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 760) closeMenu(); // mobile(760px) 변형 시(resizing) 사이드배너가 열린 상태로 view되는걸 방지
    });

    // 하단 플레이버튼
    let lyricsPlayBtn = document.querySelector('.lyrics-play')
    lyricsPlayBtn.addEventListener('click', () => {
        lyricsPlayBtn.classList.add('pause');
        let icon = lyricsPlayBtn.querySelector('i');
        if (icon.classList.contains('fa-play')) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    });
});

