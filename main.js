const MEAL_CONFIG = {
    breakfast: { keyword: 'breakfast cafe brunch', minRating: 4.2 },
    lunch: { keyword: 'lunch restaurant', minRating: 4.1 },
    dinner: { keyword: 'dinner restaurant', minRating: 4.1 }
};

const MAX_RESULTS = 6;
const DESSERT_RESULTS = 4;
const LOADING_CARDS = 3;

const SAMPLE_PLACES = [
    {
        name: 'Sample Kitchen',
        rating: 4.4,
        user_ratings_total: 128,
        opening_hours: { open_now: true },
        types: ['restaurant', 'casual dining'],
        isSample: true
    },
    {
        name: 'Sample Bowl',
        rating: 4.2,
        user_ratings_total: 96,
        opening_hours: { open_now: true },
        types: ['korean', 'rice bowl'],
        isSample: true
    },
    {
        name: 'Sample Noodle',
        rating: 4.1,
        user_ratings_total: 84,
        opening_hours: { open_now: false },
        types: ['noodle', 'quick bite'],
        isSample: true
    }
];

const SAMPLE_DESSERTS = [
    {
        name: 'Sample Cafe',
        rating: 4.5,
        user_ratings_total: 142,
        opening_hours: { open_now: true },
        types: ['cafe', 'dessert'],
        isSample: true
    },
    {
        name: 'Sample Bakery',
        rating: 4.3,
        user_ratings_total: 77,
        opening_hours: { open_now: true },
        types: ['bakery', 'coffee'],
        isSample: true
    }
];

const locationBtn = document.getElementById('location-btn');
const locationStatus = document.getElementById('location-status');
const mealTitle = document.getElementById('meal-title');
const recommendList = document.getElementById('recommend-list');
const openList = document.getElementById('open-list');
const dessertList = document.getElementById('dessert-list');
const quizCard = document.getElementById('quiz-card');
const quizRefresh = document.getElementById('quiz-refresh');

const state = {
    language: localStorage.getItem('language') || 'en',
    placesService: null
};

const timeTitles = {
    en: {
        breakfast: 'What should I eat for breakfast?',
        lunch: 'What should I eat for lunch?',
        dinner: 'What should I eat for dinner?'
    },
    ko: {
        breakfast: '오늘 아침 뭐 먹지?',
        lunch: '오늘 점심 뭐 먹지?',
        dinner: '오늘 저녁 뭐 먹지?'
    },
    ja: {
        breakfast: '今日の朝ごはんは？',
        lunch: '今日の昼ごはんは？',
        dinner: '今日の夜ごはんは？'
    }
};

const statusMessages = {
    en: {
        ready: 'Allow location access to see open, top-rated places near you.',
        loading: 'Finding open places near you...',
        denied: 'Location access is required to show nearby recommendations.',
        error: 'Could not fetch places. Please try again later.'
    },
    ko: {
        ready: '위치 사용에 동의하면 현재 영업 중인 맛집과 사진을 보여드려요.',
        loading: '주변의 영업 중인 음식점을 찾고 있어요...',
        denied: '위치 정보가 필요합니다. 브라우저에서 허용해 주세요.',
        error: '추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
    },
    ja: {
        ready: '位置情報の許可で営業中のおすすめを表示します。',
        loading: '近くの営業中のお店を探しています...',
        denied: '位置情報の許可が必要です。',
        error: 'おすすめを取得できませんでした。'
    }
};

