const pokemonJsonData = Array.from({ length: 905 }, (_, i) => ({
    id: i + 1,
    name: { en: `Pokemon ${i + 1}`, zh: `宝可梦 ${i + 1}` },
    types: { en: ["Normal"], zh: ["一般"] },
    genera: { en: "Normal Pokémon", zh: "一般宝可梦" },
    entries: {
        en: ["This is a normal Pokémon."],
        zh: ["这是一只普通的宝可梦。"]
    }
}));

// 创建一个包含多种个性和喜好的数组
const personalities = ['活泼', '温顺', '勇敢', '胆小', '冷静', '急躁', '开朗', '内向', '调皮', '认真'];
const likes = [
    '喜欢在阳光下晒太阳',
    '喜欢在雨中玩耍',
    '喜欢吃树果',
    '喜欢和训练家一起冒险',
    '喜欢在草地上奔跑',
    '喜欢在水中游泳',
    '喜欢收集闪亮的东西',
    '喜欢和其他宝可梦玩耍',
    '喜欢睡懒觉',
    '喜欢挑战强大的对手'
];

// 生成模拟的 CSV 数据
const csvData = `id,name,personality1,personality2,likes
${pokemonJsonData.map(pokemon => {
    const p1 = personalities[Math.floor(Math.random() * personalities.length)];
    const p2 = personalities[Math.floor(Math.random() * personalities.length)];
    const like = likes[Math.floor(Math.random() * likes.length)];
    return `${pokemon.id},${pokemon.name.zh},${p1},${p2},${like}`;
}).join('\n')}`;

let allPokemon = [];
let pokemonDatabase = [];

// 异步加载数据
async function loadData() {
    try {
        let pokemonJsonData;
        try {
            // 尝试加载外部JSON文件，使用正确的文件名 PokeApi.json
            const pokemonResponse = await fetch('PokeApi.json');
            pokemonJsonData = await pokemonResponse.json();
        } catch (error) {
            console.warn('无法加载外部JSON文件，使用模拟数据', error);
            // 使用模拟数据
            pokemonJsonData = Array.from({ length: 905 }, (_, i) => ({
                id: i + 1,
                name: { en: `Pokemon ${i + 1}`, zh: `宝可梦 ${i + 1}` },
                types: { en: ["Normal"], zh: ["一般"] },
                genera: { en: "Normal Pokémon", zh: "一般宝可梦" },
                entries: {
                    en: ["This is a normal Pokémon."],
                    zh: ["这是一只普通的宝可梦。"]
                }
            }));
        }
        console.log('pokemonJsonData 长度:', pokemonJsonData.length);

        // 使用之前生成的模拟CSV数据，而不是尝试加载外部CSV文件
        console.log('csvData 长度:', csvData.trim().split('\n').length);

        // 处理CSV数据
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

        console.log('处理后的 personalityDatabase:', Object.keys(personalityDatabase).length);

        pokemonDatabase = pokemonJsonData.map(pokemon => {
            if (!pokemon || typeof pokemon !== 'object') {
                console.error('无效的宝可梦数据:', pokemon);
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

        console.log('处理后的 pokemonDatabase 长度:', pokemonDatabase.length);
        console.log('第一只宝可梦:', pokemonDatabase[0]);
        console.log('最后一只宝可梦:', pokemonDatabase[pokemonDatabase.length - 1]);

        allPokemon = pokemonDatabase;
        console.log('数据加载完成，总共有', allPokemon.length, '只宝可梦');
        initializeTypeFilter();
        displayPokemonList(allPokemon);
    } catch (error) {
        console.error('加载数据时出错:', error);
        console.error(error.stack);
    }
}

function displayPokemon(pokemon) {
    if (pokemon) {
        const types = Array.isArray(pokemon.types.zh) ? pokemon.types.zh.join(', ') : '未知';
        const entries = Array.isArray(pokemon.entries.zh) ? pokemon.entries.zh.map(entry => `<li>${entry}</li>`).join('') : '无可用说明';
        
        document.getElementById('result').innerHTML = `
            <div class="pokemon-detail">
                <h2>${pokemon.name.zh} (${pokemon.name.en}) <span class="speak-icon" data-text="${pokemon.name.zh}">🔊</span></h2>
                <img src="${pokemon.image}" alt="${pokemon.name.zh}" style="max-width:100%; height:auto;">
                <p>编号: ${pokemon.id}</p>
                <p>属性: ${types} <span class="speak-icon" data-text="${types}">🔊</span></p>
                <p>分类: ${pokemon.genera.zh} <span class="speak-icon" data-text="${pokemon.genera.zh}">🔊</span></p>
                <p>个性: ${pokemon.personality} <span class="speak-icon" data-text="${pokemon.personality}">🔊</span></p>
                <p>喜欢: ${pokemon.likes} <span class="speak-icon" data-text="${pokemon.likes}">🔊</span></p>
                <h3>说明：</h3>
                <ul>${entries}</ul>
            </div>
        `;

        document.querySelectorAll('.speak-icon').forEach(icon => {
            icon.addEventListener('click', function() {
                speak(this.getAttribute('data-text'));
            });
        });
    } else {
        document.getElementById('result').innerHTML = '未找到该宝可梦';
    }
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    speechSynthesis.speak(utterance);
}

function displayPokemonList(pokemonList) {
    console.log('正在显示宝可梦列表，列表长度:', pokemonList.length);
    const resultDiv = document.getElementById('result');
    if (!resultDiv) {
        console.error('未找到 result 元素');
        return;
    }
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
    console.log('宝可梦列表显示完成');
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
        // 如果输入是纯数字，按ID搜索
        result = pokemonDatabase.find(pokemon => pokemon.id === searchInput);
    } else {
        // 否则按名称搜索
        result = pokemonDatabase.find(pokemon => 
            (pokemon.name.zh && pokemon.name.zh.toLowerCase() === searchInput.toLowerCase()) ||
            (pokemon.name.en && pokemon.name.en.toLowerCase() === searchInput.toLowerCase())
        );
    }

    if (result) {
        displayPokemon(result);
    } else {
        document.getElementById('result').innerHTML = '未找到该宝可梦';
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

// 初始化
console.log('开始加载数据');
loadData();

// 确保在页面加载完成后显示所有宝可梦
window.addEventListener('load', () => {
    console.log('页面加载完成');
    if (allPokemon.length > 0) {
        console.log('正在显示所有宝可梦');
        displayPokemonList(allPokemon);
    } else {
        console.log('allPokemon 为空，重新加载数据');
        loadData();
    }
});