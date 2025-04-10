// Завантаження товарів із JSON
const loadProducts = async () => {
  try {
    const response = await fetch('/products.json');
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Помилка завантаження товарів:', error);
    return [];
  }
};

// Відображення товарів
const displayProducts = (products) => {
  const productGrid = document.getElementById('productGrid');
  const noProducts = document.getElementById('noProducts');
  productGrid.innerHTML = '';

  if (products.length === 0) {
    noProducts.style.display = 'block';
    return;
  }

  noProducts.style.display = 'none';

  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p class="price">${product.price} грн</p>
      <button class="add-to-cart" data-id="${product.id}">Додати в кошик</button>
    `;

    // Відкриття модального вікна при кліку на картку
    productCard.addEventListener('click', (e) => {
      if (!e.target.classList.contains('add-to-cart')) {
        openModal(product);
      }
    });

    productGrid.appendChild(productCard);
  });

  // Додавання товару в кошик
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); // Запобігаємо відкриттю модального вікна товару
      const productId = button.getAttribute('data-id');
      addToCart(productId);
    });
  });
};

// Фільтрація товарів
const filterProducts = (products) => {
  const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
  const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
  const categories = Array.from(document.querySelectorAll('.filter-category input:checked')).map(input => input.value);

  return products.filter(product => {
    const priceMatch = product.price >= minPrice && product.price <= maxPrice;
    const categoryMatch = categories.length === 0 || categories.includes(product.category);
    return priceMatch && categoryMatch;
  });
};

// Додавання товару в кошик
const addToCart = (productId) => {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(parseInt(productId)); // Перетворюємо productId у число
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
};

// Видалення товару з кошика
const removeFromCart = (productId) => {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const index = cart.indexOf(parseInt(productId));
  if (index !== -1) {
    cart.splice(index, 1); // Видаляємо перше входження товару
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    openCartModal(); // Оновлюємо кошик
  }
};

// Оновлення кількості товарів у кошику
const updateCartCount = () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  document.querySelector('.cart-count').textContent = cart.length;
  updateCartTotal();
};

// Оновлення суми в кошику
const updateCartTotal = async () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const products = await loadProducts();
  const total = cart.reduce((sum, productId) => {
    const product = products.find(p => p.id === productId);
    return sum + (product ? product.price : 0);
  }, 0);
  document.querySelector('.cart-total').textContent = `${total.toFixed(2)} грн`;
};

// Відкриття модального вікна товару
const openModal = (product) => {
  const modal = document.getElementById('productModal');
  document.getElementById('modalImage').src = product.image;
  document.getElementById('modalName').textContent = product.name;
  document.getElementById('modalDescription').textContent = product.description;
  document.getElementById('modalPrice').textContent = `${product.price} грн`;
  modal.style.display = 'flex';

  // Додавання в кошик із модального вікна
  document.querySelector('.add-to-cart-modal').onclick = () => {
    addToCart(product.id);
    modal.style.display = 'none';
  };
};

// Відкриття модального вікна кошика
const openCartModal = async () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const products = await loadProducts();
  const cartModal = document.getElementById('cartModal');
  const cartItems = document.getElementById('cartItems');
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Кошик порожній</p>';
    document.getElementById('cartTotal').textContent = 'Підсумок: 0.00 грн';
    cartModal.style.display = 'flex';
    return;
  }

  // Підрахунок кількості однакових товарів
  const cartSummary = {};
  cart.forEach(productId => {
    cartSummary[productId] = (cartSummary[productId] || 0) + 1;
  });

  // Відображення товарів у кошику
  let total = 0;
  for (const productId in cartSummary) {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      const quantity = cartSummary[productId];
      const itemTotal = product.price * quantity;
      total += itemTotal;

      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');
      cartItem.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="cart-item-details">
          <span>${product.name} (x${quantity})</span>
          <span>${itemTotal.toFixed(2)} грн</span>
        </div>
        <button class="remove-item" data-id="${productId}">Видалити</button>
      `;
      cartItems.appendChild(cartItem);
    }
  }

  // Додавання обробників для кнопок "Видалити"
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-id');
      removeFromCart(productId);
    });
  });

  // Відображення підсумкової суми
  document.getElementById('cartTotal').textContent = `Підсумок: ${total.toFixed(2)} грн`;
  cartModal.style.display = 'flex';
};

// Закриття модальних вікон
document.querySelectorAll('.close-modal, .close-cart-modal, .close-cart-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
    document.getElementById('cartModal').style.display = 'none';
  });
});

// Ініціалізація
document.addEventListener('DOMContentLoaded', async () => {
  const products = await loadProducts();
  displayProducts(products);
  updateCartCount();

  // Відкриття кошика при кліку
  document.getElementById('openCart').addEventListener('click', openCartModal);

  // Фільтрація при зміні фільтрів
  document.getElementById('minPrice').addEventListener('input', async () => {
    const filteredProducts = filterProducts(await loadProducts());
    displayProducts(filteredProducts);
  });

  document.getElementById('maxPrice').addEventListener('input', async () => {
    const filteredProducts = filterProducts(await loadProducts());
    displayProducts(filteredProducts);
  });

  document.querySelectorAll('.filter-category input').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
      const filteredProducts = filterProducts(await loadProducts());
      displayProducts(filteredProducts);
    });
  });
});