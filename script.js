const pokemonJsonData = Array.from({ length: 905 }, (_, i) => ({
    id: i + 1,
    name: { en: `Pokemon ${i + 1}`, zh: `寶可夢 ${i + 1}` },
    types: { en: ["Normal"], zh: ["一般"] },
    genera: { en: "Normal Pokémon", zh: "一般寶可夢" },
    entries: {
        en: ["This is a normal Pokémon."],
        zh: ["這是一隻普通的寶可夢。"]
    }
}));

// 創建一個包含多種個性和喜好的數組
const personalities = ['活潑', '溫順', '勇敢', '膽小', '冷靜', '急躁', '開朗', '內向', '調皮', '認真'];
const likes = [
    '喜歡在陽光下曬太陽',
    '喜歡在雨中玩耍',
    '喜歡吃樹果',
    '喜歡和訓練家一起冒險',
    '喜歡在草地上奔跑',
    '喜歡在水中游泳',
    '喜歡收集閃亮的東西',
    '喜歡和其他寶可夢玩耍',
    '喜歡睡懶覺',
    '喜歡挑戰強大的對手'
];

// 生成模擬的 CSV 數據
const csvData = `id,name,personality1,personality2,likes
${pokemonJsonData.map(pokemon => {
    const p1 = personalities[Math.floor(Math.random() * personalities.length)];
    const p2 = personalities[Math.floor(Math.random() * personalities.length)];
    const like = likes[Math.floor(Math.random() * likes.length)];
    return `${pokemon.id},${pokemon.name.zh},${p1},${p2},${like}`;
}).join('\n')}`;

let allPokemon = [];
let pokemonDatabase = [];

// 異步加載數據
async function loadData() {
    try {
        let pokemonJsonData;
        try {
            // 嘗試加載外部JSON文件，使用正確的文件名 PokeApi.json
            const pokemonResponse = await fetch('PokeApi.json');
            pokemonJsonData = await pokemonResponse.json();
        } catch (error) {
            console.warn('無法加載外部JSON文件，使用模擬數據', error);
            // 使用模擬數據
            pokemonJsonData = Array.from({ length: 905 }, (_, i) => ({
                id: i + 1,
                name: { en: `Pokemon ${i + 1}`, zh: `寶可夢 ${i + 1}` },
                types: { en: ["Normal"], zh: ["一般"] },
                genera: { en: "Normal Pokémon", zh: "一般寶可夢" },
                entries: {
                    en: ["This is a normal Pokémon."],
                    zh: ["這是一隻普通的寶可夢。"]
                }
            }));
        }
        console.log('pokemonJsonData 長度:', pokemonJsonData.length);

        // 使用之前生成的模擬CSV數據，而不是嘗試加載外部CSV文件
        console.log('csvData 長度:', csvData.trim().split('\n').length);

        // 處理CSV數據
        const personalityDatabase = {};
        csvData.trim().split('\n').slice(1).forEach((line, index) => {
            line = line.trim();
            if (line) {
                const parts = line.split(',');
                if (parts.length >= 5) {
                    const [id, name, personality1, personality2, ...likesArray] = parts;
                    const likes = likesArray.join(',').trim();
                    if (id && personality1 && personality2 && likes) {
                        personalityDatabase[id.trim()] = { 
                            personality: `${personality1.trim()}、${personality2.trim()}`, 
                            likes: likes
                        };
                    }
                }
            }
        });

        console.log('處理後的 personalityDatabase:', Object.keys(personalityDatabase).length);

        pokemonDatabase = pokemonJsonData.map(pokemon => {
            if (!pokemon || typeof pokemon !== 'object') {
                console.error('無效的寶可夢數據:', pokemon);
                return null;
            }
            const id = pokemon.id.toString();
            return {
                id: id,
                name: pokemon.name,
                types: pokemon.types,
                genera: pokemon.genera,
                entries: pokemon.entries,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                personality: personalityDatabase[id]?.personality || '未知',
                likes: personalityDatabase[id]?.likes || '未知'
            };
        }).filter(pokemon => pokemon !== null);

        console.log('處理後的 pokemonDatabase 長度:', pokemonDatabase.length);
        console.log('第一隻寶可夢:', pokemonDatabase[0]);
        console.log('最後一隻寶可夢:', pokemonDatabase[pokemonDatabase.length - 1]);

        allPokemon = pokemonDatabase;
        console.log('數據加載完成，總共有', allPokemon.length, '隻寶可夢');
        initializeTypeFilter();
        displayPokemonList(allPokemon);
    } catch (error) {
        console.error('加載數據時出錯:', error);
        console.error(error.stack);
    }
}

