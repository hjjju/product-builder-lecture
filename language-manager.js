document.addEventListener('DOMContentLoaded', () => {
    const translations = {
        en: {
            menuTitle: 'What should I eat today?',
            menuSubtitle: 'Get a quick menu suggestion in seconds.',
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
            resultPlaceholder: 'Your menu suggestion appears here.'
        },
        ko: {
            menuTitle: '오늘 메뉴 뭐먹지',
            menuSubtitle: '몇 초 만에 오늘의 메뉴를 추천받아 보세요.',
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
            resultPlaceholder: '오늘 메뉴 추천 결과가 여기 표시돼요.'
        },
        ja: {
            menuTitle: '今日のごはん、何にする？',
            menuSubtitle: 'すぐに今日のメニューをおすすめします。',
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
            resultPlaceholder: '今日のおすすめがここに表示されます。'
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
