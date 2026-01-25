const MODEL_BASE_URL = 'https://teachablemachine.withgoogle.com/models/I5ePfTeg-/';

const modelURL = `${MODEL_BASE_URL}model.json`;
const metadataURL = `${MODEL_BASE_URL}metadata.json`;

let model;
const resultMain = document.getElementById('result-main');
const resultBars = document.getElementById('result-bars');
const uploadInput = document.getElementById('upload-input');
const previewImage = document.getElementById('preview-image');

const state = {
    language: localStorage.getItem('language') || 'en',
    labelMap: null
};

const labelTranslations = {
    en: {
        Cat: 'Cat',
        Dog: 'Dog'
    },
    ko: {
        Cat: '고양이상',
        Dog: '강아지상'
    },
    ja: {
        Cat: '猫っぽい',
        Dog: '犬っぽい'
    }
};

const uiTranslations = {
    en: {
        loadingModel: 'Loading model...',
        resultPrefix: 'Your vibe: '
    },
    ko: {
        loadingModel: '모델 불러오는 중...',
        resultPrefix: '오늘의 분위기: '
    },
    ja: {
        loadingModel: 'モデルを読み込み中...',
        resultPrefix: '今日の雰囲気: '
    }
};

function getUILabel(key) {
    const t = uiTranslations[state.language] || uiTranslations.en;
    return t[key] || '';
}

function translateLabel(label) {
    if (!label) return '';
    const map = labelTranslations[state.language] || labelTranslations.en;
    return map[label] || label;
}

async function loadModel() {
    if (model) return model;
    resultMain.textContent = getUILabel('loadingModel');
    model = await tmImage.load(modelURL, metadataURL);
    return model;
}

function updateResult(predictions) {
    if (!predictions || !predictions.length) return;

    const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
    const top = sorted[0];
    const label = translateLabel(top.className);

    resultMain.textContent = `${getUILabel('resultPrefix')}${label} (${Math.round(top.probability * 100)}%)`;

    resultBars.innerHTML = '';
    sorted.forEach(item => {
        const bar = document.createElement('div');
        bar.className = 'result-bar';
        bar.innerHTML = `
            <span class="label">${translateLabel(item.className)}</span>
            <span class="value">${Math.round(item.probability * 100)}%</span>
            <div class="track">
                <div class="fill" style="width: ${item.probability * 100}%"></div>
            </div>
        `;
        resultBars.appendChild(bar);
    });
}

async function predictWithImage(image) {
    const loadedModel = await loadModel();
    const predictions = await loadedModel.predict(image);
    updateResult(predictions);
}

function handleUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        previewImage.src = reader.result;
        previewImage.style.display = 'block';
        predictWithImage(previewImage);
    };
    reader.readAsDataURL(file);
}

function syncLanguage(language) {
    state.language = language;
    if (!previewImage.src) {
        resultMain.textContent = '-';
    }
}

uploadInput.addEventListener('change', handleUpload);

document.addEventListener('language-change', (event) => {
    syncLanguage(event.detail.language);
});

syncLanguage(state.language);
