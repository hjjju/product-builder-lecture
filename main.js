const MEAL_CONFIG = {
    breakfast: { keyword: 'breakfast cafe brunch', minRating: 4.2 },
    lunch: { keyword: 'lunch restaurant', minRating: 4.1 },
    dinner: { keyword: 'dinner restaurant', minRating: 4.1 }
};

const MAX_RESULTS = 6;

const locationBtn = document.getElementById('location-btn');
const locationStatus = document.getElementById('location-status');
const timeLabel = document.getElementById('time-label');

const lists = {
    breakfast: document.getElementById('breakfast-list'),
    lunch: document.getElementById('lunch-list'),
    dinner: document.getElementById('dinner-list')
};

const state = {
    language: localStorage.getItem('language') || 'en',
    placesService: null
};

const timeMessages = {
    en: {
        breakfast: 'It is breakfast time now',
        lunch: 'It is lunch time now',
        dinner: 'It is dinner time now'
    },
    ko: {
        breakfast: '지금은 아침 추천 시간이에요',
        lunch: '지금은 점심 추천 시간이에요',
        dinner: '지금은 저녁 추천 시간이에요'
    },
    ja: {
        breakfast: '今は朝ごはんの時間です',
        lunch: '今は昼ごはんの時間です',
        dinner: '今は夕ごはんの時間です'
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
        emptyState: 'No recommendations available yet.'
    },
    ko: {
        openNow: '영업 중',
        closed: '영업 종료',
        rating: '평점',
        reviews: '리뷰',
        view: '보기',
        miles: '마일',
        emptyState: '추천할 음식점이 없습니다.'
    },
    ja: {
        openNow: '営業中',
        closed: '営業時間外',
        rating: '評価',
        reviews: 'レビュー',
        view: '見る',
        miles: 'マイル',
        emptyState: 'おすすめのお店が見つかりませんでした。'
    }
};

function getText(map, key) {
    const t = map[state.language] || map.en;
    return t[key] || '';
}

function setStatus(key) {
    locationStatus.textContent = getText(statusMessages, key);
}

function updateTimeLabel() {
    const hour = new Date().getHours();
    const current = hour < 10 ? 'breakfast' : hour < 16 ? 'lunch' : 'dinner';
    timeLabel.textContent = getText(timeMessages, current);
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
    return photo.getUrl({ maxWidth: 480, maxHeight: 360 });
}

function buildCard(place) {
    const t = labels[state.language] || labels.en;
    const photo = place.photos && place.photos.length ? buildPhotoUrl(place.photos[0]) : '';
    const openNow = place.opening_hours && place.opening_hours.open_now;
    const rating = place.rating ? place.rating.toFixed(1) : '-';
    const reviews = place.user_ratings_total ? place.user_ratings_total : 0;
    const distance = place.distance ? (place.distance / 1609.34).toFixed(1) : null;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;

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
                    ${distance ? `<span>${distance}${t.miles}</span>` : ''}
                </div>
                <div class="place-tags">${place.types ? place.types.slice(0, 3).map(type => `<span>${type.replace(/_/g, ' ')}</span>`).join('') : ''}</div>
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

function nearbySearch({ location, keyword, minRating }, callback) {
    const request = {
        location,
        radius: 2500,
        type: 'restaurant',
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

function runSearches(position) {
    const location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    initPlacesService();

    nearbySearch({ location, ...MEAL_CONFIG.breakfast }, results => renderList(lists.breakfast, results));
    nearbySearch({ location, ...MEAL_CONFIG.lunch }, results => renderList(lists.lunch, results));
    nearbySearch({ location, ...MEAL_CONFIG.dinner }, results => renderList(lists.dinner, results));
}

function handleLocationSuccess(position) {
    if (!window.google || !google.maps || !google.maps.places) {
        setStatus('error');
        return;
    }
    setStatus('loading');
    updateTimeLabel();
    runSearches(position);
    setTimeout(() => {
        setStatus('ready');
    }, 800);
}

function handleLocationError() {
    setStatus('denied');
}

function requestLocation() {
    if (!navigator.geolocation) {
        setStatus('error');
        return;
    }

    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
    });
}

locationBtn.addEventListener('click', requestLocation);
updateTimeLabel();
setStatus('ready');

document.addEventListener('language-change', event => {
    state.language = event.detail.language;
    setStatus('ready');
    updateTimeLabel();
});
