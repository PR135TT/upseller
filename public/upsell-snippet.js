(async function () {
  try {
    // 1. Read the cart
    const cart = await fetch('/cart.js').then(res => res.json());

    // 2. Fetch upsell rules
    const shop = window.location.hostname;
    const rules = await fetch(`/api/rules?shop=${shop}`).then(res => res.json());

    // 3. Find a matching rule
    const match = rules.find(r =>
      cart.items.some(item => String(item.id) === r.trigger_product_id)
    );
    if (!match) return;

    // 4. Build and show the popup
    const popup = document.createElement('div');
    popup.innerHTML = `
      <div style="
        position: fixed; bottom: 20px; right: 20px;
        background: white; border: 1px solid #ddd; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 9999;
      ">
        <p style="margin:0 0 8px;">${match.message}</p>
        <button id="upsell-add" style="
          background: #4CAF50; color: white; border: none; padding: 8px 12px; cursor: pointer;
        ">
          Yes, add it!
        </button>
      </div>
    `;
    document.body.appendChild(popup);

    // 5. Handle button click
    document
      .getElementById('upsell-add')
      .addEventListener('click', async () => {
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: Number(match.upsell_product_id), quantity: 1 })
        });
        window.location.reload();
      });
  } catch (err) {
    console.error('Upsell snippet error:', err);
  }
})();
