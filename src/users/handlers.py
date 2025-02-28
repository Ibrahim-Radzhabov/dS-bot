from aiogram import F, Router
from aiogram.types import (
    Message,
    LabeledPrice,
    ContentType,
    PreCheckoutQuery,
    ShippingQuery,
)

from src.config import conf
from src.db.dependencies import db
from src.payments import constants as constants

router = Router()

# Инициализация корзины для каждого пользователя
user_cart = {}

@router.message(F.content_type == ContentType.WEB_APP_DATA)
async def add_to_cart(msg: Message) -> None:
    user_id = msg.from_user.id
    prod_id = msg.web_app_data.data

    if not prod_id.isnumeric():
        await msg.answer(constants.WRONG_PRODUCT_INFO_MSG)
        return

    prod = await db.get_product(int(prod_id))
    if not prod:
        await msg.answer(constants.WRONG_PRODUCT_INFO_MSG)
        return

    if user_id not in user_cart:
        user_cart[user_id] = []

    user_cart[user_id].append(prod)
    await msg.answer(f"Товар '{prod['name']}' добавлен в корзину. Ваша корзина: {[item['name'] for item in user_cart[user_id]]}")

@router.message(commands=['checkout'])
async def checkout(msg: Message) -> None:
    user_id = msg.from_user.id

    if user_id not in user_cart or not user_cart[user_id]:
        await msg.answer("Ваша корзина пуста.")
        return

    prices = [LabeledPrice(label=item['name'], amount=item['amount'] * 100) for item in user_cart[user_id]]

    await msg.answer_invoice(
        title="Оплата заказа",
        description="Ваш заказ",
        provider_token=conf.pay_token,
        currency="rub",
        need_email=True,
        need_phone_number=True,
        prices=prices,
        start_parameter="example",
        payload="some_invoice",
        is_flexible=True,
    )

    # Очищаем корзину после оформления заказа
    user_cart[user_id] = []

def check_validity(query: ShippingQuery) -> bool:
    return (
        query.shipping_address.country_code == "RU"
        and query.shipping_address.city.lower() in constants.VALID_CITIES
    )

@router.shipping_query(lambda query: True)
async def shipping_process(query: ShippingQuery) -> None:
    if not check_validity(query):
        await query.answer(
            ok=False,
            error_message=constants.NO_DELIVERY_MSG.format(query.shipping_address.city),
        )
        return

    await query.answer(
        ok=True,
        shipping_options=constants.SHIPPING_OPTIONS,
    )

@router.pre_checkout_query(lambda query: True)
async def pre_checkout_process(pre_checkout: PreCheckoutQuery) -> None:
    await pre_checkout.answer(ok=True)

@router.message(F.content_type == ContentType.SUCCESSFUL_PAYMENT)
async def successful_payment(msg: Message) -> None:
    await msg.answer(constants.ORDER_ACCEPTED_MSG)
