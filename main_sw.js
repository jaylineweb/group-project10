let scrollPage = 1;
let isLoading = false;
let searchValue;
let numberOfSearchedItems;
let result = new Array();
let resultHTML = '';
let isMainScreen = true;

//2.5초마다 메인화면 lp판 돌리기
document.addEventListener('DOMContentLoaded', (event) => {
  const lpBoard = document.querySelector('.lp-board');
  const albumJacket1 = document.querySelector('.album-jacket1');

  let jacketUrlList = [
    './img/bp_jk.webp', './img/bp2_jk.webp',
    './img/bts_jk.webp', './img/bts2_jk.webp',
    './img/d6_jk.webp', './img/d62_jk.webp',
    './img/nm_jk.webp', './img/nm2_jk.webp',
    './img/svt_jk.webp', './img/svt2_jk.webp',
    './img/tws_jk.webp', './img/tws2_jk.webp'
  ]

  let currentIndex = 0;

  function changeAlbumJacket() {
    currentIndex = (currentIndex + 1) % jacketUrlList.length;
    albumJacket1.style.background = `url(${jacketUrlList[currentIndex]}) no-repeat center / cover`;
  }

  setInterval(changeAlbumJacket, 2500);

  animationContent = 'rotateLP 5s linear infinite';
  lpBoard.style.animation = animationContent;

  //초기 이미지 세팅
  albumJacket1.style.background = `url(${jacketUrlList[currentIndex]}) no-repeat center / cover`;
})

//로고 클릭 시 메인화면으로 전환
const mainLogo = document.querySelector('.logo');
mainLogo.addEventListener('click', () => {
  const mainAnimation = document.querySelector('.main-animation');
  const musicTitle = document.querySelector('.music_title');
  const songList = document.querySelector('.song-list');

  mainAnimation.style.display = 'flex';
  musicTitle.style.display = 'none';
  songList.style.display = 'none';
})

//로딩화면
const buttonLoad = document.querySelector('.buttonload');

// 렌더링 화면 가져오기
const songList = document.querySelector('.song-list');

// 스크롤 이벤트리스너
songList.addEventListener('scroll', () => {
  const scrollPos = songList.clientHeight + songList.scrollTop;
  const totalHeight = songList.scrollHeight;
  
  if (scrollPos >= (totalHeight * 0.9)) {
    if (!isLoading) {
      scrollPage++;
      renderNextPage(scrollPage);
    }
  }
})


// 검색 카테고리 선택 시 selectedValue의 값 변경
const selectElement = document.querySelector('#search-option');

let selectedValue = 'track';

selectElement.addEventListener('change', (event) => {
  selectedValue = event.target.value;
  console.log('selected:', selectedValue);
})


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


// 토큰 받아오는 함수, 클라이언트 크리덴셜 방식(스트리밍은 불가, 조회만 가능)
async function getToken() {

    //const clientId = 'b488526ffa804a92b41f45e03760d3ff'; 기존 값 
    const clientId = '33ad25dafa3f42e5b3909a3a813f8532';
    //const clientSecret = '7cd6750d4a0a41eba283685a51292362'; 기존 값
    const clientSecret = '3a92a4a9a6724d5ea179d7553b0f4a59';

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
async function searchItems(keyword, page) {
  const token = await getToken();
  // 한 번에 출력 가능한 갯수
  let limit = 10;
  // 페이지네이션 시 몇 번 검색결과부터 출력할 것인지?
  // 무한 스크롤 고려 계산식 반영(0, 10, 20, 30)
  let offset = (page - 1) * 10;
  console.log("offset", offset);

  if (numberOfSearchedItems < offset) {
    return;
  }

  // include_external 옵션 : 클라이언트에서 노래 재생 가능
  let searchURL = new URL(`https://api.spotify.com/v1/search?q=${keyword}&market=KR&limit=${limit}&offset=${offset}&type=${selectedValue}&include_external=audio`);


  const result = await fetch(searchURL, {
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + token}
  })

  const data = await result.json();
  console.log("searchItems", data);

  numberOfSearchedItems = data[`${selectedValue}s`].total;

  console.log('total', data[`${selectedValue}s`].total);
  console.log('items', data[`${selectedValue}s`].items);
  return data[`${selectedValue}s`].items;
}


