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

	// Функция форматирования заказа для отправки
	function formatOrder() {
		let orderText = '🛍 *Новый заказ*\n\n';
		let totalSum = 0;

		for (const [id, count] of Object.entries(cart)) {
			if (count > 0) {
				const itemTotal = count * prices[id];
				totalSum += itemTotal;
				orderText += `📦 Товар ${id}\n`;
				orderText += `   Количество: ${count} шт.\n`;
				orderText += `   Цена: ${prices[id]} руб.\n`;
				orderText += `   Сумма: ${itemTotal} руб.\n\n`;
			}
		}

		orderText += `\n💰 *Итого: ${totalSum} руб.*`;

		if (tg?.initDataUnsafe?.user) {
			const user = tg.initDataUnsafe.user;
			orderText += `\n\n👤 *Заказчик:*\n`;
			orderText += `${user.first_name}`;
			if (user.last_name) orderText += ` ${user.last_name}`;
			if (user.username) orderText += `\n@${user.username}`;
		}

		return {
			formatted: orderText,
			totalSum: totalSum
		};
	}

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
		const orderButton = document.getElementById('order-button');
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

		// Показываем или скрываем кнопку заказа
		if (orderButton) {
			if (total > 0) {
				orderButton.style.display = 'block';
			} else {
				orderButton.style.display = 'none';
			}
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

	// Обработчик для кнопки "Заказ готов"
	const orderButton = document.getElementById('order-button');
	if (orderButton) {
		orderButton.addEventListener('click', () => {
			const order = formatOrder();
			if (order.totalSum > 0) {
				if (tg) {
					tg.sendData(JSON.stringify({
						type: 'order',
						payload: order.formatted
					}));
					console.log('Заказ отправлен в Telegram');
				} else {
					console.log('Заказ оформлен:', order.formatted);
					alert('Заказ оформлен! Менеджер свяжется с вами.');
				}
				
				// Очищаем корзину после отправки
				cart = {};
				updateCartCount();
				updateCart();
				
				// Закрываем корзину
				const cartElement = document.getElementById('cart');
				if (cartElement) {
					cartElement.classList.remove('active');
				}
			}
		});
	}

	// Инициализация корзины при загрузке
	updateCart();
});
