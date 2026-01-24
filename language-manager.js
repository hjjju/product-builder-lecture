document.addEventListener('DOMContentLoaded', () => {
    const translations = {
        en: {
            lottoTitle: 'Lotto Number Generator',
            contactLink: 'Contact Us',
            contactTitle: 'Contact Us',
            formName: 'Name:',
            formEmail: 'Email:',
            formMessage: 'Message:',
            formSubmit: 'Send Message',
            backLink: 'Back to Lotto Generator',
            themeToggle: 'Toggle Theme',
            generateNumbers: 'Generate Numbers'
        },
        ko: {
            lottoTitle: '로또 번호 생성기',
            contactLink: '문의하기',
            contactTitle: '문의하기',
            formName: '이름:',
            formEmail: '이메일:',
            formMessage: '메시지:',
            formSubmit: '메시지 보내기',
            backLink: '로또 생성기로 돌아가기',
            themeToggle: '테마 변경',
            generateNumbers: '번호 생성'
        },
        ja: {
            lottoTitle: 'ロト番号ジェネレーター',
            contactLink: 'お問い合わせ',
            contactTitle: 'お問い合わせ',
            formName: '名前:',
            formEmail: 'Eメール:',
            formMessage: 'メッセージ:',
            formSubmit: 'メッセージを送信',
            backLink: 'ロトジェネレーターに戻る',
            themeToggle: 'テーマの切り替え',
            generateNumbers: '番号を生成'
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

        // Translate lotto-generator button
        const lottoGenerator = document.querySelector('lotto-generator');
        if (lottoGenerator && lottoGenerator.shadowRoot) {
            const button = lottoGenerator.shadowRoot.getElementById('generate-btn');
            if (button) {
                button.textContent = translations[language].generateNumbers;
            }
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
