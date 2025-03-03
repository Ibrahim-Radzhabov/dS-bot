let tg = window.Telegram.WebApp;

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
	// Расширяем на весь экран
	tg.expand();

	// Кнопка просмотра заказа
	tg.MainButton.textColor = '#FFFFFF';
	tg.MainButton.color = '#2cab37';

	// Инициализация корзины
	let cart = {};
	const prices = {
		1: 1000,
		2: 1200,
		3: 1500,
		4: 800,
		5: 2000,
		6: 1800
	};

	// Функция обновления счетчика
	function updateCounter(id, value) {
		const counter = document.getElementById(`counter${id}`);
		if (counter) {
			counter.textContent = value;
		}
	}

	// Функция обновления общего количества товаров в корзине
	function updateCartCount() {
		const count = Object.values(cart).reduce((sum, current) => sum + current, 0);
		const cartCountElement = document.getElementById('cart-count');
		if (cartCountElement) {
			cartCountElement.textContent = count;
		}
	}

	// Функция обновления корзины
	function updateCart() {
		const cartItems = document.getElementById('cart-items');
		const cartTotalAmount = document.getElementById('cart-total-amount');
		let total = 0;
		
		if (!cartItems || !cartTotalAmount) return;
		
		cartItems.innerHTML = '';
		
		for (const [id, count] of Object.entries(cart)) {
			if (count > 0) {
				const itemTotal = count * prices[id];
				total += itemTotal;
				
				const cartItem = document.createElement('div');
				cartItem.className = 'cart-item';
				cartItem.innerHTML = `
					<span>Товар ${id}</span>
					<span>${count} шт. × ${prices[id]} руб. = ${itemTotal} руб.</span>
				`;
				cartItems.appendChild(cartItem);
			}
		}
		
		cartTotalAmount.textContent = total;
	}

	// Обработчики для кнопок счетчика
	document.querySelectorAll('.counter-btn').forEach(button => {
		button.addEventListener('click', (e) => {
			e.preventDefault(); // Предотвращаем стандартное поведение кнопки
			const id = e.target.dataset.id;
			const isPlus = e.target.classList.contains('plus');
			
			// Инициализируем значение в корзине, если его нет
			if (!cart[id]) {
				cart[id] = 0;
			}
			
			// Изменяем значение
			if (isPlus) {
				cart[id]++;
			} else if (cart[id] > 0) {
				cart[id]--;
			}
			
			console.log(`Товар ${id}: ${cart[id]}`); // Отладочный вывод
			
			updateCounter(id, cart[id]);
			updateCartCount();
			updateCart();
		});
	});

	// Обработчик для иконки корзины
	const cartIcon = document.getElementById('cart-icon');
	if (cartIcon) {
		cartIcon.addEventListener('click', () => {
			const cartElement = document.getElementById('cart');
			if (cartElement) {
				cartElement.classList.toggle('active');
			}
		});
	}

	// Обработчики для кнопок "В корзину"
	document.querySelectorAll('.btn').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const id = e.target.dataset.id;
			if (cart[id] && cart[id] > 0) {
				tg.MainButton.text = `Оплатить ${document.getElementById('cart-total-amount').textContent} руб.`;
				tg.MainButton.show();
			}
		});
	});

	// Обработчик для кнопки оплаты
	Telegram.WebApp.onEvent('mainButtonClicked', function() {
		const data = JSON.stringify(cart);
		tg.sendData(data);
	});

	// Добавление в usercard данных из тг
	const usercard = document.getElementById("usercard");
	if (usercard && tg.initDataUnsafe.user) {
		const p = document.createElement("p");
		p.innerText = `${tg.initDataUnsafe.user.first_name} ${tg.initDataUnsafe.user.last_name}`;
		usercard.appendChild(p);
	}
});
