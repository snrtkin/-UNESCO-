(() => {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || '';
    const username = sessionStorage.getItem('adminUsername') || localStorage.getItem('adminUsername');

    if (!username) {
        window.location.replace('login.html');
        return;
    }

    document.getElementById('adminUsername').textContent = username ? `${username} 様` : '';

    function authHeaders(extra = {}) {
        return { Authorization: `Bearer ${token}`, ...extra };
    }

    function logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        sessionStorage.removeItem('adminUsername');
        window.location.replace('login.html');
    }

    document.getElementById('logoutBtn').addEventListener('click', logout);

    // If the token is invalid/expired, any authenticated call below will 401.
    // Small helper to handle that consistently.
    async function authFetch(path, options = {}) {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: { ...(options.headers || {}), ...authHeaders() },
        });
        if (res.status === 401) {
            logout();
            throw new Error('セッションが切れました。再度ログインしてください。');
        }
        return res;
    }

    // ── Tabs ──
    document.querySelectorAll('.admin-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach((t) => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('active'));
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
        });
    });

    const dateFmt = (iso) => {
        if (!iso) return '-';
        const d = new Date(iso);
        return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('ja-JP');
    };

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    async function updateApplicationStatus(type, id, status) {
        try {
            const res = await authFetch(`/api/${type}/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) throw new Error(data.message || '状態の更新に失敗しました。');
        } catch (err) {
            alert(`エラー: ${err.message}`);
        }
    }

    function statusActions(type, id, status) {
        const options = type === 'membership'
            ? [['pending', '審査中'], ['approved', '承認'], ['rejected', '却下']]
            : [['pending', '審査中'], ['active', '承認'], ['closed', '却下']];
        return `<select class="status-select" data-type="${type}" data-id="${id}">
            ${options.map(([value, label]) => `<option value="${value}" ${value === status ? 'selected' : ''}>${label}</option>`).join('')}
        </select>`;
    }

    function bindStatusActions(container, reload) {
        container.querySelectorAll('.status-select').forEach((select) => {
            select.addEventListener('change', async () => {
                select.disabled = true;
                await updateApplicationStatus(select.dataset.type, select.dataset.id, select.value);
                reload();
            });
        });
    }

    // ── Membership & volunteer submissions ──
    async function loadMembership() {
        const tbody = document.querySelector('#membershipTable tbody');
        const empty = document.getElementById('membershipEmpty');
        tbody.innerHTML = '';
        empty.textContent = '読み込み中...';
        try {
            const res = await authFetch('/api/membership');
            const data = await res.json();
            if (!data.ok) throw new Error(data.message || '取得に失敗しました。');
            empty.textContent = data.data.length ? '' : '申し込みはまだありません。';
            tbody.innerHTML = data.data.map((m) => `
                <tr>
                    <td>${dateFmt(m.createdAt)}</td>
                    <td>${escapeHtml(m.name)}</td>
                    <td>${escapeHtml(m.email)}</td>
                    <td>${escapeHtml(m.phone)}</td>
                    <td>${escapeHtml(m.tier)}</td>
                    <td>${escapeHtml(m.message)}</td>
                    <td><span class="status-pill status-${escapeHtml(m.status)}">${escapeHtml(m.status)}</span></td>
                    <td>${statusActions('membership', m._id, m.status)}</td>
                </tr>
            `).join('');
            bindStatusActions(tbody, loadMembership);
        } catch (err) {
            empty.textContent = `エラー: ${err.message}`;
        }
    }

    async function loadVolunteer() {
        const tbody = document.querySelector('#volunteerTable tbody');
        const empty = document.getElementById('volunteerEmpty');
        tbody.innerHTML = '';
        empty.textContent = '読み込み中...';
        try {
            const res = await authFetch('/api/volunteer');
            const data = await res.json();
            if (!data.ok) throw new Error(data.message || '取得に失敗しました。');
            empty.textContent = data.data.length ? '' : '申し込みはまだありません。';
            tbody.innerHTML = data.data.map((v) => `
                <tr>
                    <td>${dateFmt(v.createdAt)}</td>
                    <td>${escapeHtml(v.name)}</td>
                    <td>${escapeHtml(v.email)}</td>
                    <td>${escapeHtml(v.phone)}</td>
                    <td>${escapeHtml(v.activity)}</td>
                    <td>${escapeHtml(v.message)}</td>
                    <td><span class="status-pill status-${escapeHtml(v.status)}">${escapeHtml(v.status)}</span></td>
                    <td>${statusActions('volunteer', v._id, v.status)}</td>
                </tr>
            `).join('');
            bindStatusActions(tbody, loadVolunteer);
        } catch (err) {
            empty.textContent = `エラー: ${err.message}`;
        }
    }

    document.getElementById('refreshMembership').addEventListener('click', loadMembership);
    document.getElementById('refreshVolunteer').addEventListener('click', loadVolunteer);

    // ── Events ──
    async function loadEvents() {
        const grid = document.getElementById('eventAdminGrid');
        const empty = document.getElementById('eventsEmpty');
        grid.innerHTML = '';
        empty.textContent = '読み込み中...';
        try {
            const res = await fetch(`${API_BASE_URL}/api/events`);
            const data = await res.json();
            if (!data.ok) throw new Error(data.message || '取得に失敗しました。');
            empty.textContent = data.data.length ? '' : 'イベントはまだありません。';
            grid.innerHTML = data.data.map((ev) => `
                <article class="event-admin-card" data-id="${ev._id}">
                    ${ev.imageUrl ? `<img src="${API_BASE_URL}${ev.imageUrl}" alt="${escapeHtml(ev.title)}">` : '<div class="no-image">No image</div>'}
                    <div class="event-admin-body">
                        <h3>${escapeHtml(ev.title)}${ev.featured ? ' <span class="badge">★注目</span>' : ''}</h3>
                        <p class="event-admin-meta">${escapeHtml(ev.category)} ${ev.eventDate ? '・' + new Date(ev.eventDate).toLocaleDateString('ja-JP') : ''}</p>
                        <p class="event-admin-desc">${escapeHtml(ev.description)}</p>
                        <button type="button" class="btn-delete" data-id="${ev._id}">削除</button>
                    </div>
                </article>
            `).join('');

            grid.querySelectorAll('.btn-delete').forEach((btn) => {
                btn.addEventListener('click', () => deleteEvent(btn.dataset.id));
            });
        } catch (err) {
            empty.textContent = `エラー: ${err.message}`;
        }
    }

    async function deleteEvent(id) {
        if (!confirm('このイベントを削除しますか？')) return;
        try {
            const res = await authFetch(`/api/events/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.ok) throw new Error(data.message || '削除に失敗しました。');
            loadEvents();
        } catch (err) {
            alert(`エラー: ${err.message}`);
        }
    }

    document.getElementById('refreshEvents').addEventListener('click', loadEvents);

    const eventForm = document.getElementById('eventForm');
    const eventSubmitBtn = document.getElementById('eventSubmitBtn');
    const eventFormStatus = document.getElementById('eventFormStatus');

    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', eventForm.title.value.trim());
        formData.append('description', eventForm.description.value.trim());
        formData.append('category', eventForm.category.value);
        formData.append('featured', eventForm.featured.checked);
        if (eventForm.eventDate.value) formData.append('eventDate', eventForm.eventDate.value);
        if (eventForm.image.files[0]) formData.append('image', eventForm.image.files[0]);

        eventSubmitBtn.disabled = true;
        eventFormStatus.textContent = '送信中...';
        eventFormStatus.className = 'form-status';

        try {
            const res = await authFetch('/api/events', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                const errMsg = (data.errors && data.errors.join(' ')) || data.message || '追加に失敗しました。';
                throw new Error(errMsg);
            }
            eventFormStatus.textContent = 'イベントを追加しました。';
            eventFormStatus.className = 'form-status success';
            eventForm.reset();
            loadEvents();
        } catch (err) {
            eventFormStatus.textContent = `エラー: ${err.message}`;
            eventFormStatus.className = 'form-status error';
        } finally {
            eventSubmitBtn.disabled = false;
        }
    });

    // ── Initial load ──
    loadMembership();
    loadVolunteer();
    loadEvents();
})();
