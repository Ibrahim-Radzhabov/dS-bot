# Телеграм бот DarkSide

## Краткое описание
Заказ любимой еды из шаурмечной DarkSide (концепт).

## Начало работы

1. Запустите бота, нажмите на кнопку "Сделать заказ". Откроется веб-приложение с ассортиментом блюд.
2. Выберите интересующее вас блюдо. Нажмите на кнопку "Перейти к оплате", рядом будет указана стоимость заказа.
3. В Телеграм вам придет запрос на оплату. Нажмите "ОПЛАТИТЬ", выберите удобный способ доставки и оплаты.
4. В случае успешной оплаты вы получите уведомление о том, что заказ принят в обработку.
5. Готово!

<details>
  <summary><b>Скриншоты</b></summary>
  
  ![image](https://github.com/everysoftware/darkside-tg-bot/assets/22497421/16f9f9d8-716c-4ae6-bed5-0db7baccdc83)  
  ![image](https://github.com/everysoftware/darkside-tg-bot/assets/22497421/1736c1a6-397f-4571-b14a-a5a57d842661)
</details>

## Стек технологий

Бот: Python3, Aiogram3, Telegram Web App, SQLite3  
Веб-приложение: HTML, CSS, JS  

## Сборка

1. Выгрузите [веб-приложение]((https://github.com/everysoftware/everysoftware.github.io/tree/main/darkside)) на сервер. 
2. Установите зависимости ```pip install -r requirements.txt```
3. Настройте конфигурацию в файле ```src/config.py```
4. Запустите бота: ```python -m src```

Для проверки бота можете использовать веб-приложение: ```https://everysoftware.github.io/darkside/```.
   
