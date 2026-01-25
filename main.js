const MEAL_CONFIG = {
    breakfast: { keyword: 'breakfast cafe brunch', minRating: 4.2 },
    lunch: { keyword: 'lunch restaurant', minRating: 4.1 },
    dinner: { keyword: 'dinner restaurant', minRating: 4.1 }
};

const MAX_RESULTS = 6;
const DESSERT_RESULTS = 4;

const locationBtn = document.getElementById('location-btn');
const locationStatus = document.getElementById('location-status');
const mealTitle = document.getElementById('meal-title');
const recommendList = document.getElementById('recommend-list');
const openList = document.getElementById('open-list');
const dessertList = document.getElementById('dessert-list');

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
        taste: '味',
        clean: '清潔さ',
        menu: '人気メニュー',
        summaryNote: 'レビュー推定'
    }
};

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

    return `
        <article class="place-card">
            <div class="place-photo">
                ${photo ? `<img src="${photo}" alt="${place.name}">` : `<div class="photo-placeholder"></div>`}
            </div>
            <div class="place-info">
                <h4>${place.name}</h4>
                <div class="place-meta">
                    <span class="badge ${openNow ? 'open' : 'closed'}">${openNow ? t.openNow : t.closed}</span>
                    <span>${t.rating} ${rating} (${reviews} ${t.reviews})</span>
                    <div class="star-rating" aria-label="${rating} out of 5">
                        <span style="width: ${ratingPercent}%"></span>
                    </div>
                    ${distance ? `<span>${distance}${t.miles}</span>` : ''}
                </div>
                <div class="place-tags">${place.types ? place.types.slice(0, 3).map(type => `<span>${type.replace(/_/g, ' ')}</span>`).join('') : ''}</div>
                ${place.reviews ? buildSummaryBlock(place) : ''}
                <a class="place-link" href="${mapLink}" target="_blank" rel="noopener">${t.view}</a>
            </div>
        </article>
    `;
}

function renderList(target, places) {
    if (!places.length) {
        const t = labels[state.language] || labels.en;
        target.innerHTML = `<p class="empty-state">${t.emptyState}</p>`;
        return;
    }
    target.innerHTML = places.map(buildCard).join('');
}

function renderDessertList(target, places) {
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

    recommendList.innerHTML = '';
    openList.innerHTML = '';
    dessertList.innerHTML = '';

    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
    });
}

locationBtn.addEventListener('click', requestLocation);
updateMealTitle();
setStatus('ready');

document.addEventListener('language-change', event => {
    state.language = event.detail.language;
    setStatus('ready');
    updateMealTitle();
});
