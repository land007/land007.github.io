const axios = require("axios");
const fs = require("fs");
const https = require("https");
const path = require("path");

// 替换成你的 Vercel 域名
const baseUrl = "http://localhost:3002";

// 自定义生成音频接口
async function customGenerateAudio(payload) {
    const url = `${baseUrl}/api/custom_generate`;
    const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

// 根据提示生成音频接口
async function generateAudioByPrompt(payload) {
    const url = `${baseUrl}/api/generate`;
    const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

// 扩展音频接口
async function extendAudio(payload) {
    const url = `${baseUrl}/api/extend_audio`;
    const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

// 获取音频信息接口
async function getAudioInformation(audioIds) {
    const url = `${baseUrl}/api/get?ids=${audioIds}`;
    const response = await axios.get(url);
    return response.data;
}

// 获取配额信息接口
async function getQuotaInformation() {
    const url = `${baseUrl}/api/get_limit`;
    const response = await axios.get(url);
    return response.data;
}

// 获取剪辑信息接口
async function getClipInformation(clipId) {
    const url = `${baseUrl}/api/clip?id=${clipId}`;
    const response = await axios.get(url);
    return response.data;
}

// 文件下载函数
const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`下载失败，状态码: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on("finish", () => {
                file.close(resolve);
            });
        }).on("error", (err) => {
            fs.unlink(dest, () => reject(err)); // 删除下载失败的文件
        });
    });
};

// 提示词数组
const prompts = [
    "A soothing orchestral track with soft cello and piano, infused with elements of traditional Chinese music such as guzheng or erhu, creating a calm and peaceful background for narration.",
    "A soothing orchestral track with soft cello and piano, creating a calm and peaceful background for narration.",
    "A gentle acoustic guitar and strings track, providing a relaxed, tranquil atmosphere for narration.",
    "A calming harp and flute track, offering a serene, supportive background for narration.",
    "A soft celesta and bass strings track, creating a peaceful, subtle backdrop for narration."
];

// 主函数执行音频生成和状态检查
async function main() {
    // 随机选择提示词
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    // 调用生成音频接口，传递随机选择的提示信息和参数
    const data = await generateAudioByPrompt({
        prompt: randomPrompt,
        make_instrumental: true, // 设置是否生成纯音乐
        wait_audio: false, // 设置是否等待音频生成完成
    });

    // 获取音频ID，并将它们拼接成字符串
    const ids = `${data[0].id},${data[1].id}`;
    console.log(`ids: ${ids}`);

    // 循环检查音频生成状态，最多检查60次
    for (let i = 0; i < 60; i++) {
        const data = await getAudioInformation(ids);
        if (data[0].status === "streaming") {
            console.log(`${data[0].id} ==> ${data[0].audio_url}`);
            console.log(`${data[1].id} ==> ${data[1].audio_url}`);

            // 下载文件
            const date = new Date();
            const timestamp = date.toISOString().replace(/[-:.]/g, ""); // 生成时间戳
            const destDir = "../land007.github.io/youtube/";

            // 下载第一个音频文件
            const destPath1 = path.join(destDir, `${timestamp}_1.mp3`);
            await downloadFile(data[0].audio_url, destPath1);
            console.log(`文件已下载: ${destPath1}`);

            // 下载第二个音频文件
            const destPath2 = path.join(destDir, `${timestamp}_2.mp3`);
            await downloadFile(data[1].audio_url, destPath2);
            console.log(`文件已下载: ${destPath2}`);

            // 更新 M3U8 播放列表
            const playlistPath = path.join(destDir, "playlist.m3u8");

            const playlistEntry1 = `#EXTINF:123, Music track 1\nhttps://github.qhkly.com/youtube/${path.basename(destPath1)}`;
            const playlistEntry2 = `#EXTINF:123, Music track 2\nhttps://github.qhkly.com/youtube/${path.basename(destPath2)}`;

            // 追加到 M3U8 播放列表文件
            fs.appendFileSync(playlistPath, `\n${playlistEntry1}\n${playlistEntry2}\n`);
            console.log("播放列表已更新");

            break;
        }
        // 每5秒检查一次状态
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}

// 执行主函数
main();
