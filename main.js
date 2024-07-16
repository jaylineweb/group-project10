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
});