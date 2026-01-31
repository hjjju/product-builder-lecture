(() => {
    const body = document.body;
    if (!body || body.dataset.ads !== 'on') {
        return;
    }

    const content = document.getElementById('publisher-content');
    const minWords = Number(body.dataset.adsMinWords || 250);
    const text = content ? content.textContent.trim() : '';
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

    if (wordCount < minWords) {
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2131439565248509';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
})();