const labels = {
    en: {
        openNow: 'Open now',
        closed: 'Closed',
        rating: 'Rating',
        reviews: 'reviews',
        view: 'View',
        miles: 'mi',
        emptyState: 'No recommendations available yet.',
        sampleBadge: 'Sample',
        sampleNote: 'Preview cards shown before loading nearby results.',
        sampleLink: 'Preview',
        quizAnswerLabel: 'Answer',
        quizShowAnswer: 'Show answer',
        quizHideAnswer: 'Hide answer',
        taste: 'Taste',
        clean: 'Cleanliness',
        menu: 'Popular menu',
        summaryNote: 'Review-based estimate'
    },
    ko: {
        openNow: '영업 중',
        closed: '영업 종료',
        rating: '평점',
        reviews: '리뷰',
        view: '보기',
        miles: '마일',
        emptyState: '추천할 음식점이 없습니다.',
        sampleBadge: '샘플',
        sampleNote: '내 주변 추천을 불러오기 전 미리보기 카드가 표시됩니다.',
        sampleLink: '미리보기',
        quizAnswerLabel: '정답',
        quizShowAnswer: '정답 보기',
        quizHideAnswer: '정답 숨기기',
        taste: '맛',
        clean: '청결',
        menu: '인기 메뉴',
        summaryNote: '리뷰 기반 추정'
    },
    ja: {
        openNow: '営業中',
        closed: '営業時間外',
        rating: '評価',
        reviews: 'レビュー',
        view: '見る',
        miles: 'マイル',
        emptyState: 'おすすめのお店が見つかりませんでした。',
        sampleBadge: 'サンプル',
        sampleNote: '近くのおすすめを読み込む前のプレビューです。',
        sampleLink: 'プレビュー',
        quizAnswerLabel: '答え',
        quizShowAnswer: '答えを見る',
        quizHideAnswer: '答えを隠す',
        taste: '味',
        clean: '清潔さ',
        menu: '人気メニュー',
        summaryNote: 'レビュー推定'
    }
};

const nonsenseQuizzes = {
    en: [
        { q: 'What has to be broken before you can use it?', a: 'An egg.' },
        { q: "I'm tall when I'm young, and I'm short when I'm old. What am I?", a: 'A candle.' },
        { q: 'What month of the year has 28 days?', a: 'All of them.' },
        { q: 'What is full of holes but still holds water?', a: 'A sponge.' },
        { q: 'What question can you never answer yes to?', a: 'Are you asleep yet?' },
        { q: "What is always in front of you but can't be seen?", a: 'The future.' },
        { q: 'What can you break, even if you never pick it up or touch it?', a: 'A promise.' },
        { q: 'What goes up but never comes down?', a: 'Your age.' },
        { q: 'What gets wet while drying?', a: 'A towel.' },
        { q: 'What can you keep after giving to someone?', a: 'Your word.' },
        { q: "What can you catch but can't throw?", a: 'A cold.' },
        { q: "What has one eye but can't see?", a: 'A needle.' },
        { q: 'What appears once in a minute, twice in a moment, but never in a thousand years?', a: 'The letter M.' },
        { q: 'I can go all around the world but never leave my corner. What am I?', a: 'A stamp.' },
        { q: 'If you drop me, I crack. If you smile at me, I smile back. What am I?', a: 'A mirror.' },
        { q: 'What rock group consists of four famous men, but none of them sing?', a: 'Mount Rushmore.' },
        { q: 'I start with M, end with X, and have a never-ending amount of letters. What am I?', a: 'A mailbox.' },
        { q: 'What is orange and sounds like a parrot?', a: 'A carrot.' },
        { q: 'I travel all around the world, but never leave the corner. What am I?', a: 'A stamp.' },
        { q: 'Why did 6 fear 7?', a: 'Because 789 (seven ate nine).' }
    ],
    ko: [
        { q: '타이타닉의 구명보트는 몇 명이 탈수 있을까?', a: '9명.' },
        { q: '초등학생이 가장 좋아하는 동네는?', a: '방학동.' },
        { q: '진짜 문제투성이인 것은?', a: '시험지.' },
        { q: '폭력배가 많은 나라?', a: '칠레.' },
        { q: '아무리 예뻐도 미녀라고 못하는 이사람은?', a: '미남.' },
        { q: '닿기만 해도 취하는 술은?', a: '입술.' },
        { q: '보기만 해도 취하는 술은?', a: '마술.' },
        { q: '학생들이 싫어하는 피자는?', a: '책피자.' },
        { q: '늘 후회하면서 타는 차는?', a: '아차차.' },
        { q: '가장 지저분한 닭은?', a: '발바닥.' },
        { q: '가장 무서운 닭은?', a: '혓바닥.' },
        { q: '세상에서 가장 행복한 존속은?', a: '대만족.' },
        { q: '이세상에서 가장 맛없는 감은?', a: '열등감.' },
        { q: '이세상에서 가장 맛있는 감은?', a: '자신감.' },
        { q: '왕이 넘어지면?', a: '킹콩.' },
        { q: '왕이 궁궐에 들어가기 싫어할 때 하는 말은?', a: '궁시렁 궁시렁.' },
        { q: '원숭이가 벌을 서면?', a: '벌거숭이.' },
        { q: '서울시민 모두가 동시에 외치면 무슨 말이 될까?', a: '천만의 말씀.' },
        { q: '사람의 몸무게가 가장 많이 나갈 때는?', a: '철들 때.' },
        { q: '코끼리 두 마리가 서로 싸워, 둘 다 코가 떨어져 나갔다면 어떻게 될까?', a: '끼리끼리.' }
    ],
    ja: [
        { q: 'パンはパンでも食べられないパンは?', a: 'フライパン。' },
        { q: 'カレーはカレーでも熱くないカレーは?', a: 'カレンダー。' },
        { q: 'タイはタイでも食べられないタイは?', a: 'ネクタイ。' },
        { q: 'ハムはハムでも食べられないハムは?', a: 'ハムスター。' },
        { q: 'サイはサイでも乗れないサイは?', a: 'サイコロ。' },
        { q: 'カキはカキでも食べられないカキは?', a: '垣根 (かきね)。' },
        { q: 'スターはスターでも食べられるスターは?', a: 'カスタード。' },
        { q: 'バスはバスでも乗れないバスは?', a: 'コンパス。' },
        { q: 'ボールはボールでも蹴れないボールは?', a: 'ダンボール。' },
        { q: '「かか」と声をかけても返事をしないのは?', a: 'かかし。' }
    ]
};

