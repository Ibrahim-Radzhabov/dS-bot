var tg = window.Telegram.WebApp;

// Расширяем на весь экран.
tg.expand();

// Кнопка просмотра заказа (реализуется тг - не сайтом).
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

let cart = [];

// Функция для добавления товара в корзину
function addToOrder(productId) {
    const quantity = document.getElementById('quantity' + productId).value;
    if (quantity > 0) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity = parseInt(quantity);
        } else {
            cart.push({ id: productId, quantity: parseInt(quantity) });
        }
        alert("Товар добавлен в корзину");
    }
}

// Функция для обработки заказа
function processOrder(items) {
    let totalAmount = 0;
    items.forEach(item => {
        totalAmount += prices[item.id] * item.quantity;
    });

    if (tg.MainButton.isVisible) {
        tg.MainButton.hide();
    }
    tg.MainButton.setText("Перейти к оплате (" + totalAmount.toString() + "₽)");
    tg.MainButton.show();

    // Отправка данных в тг.
    Telegram.WebApp.onEvent("mainButtonClicked", function(){
        tg.sendData(JSON.stringify(items));
    });
}

// Функция для оформления заказа
function submitOrder() {
    if (cart.length === 0) {
        alert("Ваша корзина пуста");
        return;
    }
    processOrder(cart);
    cart = []; // Очищаем корзину после отправки
}

// Добавление в usercard данных из тг.
let usercard = document.getElementById("usercard");

let p = document.createElement("p");

p.innerText = `${tg.initDataUnsafe.user.first_name}
${tg.initDataUnsafe.user.last_name}`;

usercard.appendChild(p);
