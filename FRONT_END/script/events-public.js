// Fetches admin-added events and renders them on the public events page and homepage news section.
(async function () {
    const grid = document.getElementById('eventGrid');
    const featuredSection = document.getElementById('featuredEvent');
    const newsGrid = document.getElementById('newsGrid');

    if (!grid && !newsGrid) return;
    if (typeof API_BASE_URL === 'undefined') return;

    function formatDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('ja-JP');
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    function categoryLabel(cat) {
        const labels = { event: 'イベント運営', education: '教育・出前講座', pr: '広報・SNS', other: 'その他' };
        return labels[cat] || cat || '';
    }

    const memberToken = localStorage.getItem('memberToken') || sessionStorage.getItem('memberToken') || '';
    const registrationStatuses = new Map();

    async function loadRegistrationStatuses() {
        if (!grid || !memberToken) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/member/dashboard`, {
                headers: { Authorization: `Bearer ${memberToken}` },
            });
            if (response.status === 401) {
                localStorage.removeItem('memberToken');
                sessionStorage.removeItem('memberToken');
                return;
            }
            const result = await response.json();
            if (!response.ok || !result.ok) throw new Error(result.message || 'イベント申し込み状況を取得できませんでした。');
            (result.data.eventHistory || []).forEach((record) => {
                registrationStatuses.set(String(record.event), record.attendanceStatus);
            });
        } catch (err) {
            console.error('Failed to load event registration status:', err);
        }
    }

    function addRegistrationAction(container, eventId) {
        const currentStatus = registrationStatuses.get(String(eventId));
        const button = document.createElement('button');
        const message = document.createElement('p');
        const isRegistered = Boolean(currentStatus);

        button.type = 'button';
        button.className = 'event-register-button';
        button.dataset.eventId = eventId;
        button.textContent = currentStatus === 'attended'
            ? '参加済み'
            : isRegistered
                ? '申込済み'
                : memberToken
                    ? 'イベントに申し込む'
                    : '会員ログインして申し込む';
        button.disabled = isRegistered;
        message.className = 'event-registration-status';
        message.setAttribute('role', 'status');
        message.textContent = currentStatus === 'attended'
            ? '出席が確認されています。'
            : isRegistered
                ? '申し込み済みです。'
                : '';
        container.append(button, message);
        return button;
    }

    async function submitRegistration(button) {
        if (!memberToken) {
            window.location.href = 'login.html?returnTo=events.html';
            return;
        }

        const message = button.nextElementSibling;
        button.disabled = true;
        button.textContent = '申し込み中...';
        message.textContent = '';
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${encodeURIComponent(button.dataset.eventId)}/registrations`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${memberToken}` },
            });
            const result = await response.json();
            if (response.status === 401) {
                localStorage.removeItem('memberToken');
                sessionStorage.removeItem('memberToken');
                window.location.href = 'login.html?returnTo=events.html';
                return;
            }
            if (!response.ok || !result.ok) {
                throw new Error(result.message || (result.errors || []).join(' ') || '申し込みに失敗しました。');
            }

            registrationStatuses.set(button.dataset.eventId, result.data.attendanceStatus);
            button.textContent = result.data.attendanceStatus === 'attended' ? '参加済み' : '申込済み';
            message.textContent = result.data.attendanceStatus === 'attended'
                ? '出席が確認されています。'
                : '申し込みが完了しました。';
        } catch (err) {
            message.textContent = err.message;
            button.textContent = '再度申し込む';
            button.disabled = false;
        }
    }

    try {
        await loadRegistrationStatuses();
        const res = await fetch(`${API_BASE_URL}/api/events`);
        const data = await res.json();
        if (!data.ok || !Array.isArray(data.data) || !data.data.length) return;

        const events = data.data;

        if (grid) {
            const featured = events.find((ev) => ev.featured) || events[0];
            const rest = events.filter((ev) => ev !== featured);

            if (featuredSection && featured) {
                const img = document.getElementById('featuredImage');
                const heading = document.getElementById('featuredHeading');
                const desc = document.getElementById('featuredDesc');
                const content = featuredSection.querySelector('.featured-content');
                if (img && featured.imageUrl) img.src = `${API_BASE_URL}${featured.imageUrl}`;
                if (heading) heading.textContent = featured.title;
                if (desc) desc.textContent = featured.description || '';
                if (content) addRegistrationAction(content, featured._id);
            }

            const cardsHtml = rest.map((ev) => `
                <article class="event-card active">
                    <div class="event-thumb">
                        ${ev.imageUrl ? `<img src="${API_BASE_URL}${ev.imageUrl}" alt="${escapeHtml(ev.title)}">` : ''}
                    </div>
                    <h3>${escapeHtml(ev.title)}</h3>
                    <p class="event-meta">${escapeHtml(categoryLabel(ev.category))}${ev.eventDate ? ' ・ ' + formatDate(ev.eventDate) : ''}</p>
                    <p>${escapeHtml(ev.description)}</p>
                    <div class="event-registration" data-event-id="${escapeHtml(ev._id)}"></div>
                </article>
            `).join('');
            grid.insertAdjacentHTML('afterbegin', cardsHtml);
            grid.querySelectorAll('.event-registration').forEach((container) => {
                addRegistrationAction(container, container.dataset.eventId);
            });
            grid.addEventListener('click', (event) => {
                const button = event.target.closest('.event-register-button');
                if (button && grid.contains(button)) submitRegistration(button);
            });

            if (featuredSection) {
                featuredSection.addEventListener('click', (event) => {
                    const button = event.target.closest('.event-register-button');
                    if (button && featuredSection.contains(button)) submitRegistration(button);
                });
            }
        }

        if (newsGrid) {
            const newsHtml = events.slice(0, 3).map((ev) => `
                <a href="pages/events.html" class="news-card">
                    <div class="news-date">${ev.eventDate ? formatDate(ev.eventDate) : 'NEW'}</div>
                    <div class="news-title">${escapeHtml(ev.title)}</div>
                    <div class="news-arrow">→</div>
                </a>
            `).join('');
            newsGrid.insertAdjacentHTML('afterbegin', newsHtml);
        }
    } catch (err) {
        console.error('Failed to load events:', err);
    }
})();
