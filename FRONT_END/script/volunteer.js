document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('volunteerForm');
    if (!form) return;

    const statusEl = document.getElementById('volunteerFormStatus');
    const submitBtn = document.getElementById('volunteerSubmitBtn');

    function setStatus(message, type) {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.className = `form-status${type ? ` ${type}` : ''}`;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        setStatus('送信中...', '');
        if (submitBtn) submitBtn.disabled = true;

        const payload = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            address: form.address.value.trim(),
            activity: form.activity.value,
            projectName: form.projectName.value.trim(),
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/volunteer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                const errMsg = (data.errors && data.errors.join(' ')) || data.message || '送信に失敗しました。';
                throw new Error(errMsg);
            }
            setStatus('お申し込みありがとうございます。担当者より3営業日以内にご連絡いたします。', 'success');
            form.reset();
        } catch (err) {
            setStatus(`エラー: ${err.message}`, 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});
