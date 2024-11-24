const axios = require("axios");
const fs = require("fs");
const https = require("https");
const path = require("path");

// /node/suno-api_yuan# npm run dev
// 替换成你的 Vercel 域名
const baseUrl = "http://localhost:3002";

const musicalInstruments = {
    "钢琴": "Piano",
    "吉他": "Guitar",
    "小提琴": "Violin",
    "大提琴": "Cello",
    "中提琴": "Viola",
    "长笛": "Flute",
    "单簧管": "Clarinet",
    "萨克斯ophone": "Saxophone",
    "圆号": "French Horn",
    "小号": "Trumpet",
    "低音提琴": "Double Bass",
    "竖琴": "Harp",
    "管风琴": "Organ",
    "电子琴": "Electric Keyboard",
    "打击乐器": "Percussion Instruments",
    "鼓组": "Drum Set",
    "定音鼓": "Timpani",
    "鼓": "Drums",
    "木琴": "Xylophone",
    "马林巴": "Marimba",
    "钢片琴": "Glockenspiel",
    "铙钹": "Cymbals",
    "铃鼓": "Tambourine",
    "沙锤": "Shaker",
    "三角铁": "Triangle",
    "钢管琴": "Steelpan",
    "小鼓": "Snare Drum",
    "巴松管": "Bassoon",
    "低音号角": "Tuba",
    "电子吉他": "Electric Guitar",
    "电子贝斯": "Electric Bass",
    "手风琴": "Accordion",
    "口琴": "Harmonica",
    "双簧管": "Oboe",
    "古筝": "Gu Zheng",
    "二胡": "Erhu",
    "扬琴": "Yangqin",
    "笛子": "Dizi",
    "琵琶": "Pipa",
    "胡琴": "Huqin",
    "笙": "Sheng",
    "唢呐": "Suona",
    "大鼓": "Bass Drum",
    "锣": "Gong",
    "大号": "Bass Trombone",
    "小号": "Trumpet",
    "小鼓": "Tom-tom",
    "卡祖笛": "Kazoo",
    "小提琴": "Violin",
    "吉他": "Guitar",
    "手鼓": "Bongo Drum",
    "康加鼓": "Conga",
    "陶笛": "Ocarina",
    "卡林巴": "Kalimba",
    "杜布尔音": "Duduk",
    "贝尔": "Bell",
    "口风琴": "Melodica",
    "铜管乐器": "Brass Instruments",
    "弦乐器": "String Instruments",
    "木管乐器": "Woodwind Instruments",
    "打击乐器": "Percussion Instruments"
};

const band = [
    {
        "乐队1": ["吉他", "小提琴", "长笛", "低音提琴", "电子吉他"]
    },
    {
        "乐队2": ["钢琴", "萨克斯ophone", "鼓组", "小号", "马林巴"]
    },
    {
        "乐队3": ["钢管琴", "小提琴", "大提琴", "电子吉他", "贝斯"]
    },
    {
        "乐队4": ["吉他", "打击乐器", "笛子", "大号", "小号"]
    },
    {
        "乐队5": ["中提琴", "竖琴", "三角铁", "低音提琴", "小鼓"]
    },
    {
        "乐队6": ["口琴", "木琴", "电子琴", "低音号角", "鼓组"]
    },
    {
        "乐队7": ["大鼓", "打击乐器", "小号", "小提琴", "卡林巴"]
    },
    {
        "乐队8": ["双簧管", "大提琴", "长笛", "笙", "马林巴"]
    },
    {
        "乐队9": ["钢琴", "贝尔", "电子吉他", "鼓组", "康加鼓"]
    },
    {
        "乐队10": ["胡琴", "手风琴", "小鼓", "大鼓", "小号"]
    }
];

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