let lastQuizIndex = null;

function getText(map, key) {
    const t = map[state.language] || map.en;
    return t[key] || '';
}

function setStatus(key) {
    locationStatus.textContent = getText(statusMessages, key);
}

function getMealTime() {
    const hour = new Date().getHours();
    return hour < 10 ? 'breakfast' : hour < 16 ? 'lunch' : 'dinner';
}

function updateMealTitle() {
    const current = getMealTime();
    mealTitle.textContent = getText(timeTitles, current);
}

function renderQuiz() {
    if (!quizCard) return;
    const pool = nonsenseQuizzes[state.language] || nonsenseQuizzes.en;
    if (!pool.length) return;
    let idx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && idx === lastQuizIndex) {
        idx = (idx + 1) % pool.length;
    }
    lastQuizIndex = idx;
    const t = labels[state.language] || labels.en;
    const item = pool[idx];
    quizCard.innerHTML = `
        <div class="quiz-question">${item.q}</div>
        <button class="quiz-toggle" type="button" aria-expanded="false">${t.quizShowAnswer}</button>
        <div class="quiz-answer is-hidden"><span>${t.quizAnswerLabel}:</span> ${item.a}</div>
    `;
}

function initPlacesService() {
    if (state.placesService) return;
    const map = document.createElement('div');
    map.style.display = 'none';
    document.body.appendChild(map);
    state.placesService = new google.maps.places.PlacesService(map);
}

function buildPhotoUrl(photo) {
    if (!photo) return '';
    return photo.getUrl({ maxWidth: 520, maxHeight: 400 });
}

function ratingToPercent(rating) {
    if (!rating) return 0;
    return Math.min(100, Math.round((rating / 5) * 100));
}

function extractMenuKeywords(text) {
    const keywords = [
        '김치찌개', '비빔밥', '불고기', '떡볶이', '김밥', '라멘', '우동', '카츠', '초밥',
        '짜장면', '짬뽕', '마라', '탕수육', '파스타', '스테이크', '버거', '피자', '샐러드',
        '팬케이크', '브런치', '커피', '라떼', '케이크', '마카롱', '타르트',
        'ramen', 'sushi', 'burger', 'pizza', 'pasta', 'steak', 'salad', 'coffee', 'latte', 'cake',
        'パンケーキ', 'ラーメン', '寿司', 'カレー', 'ケーキ', 'コーヒー', 'パスタ'
    ];
    const counts = new Map();
    keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex);
        if (matches) counts.set(keyword, matches.length);
    });
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([word]) => word)
        .slice(0, 2);
}

