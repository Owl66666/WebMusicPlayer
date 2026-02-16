// 配置你的 Worker 域名
const API_BASE = "https://music-api.zchong517.workers.dev"; 

let playlist = [];
let currentIndex = 0;

const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const coverImg = document.getElementById('cover');
const audioPlayer = document.getElementById('audioPlayer');
const card = document.getElementById('card');

// 1. 初始化：获取歌单
async function fetchPlaylist() {
    try {
        const response = await fetch(`${API_BASE}/api/playlist`);
        playlist = await response.json();
        
        if (playlist.length > 0) {
            loadSong(0);
        } else {
            trackTitle.innerText = "歌单为空";
        }
    } catch (err) {
        console.error("API Error:", err);
        trackTitle.innerText = "接続エラー";
    }
}

// 2. 加载选中的歌曲
function loadSong(index) {
    const song = playlist[index];
    currentIndex = index;

    // 注入文本
    trackTitle.innerText = song.title;
    trackArtist.innerText = song.artist;

    // 注入资源 (走 Worker 的 /file/ 代理)
    coverImg.src = `${API_BASE}/file/${song.r2_cover_key}`;
    audioPlayer.src = `${API_BASE}/file/${song.r2_music_key}`;

    // 背景颜色注入 (优先使用 D1 中 Python 预存的颜色)
    if (song.theme_color) {
        card.style.background = `linear-gradient(135deg, ${song.theme_color} 0%, #121212 100%)`;
    }

    // 加载并播放 (受浏览器策略限制，可能需要用户点一下才能响)
    audioPlayer.load();
}

// 3. 按钮交互逻辑
document.getElementById('nextBtn').addEventListener('click', () => {
    let nextIndex = (currentIndex + 1) % playlist.length;
    loadSong(nextIndex);
});

document.getElementById('prevBtn').addEventListener('click', () => {
    let prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadSong(prevIndex);
});

// 4. 自动播放下一首
audioPlayer.addEventListener('ended', () => {
    document.getElementById('nextBtn').click();
});

// 执行初始化
fetchPlaylist();