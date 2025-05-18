(async function () {
  try {
    // 1. Read the cart
    const cart = await fetch('/cart.js').then(r => r.json());

    // 2. Fetch upsell rules for this shop
    const shop = window.location.hostname;
    const rules = await fetch(`/api/rules?shop=${shop}`).then(r => r.json());

    // 3. Find the first matching rule
    const match = rules.find(r =>
      cart.items.some(item => String(item.id) === r.trigger_product_id)
    );
    if (!match) return;

    // 4. Create the upsell popup
    const popup = document.createElement('div');
    popup.style = 'position:fixed; bottom:20px; right:20px; background:white; border:1px solid #ddd; padding:16px; z-index:9999; box-shadow:0 2px 8px rgba(0,0,0,0.1);';
    popup.innerHTML = `
      <p style="margin:0 0 8px;">${match.message}</p>
      <button id="upsell-add" style="background:#4caf50; color:white; border:none; padding:8px 12px; cursor:pointer;">
        Add Upsell
      </button>
    `;
    document.body.appendChild(popup);

    // 5. Handle the click to add the upsell item
    document.getElementById('upsell-add').addEventListener('click', async () => {
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