function summarizeReviews(reviews, rating) {
    const text = (reviews || []).map(review => review.text || '').join(' ');
    const lower = text.toLowerCase();

    const tasteKeywords = ['맛', '맛있', '맛있다', 'delicious', 'tasty', 'flavor', '旨い', '美味'];
    const cleanKeywords = ['청결', '깨끗', 'clean', 'hygiene', '清潔'];

    const tasteHit = tasteKeywords.some(word => lower.includes(word));
    const cleanHit = cleanKeywords.some(word => lower.includes(word));

    const tasteScore = tasteHit ? '좋음' : rating >= 4.3 ? '좋음' : rating >= 4.0 ? '보통' : '확인 필요';
    const cleanScore = cleanHit ? '좋음' : rating >= 4.3 ? '좋음' : '정보 부족';

    const menuKeywords = extractMenuKeywords(text);
    const menuText = menuKeywords.length ? menuKeywords.join(', ') : '리뷰 언급 없음';

    return { tasteScore, cleanScore, menuText };
}

function summarizeReviewsLocalized(reviews, rating) {
    const summary = summarizeReviews(reviews, rating);
    if (state.language === 'en') {
        return {
            tasteScore: summary.tasteScore === '좋음' ? 'Good' : summary.tasteScore === '보통' ? 'Fair' : 'Check',
            cleanScore: summary.cleanScore === '좋음' ? 'Good' : summary.cleanScore === '정보 부족' ? 'Limited' : summary.cleanScore,
            menuText: summary.menuText === '리뷰 언급 없음' ? 'Not mentioned in reviews' : summary.menuText
        };
    }
    if (state.language === 'ja') {
        return {
            tasteScore: summary.tasteScore === '좋음' ? '良い' : summary.tasteScore === '보통' ? '普通' : '要確認',
            cleanScore: summary.cleanScore === '좋음' ? '良い' : summary.cleanScore === '정보 부족' ? '情報不足' : summary.cleanScore,
            menuText: summary.menuText === '리뷰 언급 없음' ? 'レビュー記載なし' : summary.menuText
        };
    }
    return summary;
}

function buildSummaryBlock(place) {
    const t = labels[state.language] || labels.en;
    const summary = summarizeReviewsLocalized(place.reviews, place.rating || 0);
    return `
        <div class="review-summary">
            <span>${t.taste}: ${summary.tasteScore}</span>
            <span>${t.clean}: ${summary.cleanScore}</span>
            <span>${t.menu}: ${summary.menuText}</span>
            <span class="summary-note">${t.summaryNote}</span>
        </div>
    `;
}

function buildCard(place) {
    const t = labels[state.language] || labels.en;
    const photo = place.photos && place.photos.length ? buildPhotoUrl(place.photos[0]) : '';
    const openNow = place.opening_hours && place.opening_hours.open_now;
    const rating = place.rating ? place.rating.toFixed(1) : '-';
    const reviews = place.user_ratings_total ? place.user_ratings_total : 0;
    const ratingPercent = rating !== '-' ? ratingToPercent(Number(rating)) : 0;
    const distance = place.distance ? (place.distance / 1609.34).toFixed(1) : null;
    const mapLink = place.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
    const sampleBadge = place.isSample ? `<span class="badge sample">${t.sampleBadge}</span>` : '';

    return `
        <article class="place-card">
            <div class="place-photo">
                ${photo ? `<img src="${photo}" alt="${place.name}">` : `<div class="photo-placeholder"></div>`}
            </div>
            <div class="place-info">
                <h4>${place.name}</h4>
                <div class="place-meta">
                    <span class="badge ${openNow ? 'open' : 'closed'}">${openNow ? t.openNow : t.closed}</span>
                    ${sampleBadge}
                    <span>${t.rating} ${rating} (${reviews} ${t.reviews})</span>
                    <div class="star-rating" aria-label="${rating} out of 5">
                        <span style="width: ${ratingPercent}%"></span>
                    </div>
                    ${distance ? `<span>${distance}${t.miles}</span>` : ''}
                </div>
                <div class="place-tags">${place.types ? place.types.slice(0, 3).map(type => `<span>${type.replace(/_/g, ' ')}</span>`).join('') : ''}</div>
                ${place.reviews ? buildSummaryBlock(place) : ''}
                ${place.isSample
                    ? `<span class="place-link sample-link" aria-disabled="true">${t.sampleLink}</span>`
                    : `<a class="place-link" href="${mapLink}" target="_blank" rel="noopener">${t.view}</a>`}
            </div>
        </article>
    `;
}

