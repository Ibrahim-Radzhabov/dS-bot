console.log('Скрипт начал выполнение');

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
	console.log('DOM загружен');
	
	// Инициализация Telegram WebApp (если доступен)
	let tg = window.Telegram?.WebApp;
	if (tg) {
		console.log('Telegram WebApp инициализирован');
		tg.expand();
		
		// Настройка главной кнопки Telegram
		tg.MainButton.textColor = '#FFFFFF';
		tg.MainButton.color = '#2cab37';
	} else {
		console.log('Запущено в обычном браузере');
	}

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
			console.log(`Обновлен счетчик для товара ${id}: ${value}`);
		} else {
			console.log(`Не найден счетчик для товара ${id}`);
		}
	}

	// Функция обновления общего количества товаров в корзине
	function updateCartCount() {
		const count = Object.values(cart).reduce((sum, current) => sum + current, 0);
		const cartCountElement = document.getElementById('cart-count');
		if (cartCountElement) {
			cartCountElement.textContent = count;
			console.log(`Обновлено общее количество товаров: ${count}`);
		}
	}

	// Функция обновления корзины
	function updateCart() {
		const cartItems = document.getElementById('cart-items');
		const cartTotalAmount = document.getElementById('cart-total-amount');
		let total = 0;
		
		if (!cartItems || !cartTotalAmount) {
			console.log('Не найдены элементы корзины');
			return;
		}
		
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
		console.log(`Обновлена сумма корзины: ${total} руб.`);

		// Обновляем кнопку Telegram, если доступна
		if (tg && total > 0) {
			tg.MainButton.text = `Оплатить ${total} руб.`;
			tg.MainButton.show();
		}
	}

	// Обработчик клика для всех кнопок (+ и -)
	document.addEventListener('click', function(e) {
		if (e.target.classList.contains('counter-btn')) {
			e.preventDefault();
			const id = e.target.dataset.id;
			const isPlus = e.target.classList.contains('plus');
			
			console.log(`Нажата кнопка ${isPlus ? 'плюс' : 'минус'} для товара ${id}`);
			
			if (!cart[id]) {
				cart[id] = 0;
			}
			
			if (isPlus) {
				cart[id]++;
			} else if (cart[id] > 0) {
				cart[id]--;
			}
			
			console.log(`${isPlus ? 'Увеличено' : 'Уменьшено'} количество товара ${id}: ${cart[id]}`);
			updateCounter(id, cart[id]);
			updateCartCount();
			updateCart();
		}
	});

	// Обработчик для иконки корзины
	const cartIcon = document.getElementById('cart-icon');
	if (cartIcon) {
		cartIcon.addEventListener('click', () => {
			const cartElement = document.getElementById('cart');
			if (cartElement) {
				cartElement.classList.toggle('active');
				console.log('Переключено состояние корзины');
			}
		});
	}

	// Обработчик для кнопок "В корзину"
	document.querySelectorAll('.btn').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const id = e.target.dataset.id;
			if (cart[id] && cart[id] > 0) {
				updateCart(); // Обновляем корзину и кнопку оплаты
			}
		});
	});

	// Обработчик для кнопки оплаты в Telegram
	if (tg) {
		Telegram.WebApp.onEvent('mainButtonClicked', function() {
	// Обработчик для кнопки оплаты
	Telegram.WebApp.onEvent('mainButtonClicked', function() {
		const data = JSON.stringify(cart);
		tg.sendData(data);
		console.log('Отправлены данные корзины:', data);
	});

	// Добавление в usercard данных из тг
	const usercard = document.getElementById("usercard");
	if (usercard && tg.initDataUnsafe && tg.initDataUnsafe.user) {
		const p = document.createElement("p");
		p.innerText = `${tg.initDataUnsafe.user.first_name} ${tg.initDataUnsafe.user.last_name}`;
		usercard.appendChild(p);
	}
});
