// ---- Nav scroll effect ----
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
}, { passive: true });

// ---- Floating label animation ----
document.querySelectorAll('.vform-input').forEach(input => {
      const field = input.closest('.vform-field');
      if (!field) return;
      input.addEventListener('focus', () => field.classList.add('is-focused'));
      input.addEventListener('blur', () => {
            field.classList.remove('is-focused');
            field.classList.toggle('is-filled', input.value.trim().length > 0);
      });
      if (input.value.trim().length > 0) field.classList.add('is-filled');
});

// ---- Form validation & submission ----
const form = document.getElementById('volunteer-form');
const status = document.getElementById('form-status');

function showError(fieldId, message) {
      const el = document.getElementById(fieldId + '-error');
      if (el) { el.textContent = message; }
      const input = document.getElementById(fieldId);
      if (input) { input.setAttribute('aria-invalid', 'true'); input.closest('.vform-field')?.classList.add('has-error'); }
}
function clearErrors() {
      document.querySelectorAll('.vform-error').forEach(e => e.textContent = '');
      document.querySelectorAll('.vform-field.has-error').forEach(f => { f.classList.remove('has-error'); });
      document.querySelectorAll('[aria-invalid]').forEach(i => i.removeAttribute('aria-invalid'));
      status.textContent = '';
      status.className = 'form-status';
}

form.addEventListener('submit', e => {
      e.preventDefault();
      clearErrors();

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const agree = document.getElementById('agree').checked;
      let valid = true;

      if (!fullName) { showError('fullName', 'お名前を入力してください。'); valid = false; }
      if (!email) { showError('email', 'メールアドレスを入力してください。'); valid = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('email', '正しいメールアドレスを入力してください。'); valid = false; }
      if (!agree) {
            const agreeErr = document.getElementById('agree-error');
            if (agreeErr) { agreeErr.textContent = '個人情報保護方針への同意が必要です。'; }
            valid = false;
      }

      if (!valid) return;

      const btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.querySelector('.btn-submit-text').textContent = '送信中...';

      // Simulate async submission
      setTimeout(() => {
            status.textContent = 'お申し込みありがとうございます。担当者より3営業日以内にご連絡いたします。';
            status.className = 'form-status is-success';
            form.reset();
            document.querySelectorAll('.vform-field').forEach(f => f.classList.remove('is-filled'));
            btn.disabled = false;
            btn.querySelector('.btn-submit-text').textContent = '申し込む';
            status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1200);
});

form.addEventListener('reset', () => {
      clearErrors();
      setTimeout(() => {
            document.querySelectorAll('.vform-field').forEach(f => f.classList.remove('is-filled'));
      }, 50);
});

// ---- Scroll reveal ----
const revealEls = document.querySelectorAll('.stat-item, .info-block, .vform-group, .vform-agree, .vform-actions');
const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
            if (entry.isIntersecting) {
                  entry.target.classList.add('is-visible');
                  observer.unobserve(entry.target);
            }
      });
}, { threshold: 0.1 });
revealEls.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
