let scrollPage = 1;
let numberOfSearchedItems;
let result = new Array();
let resultHTML = '';
let isLoading = false;

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
  let searchURL = new URL(`https://api.spotify.com/v1/search?q=${keyword}&market=KR&limit=${limit}&offset=${offset}&type=track&include_external=audio`);


  const result = await fetch(searchURL, {
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + token}
  })

  const data = await result.json();
  console.log("searchItems", data);

  numberOfSearchedItems = data.tracks.total;

  console.log('total', data.tracks.total);
  console.log('items', data.tracks.items);
  return data.tracks.items;
}



let searchValue;

// 검색창에 입력한 값 받아서 배열로 변환
async function searchTracksByInput() {
  scrollPage = 1;
  songList.scrollTo(0, 0);
  searchValue = document.querySelector('.search-input').value;
  document.querySelector('.search-input').value = '';

  if (searchValue == '') {
      console.log('검색 결과가 없습니다.');
      return;
  }

  result = await searchItems(searchValue, 1);
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

async function renderBySearch(page = 1) {
    resultHTML = '';

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
  isLoading = false;
}



// 무한 스크롤 다음페이지 렌더링
async function renderNextPage(page) {
  isLoading = true;
  const newItems = await searchItems(searchValue, page);
  if (!newItems) {
    return;
  }
  result = result.concat(newItems);
  console.log("result", result);
  renderBySearch(page);
}