

// 모든 song-item 요소들을 선택
/*let songItems = document.querySelectorAll('.song-item');

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
});*/


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

// gnb-item a 클릭 시 searchTracksByInput() 호출
let menuBtns = document.querySelectorAll('.gnb-item a');
menuBtns.forEach(item => {
    item.addEventListener('click', async (event) => {
        event.preventDefault(); // 기본 동작 막기

        searchValue = item.textContent.trim(); // 링크 텍스트를 검색어로 설정

        if (searchValue === '') {
            alert('검색어를 입력해주세요.');
            return;
        }

        // 검색 및 렌더링
        result = await searchItems(searchValue, 1);

        renderBySearch(); // 검색 결과 렌더링
    });
});


//chageMusicSelect() 기능 구현 : select박스
function chageMusicSelect(){
    let musicSelect = document.getElementById("selectbox");

    // select element에서 선택된 option의 value가 저장된다.
    let selectedValue = musicSelect.options[musicSelect.selectedIndex].value;

    let inputElement = document.querySelector('.search-input');
    inputElement.value = selectedValue;

    // input 요소의 value 값을 출력 (콘솔에 출력)
    console.log('Input value:', inputElement.value);
}
