document.addEventListener('DOMContentLoaded', () => {
    const buyBtns = document.querySelectorAll('.btn-tier-buy');
    const formContainer = document.getElementById('membershipFormContainer');
    const tierSelect = document.getElementById('tier');

    if (!formContainer || !tierSelect) {
        console.warn('Membership form container or select element not found.');
        return;
    }

    buyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Show the form container
            formContainer.classList.remove('hidden');

            // 2. Select the matching tier in the select dropdown
            const tierVal = btn.getAttribute('data-tier');
            if (tierVal) {
                tierSelect.value = tierVal;
            }

            // 3. Scroll smoothly to the form container
            setTimeout(() => {
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50); // slight delay to allow rendering/animation classes if any
        });
    });
});
