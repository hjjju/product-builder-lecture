document.addEventListener('DOMContentLoaded', () => {
    const translations = {
        en: {
            menuTitle: 'What should I eat today?',
            menuSubtitle: 'Get a quick menu suggestion in seconds.',
            animalTestLink: 'Animal Face Test',
            contactLink: 'Contact Us',
            contactTitle: 'Contact Us',
            formName: 'Name:',
            formEmail: 'Email:',
            formMessage: 'Message:',
            formSubmit: 'Send Message',
            backLink: 'Back to Menu Picker',
            themeToggle: 'Toggle Theme',
            pickButton: 'Pick for me',
            againButton: 'Pick another',
            categoryLabel: 'Pick a category',
            categoryAll: 'All',
            categoryKorean: 'Korean',
            categoryJapanese: 'Japanese',
            categoryChinese: 'Chinese',
            categoryWestern: 'Western',
            categoryFast: 'Quick & Easy',
            resultPlaceholder: 'Your menu suggestion appears here.',
            animalTestTitle: 'Animal Face Test',
            animalTestSubtitle: 'Find out which animal vibe you give off today.',
            cameraPlaceholder: 'Camera preview will appear here.',
            startCamera: 'Start Camera',
            stopCamera: 'Stop Camera',
            uploadLabel: 'Or upload a photo',
            resultTitle: 'Result',
            backToMenu: 'Back to Menu Picker'
        },
        ko: {
            menuTitle: '오늘 메뉴 뭐먹지',
            menuSubtitle: '몇 초 만에 오늘의 메뉴를 추천받아 보세요.',
            animalTestLink: '동물상 테스트',
            contactLink: '문의하기',
            contactTitle: '문의하기',
            formName: '이름:',
            formEmail: '이메일:',
            formMessage: '메시지:',
            formSubmit: '메시지 보내기',
            backLink: '메뉴 추천으로 돌아가기',
            themeToggle: '테마 변경',
            pickButton: '추천받기',
            againButton: '다시 추천',
            categoryLabel: '카테고리를 선택하세요',
            categoryAll: '전체',
            categoryKorean: '한식',
            categoryJapanese: '일식',
            categoryChinese: '중식',
            categoryWestern: '양식',
            categoryFast: '간편식',
            resultPlaceholder: '오늘 메뉴 추천 결과가 여기 표시돼요.',
            animalTestTitle: '동물상 테스트',
            animalTestSubtitle: '오늘의 동물상 분위기를 확인해보세요.',
            cameraPlaceholder: '카메라 화면이 여기에 표시돼요.',
            startCamera: '카메라 시작',
            stopCamera: '카메라 종료',
            uploadLabel: '또는 사진 업로드',
            resultTitle: '결과',
            backToMenu: '메뉴 추천으로 돌아가기'
        },
        ja: {
            menuTitle: '今日のごはん、何にする？',
            menuSubtitle: 'すぐに今日のメニューをおすすめします。',
            animalTestLink: 'アニマル診断',
            contactLink: 'お問い合わせ',
            contactTitle: 'お問い合わせ',
            formName: '名前:',
            formEmail: 'Eメール:',
            formMessage: 'メッセージ:',
            formSubmit: 'メッセージを送信',
            backLink: 'メニューおすすめに戻る',
            themeToggle: 'テーマの切り替え',
            pickButton: 'おすすめして',
            againButton: 'もう一回',
            categoryLabel: 'カテゴリを選んでください',
            categoryAll: 'すべて',
            categoryKorean: '韓国料理',
            categoryJapanese: '日本料理',
            categoryChinese: '中華',
            categoryWestern: '洋食',
            categoryFast: '手軽なメニュー',
            resultPlaceholder: '今日のおすすめがここに表示されます。',
            animalTestTitle: 'アニマル診断',
            animalTestSubtitle: '今日の雰囲気に近い動物をチェック。',
            cameraPlaceholder: 'カメラ映像がここに表示されます。',
            startCamera: 'カメラ開始',
            stopCamera: 'カメラ停止',
            uploadLabel: 'または写真をアップロード',
            resultTitle: '結果',
            backToMenu: 'メニューおすすめに戻る'
        }
    };

    const languageSwitcher = document.getElementById('language-switcher');

    const setLanguage = (language) => {
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            if (translations[language] && translations[language][key]) {
                element.textContent = translations[language][key];
            }
        });

        // Translate menu-picker component
        const menuPicker = document.querySelector('menu-picker');
        if (menuPicker && typeof menuPicker.setLanguage === 'function') {
            menuPicker.setLanguage(language);
        }

        const animalPageElements = document.querySelectorAll('[data-lang]');
        if (animalPageElements.length) {
            const event = new CustomEvent('language-change', { detail: { language } });
            document.dispatchEvent(event);
        }

        // Translate theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = translations[language].themeToggle;
        }
    };

    languageSwitcher.addEventListener('change', (event) => {
        const selectedLanguage = event.target.value;
        localStorage.setItem('language', selectedLanguage);
        setLanguage(selectedLanguage);
    });

    // Set initial language
    const savedLanguage = localStorage.getItem('language') || 'en';
    languageSwitcher.value = savedLanguage;
    setLanguage(savedLanguage);
});
