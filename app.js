var tg = window.Telegram.WebApp;

// Расширяем на весь экран.
tg.expand();

// Настраиваем MainButton (для оплаты заказа, если потребуется)
tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2cab37';

// Таблица цен товаров (идентификаторы должны соответствовать data-атрибутам в HTML)
let prices = {
    1: 500,
    2: 1050,
    3: 1240,
    4: 1190,
    5: 1100,
    6: 1150
};

// Глобальный объект для хранения выбранных товаров (orderItems)
// Ключ – ID товара, значение – объект с id, наименованием, количеством и ценой.
let orderItems = {};

/*
  Функция updateItem:
  Высчитывает новое количество товара на основе delta (1 или -1)
  Обновляет data-атрибуты, отображение счетчика (элемент с классом .js-item-counter)
  Обновляет глобальный объект orderItems и подсвечивает товар при наличии выбранного количества.
*/
function updateItem(itemEl, delta) {
    let price = parseFloat(itemEl.dataset.itemPrice);
    let count = parseInt(itemEl.dataset.itemCount) || 0;
    count += delta;
    if (count < 0) count = 0;
    itemEl.dataset.itemCount = count;
    updateItemDisplay(itemEl, count);
    
    let itemId = itemEl.dataset.itemId;
    let itemName = itemEl.dataset.itemName || ('Product ' + itemId);
    if (count > 0) {
        orderItems[itemId] = { id: parseInt(itemId), name: itemName, quantity: count, price: price };
        itemEl.classList.add('selected');
    } else {
        delete orderItems[itemId];
        itemEl.classList.remove('selected');
    }
    updateBasketButton();
}

// Функция для обновления отображения количества товара (элемент с классом .js-item-counter)
function updateItemDisplay(itemEl, count) {
    let counterEl = itemEl.querySelector('.js-item-counter');
    if (counterEl) {
        counterEl.textContent = count > 0 ? count : 0;
    }
    // Дополнительно можно добавить анимацию (например, вызов RLottie.playOnce, если используется)
}

// Обработчики для кликов на кнопках увеличения и уменьшения
function handleIncrClick(e) {
    e.preventDefault();
    let itemEl = e.target.closest('.js-item');
    updateItem(itemEl, 1);
}

function handleDecrClick(e) {
    e.preventDefault();
    let itemEl = e.target.closest('.js-item');
    updateItem(itemEl, -1);
}

/*
  Функция updateBasketButton:
  Отображает или скрывает кнопку «Корзина» (элемент с id="basketButton")
  и обновляет её текст с информацией о суммарном кол-ве выбранных товаров.
*/
function updateBasketButton() {
    let basketButton = document.getElementById("basketButton");
    if (!basketButton) return;
    let totalItems = 0;
    for (let key in orderItems) {
        totalItems += orderItems[key].quantity;
    }
    if (totalItems > 0) {
        basketButton.style.display = "block";
        basketButton.textContent = "Корзина (" + totalItems + ")";
    } else {
        basketButton.style.display = "none";
    }
}

/*
  Функция showBasket:
  Выводит содержимое корзины (например, в виде окна alert или можно реализовать модальное окно).
*/
function showBasket() {
    let summary = "Ваш заказ:\n";
    for (let key in orderItems) {
        let item = orderItems[key];
        summary += item.name + ": " + item.quantity + " шт. (" + item.price + "₽ за шт.)\n";
    }
    alert(summary);
}

/*
  Функция processOrder
  Рассчитывает общую сумму заказа, задаёт текст кнопки оплаты (MainButton)
  и при клике отправляет данные заказа через Telegram WebApp API.
*/
function processOrder() {
    let items = Object.values(orderItems);
    if (items.length === 0) {
        alert("Ваша корзина пуста.");
        return;
    }
    let totalAmount = 0;
    items.forEach(item => {
        totalAmount += item.price * item.quantity;
    });
    
    tg.MainButton.setText("Оплатить (" + totalAmount.toString() + "₽)");
    tg.MainButton.show();
    tg.MainButton.onClick(function () {
        tg.sendData(JSON.stringify(items));
    });
}

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", function () {
    // Добавление данных пользователя в блок usercard (если такой существует)
    let usercard = document.getElementById("usercard");
    if (usercard && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        let p = document.createElement("p");
        p.innerText = tg.initDataUnsafe.user.first_name + " " + tg.initDataUnsafe.user.last_name;
        usercard.appendChild(p);
    }
    
    // Привязка обработчиков для кнопок увеличения / уменьшения
    let incrButtons = document.querySelectorAll('.js-item-incr-btn');
    let decrButtons = document.querySelectorAll('.js-item-decr-btn');
    incrButtons.forEach(function (btn) {
        btn.addEventListener('click', handleIncrClick);
    });
    decrButtons.forEach(function (btn) {
        btn.addEventListener('click', handleDecrClick);
    });
    
    // Привязка обработчика для кнопки "Корзина"
    let basketButton = document.getElementById("basketButton");
    if (basketButton) {
        basketButton.addEventListener("click", showBasket);
    }
    
    // Если требуется, привяжите кнопку оформления заказа (например, с id="orderButton")
    let orderButton = document.getElementById("orderButton");
    if (orderButton) {
        orderButton.addEventListener("click", processOrder);
    }
});
