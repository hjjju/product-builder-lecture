class MenuPicker extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                .menu-card {
                    display: grid;
                    gap: 16px;
                    justify-items: center;
                }

                .controls {
                    display: grid;
                    gap: 12px;
                    width: min(520px, 90vw);
                }

                label {
                    font-weight: 600;
                    color: #333;
                }

                select {
                    padding: 10px 14px;
                    border-radius: 12px;
                    border: 1px solid #ddd;
                    font-size: 1rem;
                    background: #f9f9f9;
                }

                .result {
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: #2d2d2d;
                    background: #f3f6ff;
                    padding: 16px 24px;
                    border-radius: 14px;
                    min-height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
                }

                button {
                    padding: 12px 22px;
                    font-size: 1rem;
                    font-weight: bold;
                    color: white;
                    background: linear-gradient(135deg, #2575fc, #6a11cb);
                    border: none;
                    border-radius: 999px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                }

                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(37, 117, 252, 0.35);
                }

                button:active {
                    transform: translateY(-1px);
                    box-shadow: 0 5px 15px rgba(37, 117, 252, 0.25);
                }

                .secondary {
                    background: #ffffff;
                    color: #4a4a4a;
                    border: 1px solid #e2e2e2;
                    box-shadow: none;
                }

                @media (prefers-color-scheme: dark) {
                    label {
                        color: #e6e6e6;
                    }
                }
            </style>
            <div class="menu-card">
                <div class="controls">
                    <label id="category-label" for="category"></label>
                    <select id="category">
                        <option value="all" id="opt-all"></option>
                        <option value="korean" id="opt-korean"></option>
                        <option value="japanese" id="opt-japanese"></option>
                        <option value="chinese" id="opt-chinese"></option>
                        <option value="western" id="opt-western"></option>
                        <option value="fast" id="opt-fast"></option>
                    </select>
                </div>
                <div class="result" id="result" aria-live="polite"></div>
                <button id="pick-btn"></button>
                <button id="again-btn" class="secondary"></button>
            </div>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.categorySelect = this.shadowRoot.getElementById('category');
        this.resultEl = this.shadowRoot.getElementById('result');
        this.pickBtn = this.shadowRoot.getElementById('pick-btn');
        this.againBtn = this.shadowRoot.getElementById('again-btn');
    }

    connectedCallback() {
        const savedLanguage = localStorage.getItem('language') || 'en';
        this.setLanguage(savedLanguage);
        this.pickBtn.addEventListener('click', () => this.pickMenu());
        this.againBtn.addEventListener('click', () => this.pickMenu());
    }

    setLanguage(language) {
        this.currentLanguage = language;
        const t = this.getTranslations(language);

        this.shadowRoot.getElementById('category-label').textContent = t.categoryLabel;
        this.shadowRoot.getElementById('opt-all').textContent = t.categoryAll;
        this.shadowRoot.getElementById('opt-korean').textContent = t.categoryKorean;
        this.shadowRoot.getElementById('opt-japanese').textContent = t.categoryJapanese;
        this.shadowRoot.getElementById('opt-chinese').textContent = t.categoryChinese;
        this.shadowRoot.getElementById('opt-western').textContent = t.categoryWestern;
        this.shadowRoot.getElementById('opt-fast').textContent = t.categoryFast;

        this.pickBtn.textContent = t.pickButton;
        this.againBtn.textContent = t.againButton;
        this.resultEl.textContent = t.resultPlaceholder;
    }

    getTranslations(language) {
        const translations = {
            en: {
                categoryLabel: 'Pick a category',
                categoryAll: 'All',
                categoryKorean: 'Korean',
                categoryJapanese: 'Japanese',
                categoryChinese: 'Chinese',
                categoryWestern: 'Western',
                categoryFast: 'Quick & Easy',
                pickButton: 'Pick for me',
                againButton: 'Pick another',
                resultPlaceholder: 'Your menu suggestion appears here.'
            },
            ko: {
                categoryLabel: '카테고리를 선택하세요',
                categoryAll: '전체',
                categoryKorean: '한식',
                categoryJapanese: '일식',
                categoryChinese: '중식',
                categoryWestern: '양식',
                categoryFast: '간편식',
                pickButton: '추천받기',
                againButton: '다시 추천',
                resultPlaceholder: '오늘 메뉴 추천 결과가 여기 표시돼요.'
            },
            ja: {
                categoryLabel: 'カテゴリを選んでください',
                categoryAll: 'すべて',
                categoryKorean: '韓国料理',
                categoryJapanese: '日本料理',
                categoryChinese: '中華',
                categoryWestern: '洋食',
                categoryFast: '手軽なメニュー',
                pickButton: 'おすすめして',
                againButton: 'もう一回',
                resultPlaceholder: '今日のおすすめがここに表示されます。'
            }
        };

        return translations[language] || translations.en;
    }

    getMenus(language) {
        const menus = {
            en: {
                korean: ['Kimchi stew', 'Bibimbap', 'Bulgogi', 'Tteokbokki', 'Kimbap'],
                japanese: ['Sushi', 'Ramen', 'Katsu curry', 'Udon', 'Soba'],
                chinese: ['Jajangmyeon', 'Sweet & sour pork', 'Mapo tofu', 'Fried rice', 'Dim sum'],
                western: ['Pasta', 'Steak', 'Burger', 'Salad bowl', 'Pizza'],
                fast: ['Sandwich', 'Chicken wrap', 'Cupbap', 'Gimbap', 'Tacos']
            },
            ko: {
                korean: ['김치찌개', '비빔밥', '불고기', '떡볶이', '김밥'],
                japanese: ['스시', '라멘', '카레돈까스', '우동', '소바'],
                chinese: ['짜장면', '탕수육', '마파두부', '볶음밥', '딤섬'],
                western: ['파스타', '스테이크', '버거', '샐러드볼', '피자'],
                fast: ['샌드위치', '치킨 랩', '컵밥', '김밥', '타코']
            },
            ja: {
                korean: ['キムチチゲ', 'ビビンバ', 'プルコギ', 'トッポッキ', 'キンパ'],
                japanese: ['寿司', 'ラーメン', 'カツカレー', 'うどん', 'そば'],
                chinese: ['ジャージャー麺', '酢豚', '麻婆豆腐', 'チャーハン', '点心'],
                western: ['パスタ', 'ステーキ', 'ハンバーガー', 'サラダボウル', 'ピザ'],
                fast: ['サンドイッチ', 'チキンラップ', 'カップバップ', 'キンパ', 'タコス']
            }
        };

        return menus[language] || menus.en;
    }

    pickMenu() {
        const menus = this.getMenus(this.currentLanguage);
        const category = this.categorySelect.value;
        const allMenus = category === 'all'
            ? Object.values(menus).flat()
            : menus[category] || [];

        if (!allMenus.length) {
            this.resultEl.textContent = 'No menu available.';
            return;
        }

        const choice = allMenus[Math.floor(Math.random() * allMenus.length)];
        this.resultEl.textContent = choice;
    }
}

customElements.define('menu-picker', MenuPicker);
