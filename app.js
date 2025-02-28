var tg = window.Telegram.WebApp;

// Расширяем на весь экран.
tg.expand();

// Настройки кнопки для заказа
tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2cab37';

let prices = {
    1: 500,
    2: 1050,
    3: 1240,
    4: 1190,
    5: 1100,
    6: 1150
};

// Глобальный объект для хранения данных заказа
let orderData = {};

// Обновление визуального отображения количества товара
function updateItemDisplay(itemEl, count) {
    let counterEl = itemEl.querySelector('.js-item-counter');
    if (counterEl) {
        counterEl.textContent = count > 0 ? count : 0;
    }
}

// Получение текущего количества товара из data-атрибута
function getItemCount(itemEl) {
    return parseInt(itemEl.dataset.itemCount) || 0;
}

// Установка нового количества товара, обновление UI и данных заказа
function setItemCount(itemEl, count) {
    itemEl.dataset.itemCount = count;
    updateItemDisplay(itemEl, count);
    updateGlobalOrder(itemEl, count);
    updateTotalPrice();
}

// Обновление глобального объекта заказа (если количество > 0 – добавляем, иначе удаляем)
function updateGlobalOrder(itemEl, count) {
    let itemId = itemEl.dataset.itemId;
    if (count > 0) {
        orderData[itemId] = {
            id: parseInt(itemId),
            quantity: count,
            price: prices[itemId]
        };
    } else {
        delete orderData[itemId];
    }
}

// Обновление общей стоимости заказа на кнопке
function updateTotalPrice() {
    let total = 0;
    for (let key in orderData) {
        if (orderData.hasOwnProperty(key)) {
            total += orderData[key].price * orderData[key].quantity;
        }
    }
    tg.MainButton.setText("Перейти к оплате (" + total.toString() + "₽)");
}

// Обработчик клика для увеличения количества товара
function handleIncr(e) {
    e.preventDefault();
    let itemEl = e.target.closest('.js-item');
    let count = getItemCount(itemEl);
    count += 1;
    setItemCount(itemEl, count);
}

// Обработчик клика для уменьшения количества товара
function handleDecr(e) {
    e.preventDefault();
    let itemEl = e.target.closest('.js-item');
    let count = getItemCount(itemEl);
    count = Math.max(0, count - 1);
    setItemCount(itemEl, count);
}

// Функция для обработки заказа и его отправки через Telegram WebApp
function processOrder() {
    let items = Object.values(orderData);
    if (items.length === 0) {
        alert("Ваша корзина пуста.");
        return;
    }
    updateTotalPrice();
    if (!tg.MainButton.isVisible) {
        tg.MainButton.show();
    }
    // При клике по основной кнопке отправляем данные заказа
    tg.MainButton.onClick(function() {
        tg.sendData(JSON.stringify(items));
    });
}

// Инициализация обработчиков событий после загрузки DOM
document.addEventListener("DOMContentLoaded", function() {
    // Привязываем события к кнопкам увеличения и уменьшения
    let incrButtons = document.querySelectorAll('.js-item-incr-btn');
    let decrButtons = document.querySelectorAll('.js-item-decr-btn');

    incrButtons.forEach(function(btn) {
        btn.addEventListener('click', handleIncr);
    });
    decrButtons.forEach(function(btn) {
        btn.addEventListener('click', handleDecr);
    });

    // Если нужно, можно сразу обновить сумму заказа
    updateTotalPrice();

    // Добавление данных пользователя в блок usercard (если такой существует)
    let usercard = document.getElementById("usercard");
    if(usercard && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        let p = document.createElement("p");
        p.innerText = `${tg.initDataUnsafe.user.first_name} ${tg.initDataUnsafe.user.last_name}`;
        usercard.appendChild(p);
    }
});

// Пример: если на странице есть кнопка для оформления заказа с id="orderButton"
document.getElementById("orderButton")?.addEventListener("click", function(e){
    e.preventDefault();
    processOrder();
});