// 검색창에 입력한 값 받아서 배열로 변환
async function searchTracksByInput() {
  scrollPage = 1;
  songList.scrollTo(0, 0);
  buttonLoad.style.display = 'block';

  searchValue = document.querySelector('.search-input').value;
  document.querySelector('.search-input').value = '';

  if (searchValue == '') {
      alert('검색어를 입력해주세요.');
      return;
  }

  result = await searchItems(searchValue, 1);

  // "KEYWORD" 검색결과 로 music title 변경
  const musicTitle = document.querySelector('.music_title');

  musicTitle.textContent = `"${searchValue}" 검색결과`;

  //.song-list에 렌더링
  renderBySearch();
}

// 검색버튼 || Enter 누르면 검색
async function renderBySearch(page = 1) {

    resultHTML = '';

  // 렌더링 할 때 필요한 정보만 추출
  const resultInfo = result.map((item, i) => {
      const durationInMinutes = Math.floor((Number(item.duration_ms) / 1000) / 60)
      const durationInSeconds = Math.floor((Number(item.duration_ms) / 1000) % 60);
  
      // 두 자리수 형태로 맞추기
      const formattedSeconds = durationInSeconds < 10 ? `0${durationInSeconds}` : durationInSeconds;
  
      return {
          picture: `${selectedValue == 'track' ? item.album.images[1].url : item.images[1].url}`,
          firstLine: item.name,
          secondLine: `${selectedValue == 'artist' ? item.genres[0] : item.artists[0].name}`,
          totalTime: `${selectedValue == 'track' ? durationInMinutes + ':' + formattedSeconds : ''}`
      };
  });

  
  // 각각의 item 렌더링
  resultInfo.forEach((item, i) => {
      resultHTML += `<div class="song-item">
                          <div class="song-info">
                              <img src="${item.picture}" alt="Album Art" width="75">
                              <div class="song-details">
                                  <div class="song-title">${item.firstLine.length > 15 ? item.firstLine.substring(0, 15) + ' ...' : item.firstLine}</div>
                                  <div class="song-artist">${item.secondLine.length > 15 ? item.secondLine.substring(0, 15) + ' ...' : item.secondLine}</div>
                              </div>
                          </div>
                          <div class="song-controls">
                              <div class="song-duration">${item.totalTime}</div>
                              <button class="song-play"><i class="fa-solid fa-play"></i></button>
                          </div>
                      </div>`;
  });

  const musicTitle = document.querySelector('.music_title');
  const mainAnimation = document.querySelector('.main-animation');

  mainAnimation.style.display = 'none';
  musicTitle.style.display = 'block';
  songList.style.display = 'block';
  songList.innerHTML = resultHTML;

  songList.scrollTo(0, 0);

  isLoading = false;
  buttonLoad.style.display = 'none';

  // 스크롤 후 데이터 수신 시 이벤트 리스너 추가
  addEventListenersToSongs();
}



// 무한 스크롤 다음페이지 렌더링
async function renderNextPage(page) {
  isLoading = true;
  buttonLoad.style.display = 'block';

  const newItems = await searchItems(searchValue, page);

  if (!newItems) {
    buttonLoad.innerText = '마지막 검색 결과입니다.';
    setTimeout(() => {
      buttonLoad.style.display = 'none';
      buttonLoad.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Loading';
      }, 1200);
    return;
  }

  result = result.concat(newItems);
  console.log("result", result);
  renderBySearch(page);
}



// 모든 song-item 요소들에 마우스 이벤트 리스너 추가
function addEventListenersToSongs() {
  let songItems = document.querySelectorAll('.song-item');

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
}
