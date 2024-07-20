//닫기 버튼용
let header = document.getElementById("header");
let closeBtn = document.querySelector(".close-btn");

const navBarActivate = () => {
  header.classList.add("on");
};

closeBtn.addEventListener("click", () => {
  console.log("닫기");
  header.classList.remove("on");
});

const closeMenu = () => {
  header.classList.remove("on");
};

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu(); // mobile(760px) 변형 시(resizing) 사이드배너가 열린 상태로 view되는걸 방지
});

//하단 플레이버튼
let lyricsPlayBtn = document.querySelector(".lyrics-play");
lyricsPlayBtn.addEventListener("click", () => {
  lyricsPlayBtn.classList.add("pause");
  let icon = lyricsPlayBtn.querySelector("i");
  if (icon.classList.contains("fa-play")) {
    icon.classList.remove("fa-play");
    icon.classList.add("fa-pause");
  } else {
    icon.classList.remove("fa-pause");
    icon.classList.add("fa-play");
  }
});

// gnb-item a 클릭 시 searchTracksByInput() 호출
let menuBtns = document.querySelectorAll(".dropdown li button");
menuBtns.forEach((item) => {
  item.addEventListener("click", async (event) => {
    event.preventDefault(); // 기본 동작 막기
    isSearchedByButton = false;

    searchValue = item.textContent.trim(); // 링크 텍스트를 검색어로 설정(소문자)

    if (searchValue === "") {
      alert("검색어를 입력해주세요.");
      return;
    }

    // 검색 및 렌더링
    result = await searchItems(searchValue, 1);

    // "KEYWORD" 검색결과 로 music title 변경
    const musicTitle = document.querySelector(".music_title");

    musicTitle.textContent = `${searchValue}`;

    const mainAnimation = document.querySelector('.main-animation');
    const songList = document.querySelector('#song-list');

    mainAnimation.style.display = 'none';
    songList.style.display = 'block';
    musicTitle.style.display = 'block';

    renderBySearch(); // 검색 결과 렌더링
  });
});

//chageMusicSelect() 기능 구현 : select박스
function chageMusicSelect() {
  let musicSelect = document.getElementById("search-option");

  // select element에서 선택된 option의 value가 저장된다.
  let selectedValue = musicSelect.options[musicSelect.selectedIndex].value;

  let inputElement = document.querySelector(".search-input");
  inputElement.value = selectedValue;

  // input 요소의 value 값을 출력 (콘솔에 출력)
  console.log("Input value:", inputElement.value);
}

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
    // document.getElementById("login").style.display = "none";
    loginButton.innerText = 'Logout';
    initializePlayer(_token);
  } else {
    console.log("No token found");
  }
});