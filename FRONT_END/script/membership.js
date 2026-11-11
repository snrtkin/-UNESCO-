document.addEventListener('DOMContentLoaded', () => {
    const buyBtns = document.querySelectorAll('.btn-tier-buy');
    buyBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const tier = btn.getAttribute('data-tier');
            const memberToken = localStorage.getItem('memberToken') || sessionStorage.getItem('memberToken');
            if (memberToken) {
                window.location.href = 'member.html';
                return;
            }
            const params = new URLSearchParams({ join: '1' });
            if (['regular', 'supporting', 'student'].includes(tier)) params.set('tier', tier);
            window.location.href = `login.html?${params}`;
        });
    });

    // ── Real submission to the backend API ──
    const form = document.getElementById('membershipForm');
    if (!form) return;

    const statusEl = document.getElementById('membershipFormStatus');
    const submitBtn = document.getElementById('membershipSubmitBtn');

    function setStatus(message, type) {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.className = `form-status${type ? ` ${type}` : ''}`;
    }

    // membership.html uses a longer form (member-type/fullname/organization/postal/address).
    function collectPayload() {
        const byId = (id) => document.getElementById(id);
        if (byId('member-type')) {
            const organization = byId('organization')?.value.trim();
            const postal = byId('postal')?.value.trim();
            const address = byId('address')?.value.trim();
            const country = byId('country')?.value.trim();
            return {
                name: byId('fullname')?.value.trim(),
                email: byId('email')?.value.trim(),
                phone: byId('phone')?.value.trim(),
                tier: byId('member-type')?.value,
                password: byId('account-password')?.value,
                organization: organization || '',
                country: country || '',
                postal: postal || '',
                address: address || '',
            };
        }
        return {
            name: byId('name')?.value.trim(),
            email: byId('email')?.value.trim(),
            phone: byId('phone')?.value.trim(),
            tier: byId('tier')?.value,
            message: byId('message')?.value.trim() || '',
        };
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('account-password')?.value;
        const passwordConfirm = document.getElementById('account-password-confirm')?.value;
        if (password !== passwordConfirm) {
            setStatus('パスワードが一致しません。', 'error');
            return;
        }
        setStatus('送信中...', '');
        if (submitBtn) submitBtn.disabled = true;

        try {
            const payload = collectPayload();
            const res = await fetch(`${API_BASE_URL}/api/membership`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                const errMsg = (data.errors && data.errors.join(' ')) || data.message || '送信に失敗しました。';
                throw new Error(errMsg);
            }
            const message = data.emailSent
                ? 'お申し込みありがとうございます。会費のお支払い案内をメールでご確認ください。'
                : 'お申し込みは保存されましたが、メールを送信できませんでした。事務局にお問い合わせください。';
            setStatus(message, data.emailSent ? 'success' : 'error');
            form.reset();
        } catch (err) {
            setStatus(`エラー: ${err.message}`, 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});
