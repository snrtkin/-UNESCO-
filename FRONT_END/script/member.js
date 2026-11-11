(() => {
    const token = localStorage.getItem('memberToken') || sessionStorage.getItem('memberToken') || '';
    if (!token) {
        window.location.replace('login.html');
        return;
    }

    const nameEl = document.getElementById('memberName');
    const tierEl = document.getElementById('memberTier');
    const statusEl = document.getElementById('memberStatus');
    const paymentStatusEl = document.getElementById('memberPaymentStatus');
    const countryEl = document.getElementById('memberCountry');
    const sinceEl = document.getElementById('memberSince');
    const messageEl = document.getElementById('memberMessage');
    const historyEl = document.getElementById('volunteerHistory');
    const eventMessageEl = document.getElementById('memberEventMessage');
    const eventHistoryEl = document.getElementById('eventHistory');

    const tierLabels = {
        regular: '正会員',
        corporate: '法人会員',
        supporting: '賛助会員',
        student: '学生会員',
    };
    const activityLabels = {
        event: 'イベント運営',
        education: '教育・出前講座',
        pr: '広報・SNS',
        other: 'その他',
    };
    const statusLabels = {
        pending: '審査中',
        contacted: '連絡済み',
        active: '承認済み',
        completed: '参加済み',
        closed: '終了',
    };
    const eventStatusLabels = {
        registered: '申込済み',
        attended: '参加済み',
    };

    document.getElementById('memberLogout').addEventListener('click', () => {
        localStorage.removeItem('memberToken');
        sessionStorage.removeItem('memberToken');
        window.location.replace('login.html');
    });

    function formatDate(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '日付未登録' : date.toLocaleDateString('ja-JP');
    }

    function renderHistory(records) {
        historyEl.replaceChildren();

        if (!records.length) {
            messageEl.textContent = 'ボランティア参加履歴はまだありません。活動に申し込むと、こちらに表示されます。';
            return;
        }

        messageEl.textContent = '';
        records.forEach((record) => {
            const item = document.createElement('li');
            const details = document.createElement('div');
            const activity = document.createElement('div');
            const date = document.createElement('div');
            const status = document.createElement('span');

            activity.className = 'history-activity';
            activity.textContent = record.projectName || activityLabels[record.activity] || 'ボランティア活動';
            date.className = 'history-meta';
            date.textContent = formatDate(record.createdAt);
            status.className = 'history-status';
            status.textContent = statusLabels[record.status] || '状況確認中';
            details.append(activity, date);
            item.append(details, status);
            historyEl.append(item);
        });
    }

    function renderEventHistory(records) {
        eventHistoryEl.replaceChildren();

        if (!records.length) {
            eventMessageEl.textContent = 'イベントへの申し込みはまだありません。イベントページからお申し込みいただけます。';
            return;
        }

        eventMessageEl.textContent = '';
        records.forEach((record) => {
            const item = document.createElement('li');
            const details = document.createElement('div');
            const title = document.createElement('div');
            const date = document.createElement('div');
            const status = document.createElement('span');

            title.className = 'history-activity';
            title.textContent = record.eventTitle || 'イベント';
            date.className = 'history-meta';
            date.textContent = `開催日: ${formatDate(record.eventDate)} ・ 申込日: ${formatDate(record.createdAt)}`;
            status.className = 'history-status';
            status.textContent = eventStatusLabels[record.attendanceStatus] || '状況確認中';
            details.append(title, date);
            item.append(details, status);
            eventHistoryEl.append(item);
        });
    }

    async function loadDashboard() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/member/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();
            if (response.status === 401) {
                localStorage.removeItem('memberToken');
                sessionStorage.removeItem('memberToken');
                window.location.replace('login.html');
                return;
            }
            if (!response.ok || !result.ok) {
                throw new Error(result.message || '会員情報を取得できませんでした。');
            }

            const { member, volunteerHistory, eventHistory } = result.data;
            nameEl.textContent = member.name;
            const isMembershipActive = member.status === 'approved' && member.paymentStatus === 'paid';
            tierEl.textContent = isMembershipActive ? tierLabels[member.tier] || '会員' : '承認後に表示';
            statusEl.textContent = member.status === 'rejected'
                ? '申請却下'
                : isMembershipActive
                    ? '会員登録完了'
                    : member.paymentStatus === 'paid'
                        ? '事務局の承認待ち'
                        : 'お支払い待ち';
            paymentStatusEl.textContent = member.paymentStatus === 'paid' ? '確認済み' : 'お支払い待ち';
            countryEl.textContent = member.country || '-';
            sinceEl.textContent = formatDate(member.memberSince);
            renderHistory(volunteerHistory);
            renderEventHistory(eventHistory || []);
        } catch (err) {
            messageEl.textContent = err.message;
            messageEl.classList.add('member-error');
            eventMessageEl.textContent = 'イベント履歴を取得できませんでした。';
            eventMessageEl.classList.add('member-error');
        }
    }

    loadDashboard();
})();