function displayPokemon(pokemon) {
    if (pokemon) {
        const types = Array.isArray(pokemon.types.zh) ? pokemon.types.zh.join('、') : '未知';
        const entries = Array.isArray(pokemon.entries.zh) ? pokemon.entries.zh.map(entry => `<li>${entry}</li>`).join('') : '無可用說明';
        
        // 隱藏主標題（添加檢查）
        const mainTitle = document.getElementById('mainTitle');
        if (mainTitle) {
            mainTitle.style.display = 'none';
        } else {
            console.warn('未找到 mainTitle 元素');
        }
        
        document.getElementById('result').innerHTML = `
            <a href="#" class="back-button" onclick="returnToList(); return false;">
                <span style="margin-right: 5px;">&#8592;</span> 返回首頁
            </a>
            <div class="pokemon-detail">
                <h2>${pokemon.name.zh} (${pokemon.name.en}) <span class="speak-icon" data-text="${pokemon.name.zh}">🔊</span></h2>
                <img src="${pokemon.image}" alt="${pokemon.name.zh}" style="max-width:100%; height:auto;">
                <p><strong>編號:</strong> ${pokemon.id}</p>
                <p><strong>屬性:</strong> ${types} <span class="speak-icon" data-text="${types}">🔊</span></p>
                <p><strong>分類:</strong> ${pokemon.genera.zh} <span class="speak-icon" data-text="${pokemon.genera.zh}">🔊</span></p>
                <p><strong>個性:</strong> ${pokemon.personality} <span class="speak-icon" data-text="${pokemon.personality}">🔊</span></p>
                <p><strong>喜歡:</strong> ${pokemon.likes} <span class="speak-icon" data-text="${pokemon.likes}">🔊</span></p>
                <h3>說明：</h3>
                <ul>${entries}</ul>
            </div>
        `;

        document.querySelectorAll('.speak-icon').forEach(icon => {
            icon.addEventListener('click', function() {
                speak(this.getAttribute('data-text'));
            });
        });
    } else {
        document.getElementById('result').innerHTML = '未找到該寶可夢';
    }
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    speechSynthesis.speak(utterance);
}

function displayPokemonList(pokemonList) {
    console.log('正在顯示寶可夢列表，列表長度:', pokemonList.length);
    const resultDiv = document.getElementById('result');
    if (!resultDiv) {
        console.error('未找到 result 元素');
        return;
    }
    
    // 顯示主標題（添加檢查）
    const mainTitle = document.getElementById('mainTitle');
    if (mainTitle) {
        mainTitle.style.display = 'block';
    } else {
        console.warn('未找到 mainTitle 元素');
    }
    
    // 其餘代碼保持不變
    resultDiv.innerHTML = `<div class="pokemon-list">
        ${pokemonList.map(pokemon => `
            <div class="pokemon-item" data-id="${pokemon.id}">
                <img src="${pokemon.image}" alt="${pokemon.name.zh}">
                <p>${pokemon.name.zh}</p>
                <p>(${pokemon.name.en})</p>
                <p>#${pokemon.id}</p>
            </div>
        `).join('')}
    </div>`;

    document.querySelectorAll('.pokemon-item').forEach(item => {
        item.addEventListener('click', () => {
            const pokemonId = item.getAttribute('data-id');
            const pokemon = pokemonDatabase.find(p => p.id === pokemonId);
            displayPokemon(pokemon);
        });
    });
    console.log('寶可夢列表顯示完成');
}

function initializeTypeFilter() {
    const types = [...new Set(allPokemon.flatMap(pokemon => 
        pokemon.types && pokemon.types.zh ? pokemon.types.zh : []
    ))];
    const typeFilter = document.getElementById('typeFilter');
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });
}

document.getElementById('searchButton').addEventListener('click', () => {
    const searchInput = document.getElementById('searchInput').value.trim();
    let result;

    if (/^\d+$/.test(searchInput)) {
        // 如果輸入是純數字，按ID搜索
        result = pokemonDatabase.find(pokemon => pokemon.id === searchInput);
    } else {
        // 否則按名稱搜索
        result = pokemonDatabase.find(pokemon => 
            (pokemon.name.zh && pokemon.name.zh.toLowerCase() === searchInput.toLowerCase()) ||
            (pokemon.name.en && pokemon.name.en.toLowerCase() === searchInput.toLowerCase())
        );
    }

    if (result) {
        displayPokemon(result);
    } else {
        document.getElementById('result').innerHTML = '未找到該寶可夢';
    }
});

document.getElementById('typeFilter').addEventListener('change', (event) => {
    const type = event.target.value;
    if (type === "") {
        displayPokemonList(allPokemon);
    } else {
        const filteredPokemon = pokemonDatabase.filter(pokemon => 
            pokemon.types && pokemon.types.zh && pokemon.types.zh.includes(type)
        );
        displayPokemonList(filteredPokemon);
    }
});

// 添加新的函數來處理返回列表
function returnToList() {
    displayPokemonList(allPokemon);
}

// 初始化
console.log('開始加載數據');
loadData();

// 確保在頁面加載完成後顯示所有寶可夢
window.addEventListener('load', () => {
    console.log('頁面加載完成');
    if (allPokemon.length > 0) {
        console.log('正在顯示所有寶可夢');
        displayPokemonList(allPokemon);
    } else {
        console.log('allPokemon 為空，重新加載數據');
        loadData();
    }
});