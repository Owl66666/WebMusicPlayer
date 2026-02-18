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

    // --- 调试代码开始 ---
    console.group(`🎵 正在加载第 ${index + 1} 首歌`);
    console.log(`标题: %c${song.title}`, "color: #1db954; font-weight: bold");
    console.log(`原始颜色数据 (D1): %c${song.theme_color || '无颜色数据'}`, `color: ${song.theme_color || '#fff'}`);
    // --- 调试代码结束 ---

    // 视觉反馈：切换时轻微淡出
    [trackTitle, trackArtist, coverImg].forEach(el => el.style.opacity = '0.3');

    setTimeout(() => {
        trackTitle.innerText = song.title;
        trackArtist.innerText = song.artist;
        coverImg.src = `${API_BASE}/file/${song.r2_cover_key}`;
        audioPlayer.src = `${API_BASE}/file/${song.r2_music_key}`;

        // 背景颜色处理
        if (song.theme_color) {
            const finalBg = `linear-gradient(135deg, ${song.theme_color}bb 0%, #191919 100%)`;
            card.style.background = finalBg;
            // 打印最终应用的背景样式
            console.log(`最终背景样式: ${finalBg}`);
        } else {
            console.warn("⚠️ 此歌曲未设置 theme_color，使用 CSS 默认背景");
        }

        audioPlayer.load();
        
        [trackTitle, trackArtist, coverImg].forEach(el => el.style.opacity = '1');
        
        console.groupEnd(); // 结束控制台分组

        if (shouldPlay) {
            audioPlayer.play().catch(e => console.log("播放被浏览器拦截"));
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