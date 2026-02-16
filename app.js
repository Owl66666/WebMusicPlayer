const API_BASE = "https://music-api.zchong517.workers.dev"; 
let playlist = [];
let currentIndex = 0;

const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const coverImg = document.getElementById('cover');
const audioPlayer = document.getElementById('audioPlayer');
const card = document.getElementById('card');

async function fetchPlaylist() {
    try {
        // 1. 获取当前页面 URL 中的 tag 参数
        const urlParams = new URLSearchParams(window.location.search);
        const tag = urlParams.get('tag');
        
        // 2. 将 tag 拼接到 API 请求中
        let apiUrl = `${API_BASE}/api/playlist`;
        if (tag) {
            apiUrl += `?tag=${encodeURIComponent(tag)}`;
        }

        const response = await fetch(apiUrl);
        playlist = await response.json();
        
        if (playlist.length > 0) {
            loadSong(0, false);
        } else {
            trackTitle.innerText = tag ? `标签 [${tag}] 下没有歌曲` : "歌单为空";
        }
    } catch (err) {
        console.error("API Error:", err);
        trackTitle.innerText = "接続エラー";
    }
}

function loadSong(index, shouldPlay = true) {
    const song = playlist[index];
    currentIndex = index;

    // 视觉反馈：切换时轻微淡出
    [trackTitle, trackArtist, coverImg].forEach(el => el.style.opacity = '0.3');

    setTimeout(() => {
        trackTitle.innerText = song.title;
        trackArtist.innerText = song.artist;
        coverImg.src = `${API_BASE}/file/${song.r2_cover_key}`;
        audioPlayer.src = `${API_BASE}/file/${song.r2_music_key}`;

        if (song.theme_color) {
            // 使用 CSS 变量或直接修改，添加一点透明度使背景更深邃
            card.style.background = `linear-gradient(135deg, ${song.theme_color}bb 0%, #121212 100%)`;
        }

        audioPlayer.load();
        
        // 恢复不透明度
        [trackTitle, trackArtist, coverImg].forEach(el => el.style.opacity = '1');

        if (shouldPlay) {
            audioPlayer.play().catch(e => console.log("Auto-play blocked by browser"));
        }
    }, 200);
}

document.getElementById('nextBtn').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadSong(currentIndex, true);
});

document.getElementById('prevBtn').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentIndex, true);
});

audioPlayer.addEventListener('ended', () => {
    document.getElementById('nextBtn').click();
});

fetchPlaylist();