function buildLoadingCard(isDessert = false) {
    return `
        <article class="place-card ${isDessert ? 'dessert-card' : ''} loading">
            <div class="place-photo">
                <div class="skeleton skeleton-photo"></div>
            </div>
            <div class="place-info">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line short"></div>
            </div>
        </article>
    `;
}

function renderLoading(target, count, isDessert = false) {
    target.innerHTML = new Array(count).fill(0).map(() => buildLoadingCard(isDessert)).join('');
}

function renderList(target, places, sampleData = SAMPLE_PLACES) {
    if (!places.length && sampleData.length) {
        const t = labels[state.language] || labels.en;
        target.innerHTML = `
            <p class="sample-note">${t.sampleNote}</p>
            ${sampleData.map(buildCard).join('')}
        `;
        return;
    }
    if (!places.length) {
        const t = labels[state.language] || labels.en;
        target.innerHTML = `<p class="empty-state">${t.emptyState}</p>`;
        return;
    }
    target.innerHTML = places.map(buildCard).join('');
}

function renderDessertList(target, places, sampleData = SAMPLE_DESSERTS) {
    if (!places.length && sampleData.length) {
        const t = labels[state.language] || labels.en;
        target.innerHTML = `
            <p class="sample-note">${t.sampleNote}</p>
            ${sampleData.map(place => {
                const photo = place.photos && place.photos.length ? buildPhotoUrl(place.photos[0]) : '';
                const openNow = place.opening_hours && place.opening_hours.open_now;
                const rating = place.rating ? place.rating.toFixed(1) : '-';
                const reviews = place.user_ratings_total ? place.user_ratings_total : 0;
                const ratingPercent = rating !== '-' ? ratingToPercent(Number(rating)) : 0;
                const sampleBadge = place.isSample ? `<span class="badge sample">${t.sampleBadge}</span>` : '';

                return `
                    <article class="place-card dessert-card">
                        <div class="place-photo">
                            ${photo ? `<img src="${photo}" alt="${place.name}">` : `<div class="photo-placeholder"></div>`}
                        </div>
                        <div class="place-info">
                            <h4>${place.name}</h4>
                            <div class="place-meta">
                                <span class="badge ${openNow ? 'open' : 'closed'}">${openNow ? t.openNow : t.closed}</span>
                                ${sampleBadge}
                                <span>${t.rating} ${rating} (${reviews} ${t.reviews})</span>
                                <div class="star-rating" aria-label="${rating} out of 5">
                                    <span style="width: ${ratingPercent}%"></span>
                                </div>
                            </div>
                            <div class="place-tags">${place.types ? place.types.slice(0, 3).map(type => `<span>${type.replace(/_/g, ' ')}</span>`).join('') : ''}</div>
                            <span class="place-link sample-link" aria-disabled="true">${t.sampleLink}</span>
                        </div>
                    </article>
                `;
            }).join('')}
        `;
        return;
    }
    if (!places.length) {
        const t = labels[state.language] || labels.en;
        target.innerHTML = `<p class="empty-state">${t.emptyState}</p>`;
        return;
    }
    target.innerHTML = places.map(place => {
        const t = labels[state.language] || labels.en;
        const photos = place.photos ? place.photos.slice(0, 3).map(buildPhotoUrl) : [];
        const openNow = place.opening_hours && place.opening_hours.open_now;
        const rating = place.rating ? place.rating.toFixed(1) : '-';
        const reviews = place.user_ratings_total ? place.user_ratings_total : 0;
        const ratingPercent = rating !== '-' ? ratingToPercent(Number(rating)) : 0;
        const mapLink = place.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;

        return `
            <article class="place-card dessert-card">
                <div class="place-photo">
                    ${photos[0] ? `<img src="${photos[0]}" alt="${place.name}">` : `<div class="photo-placeholder"></div>`}
                </div>
                <div class="place-info">
                    <h4>${place.name}</h4>
                    <div class="place-meta">
                        <span class="badge ${openNow ? 'open' : 'closed'}">${openNow ? t.openNow : t.closed}</span>
                        <span>${t.rating} ${rating} (${reviews} ${t.reviews})</span>
                        <div class="star-rating" aria-label="${rating} out of 5">
                            <span style="width: ${ratingPercent}%"></span>
                        </div>
                    </div>
                    ${photos.length > 1 ? `
                        <div class="photo-strip">
                            ${photos.slice(1).map(url => `<img src="${url}" alt="${place.name} photo">`).join('')}
                        </div>
                    ` : ''}
                    <a class="place-link" href="${mapLink}" target="_blank" rel="noopener">${t.view}</a>
                </div>
            </article>
        `;
    }).join('');
}

function nearbySearch({ location, keyword, minRating, type }, callback) {
    const request = {
        location,
        radius: 2500,
        type,
        keyword,
        openNow: true
    };

    state.placesService.nearbySearch(request, (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
            callback([]);
            return;
        }

        const filtered = results
            .filter(place => place.rating && place.rating >= minRating)
            .slice(0, MAX_RESULTS);

        callback(filtered);
    });
}

function getPlaceDetails(place) {
    return new Promise(resolve => {
        state.placesService.getDetails({
            placeId: place.place_id,
            fields: [
                'name',
                'rating',
                'user_ratings_total',
                'opening_hours',
                'photos',
                'reviews',
                'types',
                'url',
                'place_id'
            ]
        }, (details, status) => {
            if (status !== google.maps.places.PlacesServiceStatus.OK || !details) {
                resolve(place);
                return;
            }
            resolve({ ...place, ...details });
        });
    });
}

async function hydratePlaces(places) {
    const details = await Promise.all(places.map(getPlaceDetails));
    return details;
}

async function runSearches(position) {
    const location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    initPlacesService();

    const mealTime = getMealTime();
    nearbySearch({ location, ...MEAL_CONFIG[mealTime], type: 'restaurant' }, async results => {
        const hydrated = await hydratePlaces(results);
        renderList(recommendList, hydrated);
    });

    nearbySearch({ location, keyword: 'restaurant', minRating: 4.0, type: 'restaurant' }, async results => {
        const hydrated = await hydratePlaces(results);
        renderList(openList, hydrated);
    });

    nearbySearch({ location, keyword: 'dessert cafe', minRating: 4.2, type: 'cafe' }, async results => {
        const trimmed = results.slice(0, DESSERT_RESULTS);
        const hydrated = await hydratePlaces(trimmed);
        renderDessertList(dessertList, hydrated);
    });
}

function handleLocationSuccess(position) {
    if (!window.google || !google.maps || !google.maps.places) {
        setStatus('error');
        return;
    }
    setStatus('loading');
    updateMealTitle();
    runSearches(position).finally(() => {
        setStatus('ready');
    });
}

function handleLocationError() {
    setStatus('denied');
}

function requestLocation() {
    if (!navigator.geolocation) {
        setStatus('error');
        return;
    }

    setStatus('loading');
    renderLoading(recommendList, LOADING_CARDS, false);
    renderLoading(openList, LOADING_CARDS, false);
    renderLoading(dessertList, Math.max(2, Math.floor(LOADING_CARDS / 2)), true);

    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
    });
}

locationBtn.addEventListener('click', requestLocation);
updateMealTitle();
setStatus('ready');
renderList(recommendList, []);
renderList(openList, []);
renderDessertList(dessertList, []);
renderQuiz();
if (quizRefresh) {
    quizRefresh.addEventListener('click', renderQuiz);
}
if (quizCard) {
    quizCard.addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.classList.contains('quiz-toggle')) return;
        const answer = quizCard.querySelector('.quiz-answer');
        if (!answer) return;
        const t = labels[state.language] || labels.en;
        const isHidden = answer.classList.toggle('is-hidden');
        target.textContent = isHidden ? t.quizShowAnswer : t.quizHideAnswer;
        target.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
    });
}

document.addEventListener('language-change', event => {
    state.language = event.detail.language;
    setStatus('ready');
    updateMealTitle();
    renderQuiz();
});
