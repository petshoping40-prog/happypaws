import asyncio
import logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import ReplyKeyboardBuilder, InlineKeyboardBuilder

# --- КОНФИГУРАЦИЯ ---
# Вставь сюда токен от @BotFather
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"

# ID администратора (узнай через бота @userinfobot или отправив /id своему боту)
# Можно добавить несколько ID в список: [123456789, 987654321]
ADMIN_IDS = [123456789] 

# --- ИМИТАЦИЯ БАЗЫ ДАННЫХ ---
# В реальном проекте используй SQLite или PostgreSQL
users_db = {}  # {user_id: {"username": "...", "status": "active"}}
questions_queue = []  # Очередь вопросов для админа

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Инициализация бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# --- КЛАВИАТУРЫ ---

def get_user_menu():
    builder = ReplyKeyboardBuilder()
    builder.add(KeyboardButton(text="📝 Задать вопрос"))
    builder.add(KeyboardButton(text="📦 Статус доставки"))
    builder.add(KeyboardButton(text="🔥 Акции и новости"))
    return builder.as_markup(resize_keyboard=True)

def get_admin_menu():
    builder = ReplyKeyboardBuilder()
    builder.add(KeyboardButton(text="📬 Новые вопросы"))
    builder.add(KeyboardButton(text="📢 Сделать рассылку"))
    return builder.as_markup(resize_keyboard=True)

# --- ХЕНДЛЕРЫ ПОЛЬЗОВАТЕЛЯ ---

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    user_id = message.from_user.id
    username = message.from_user.username or message.from_user.first_name
    
    users_db[user_id] = {"username": username, "status": "active"}
    
    if user_id in ADMIN_IDS:
        await message.answer(f"Привет, Админ! 👋\nВыберите действие:", reply_markup=get_admin_menu())
    else:
        await message.answer(
            f"Привет, {username}! 🐾\nДобро пожаловать в наш Зоомагазин!\n"
            f"Здесь вы можете задать вопрос, узнать статус доставки или посмотреть акции.",
            reply_markup=get_user_menu()
        )

@dp.message(F.text == "📝 Задать вопрос")
async def ask_question(message: types.Message):
    await message.answer("Напишите ваш вопрос ниже, и наш специалист ответит вам лично:")
    # Можно установить состояние машины состояний (FSM), но для простоты будем ловить следующий текст отдельно

@dp.message(F.text == "📦 Статус доставки")
async def check_delivery(message: types.Message):
    # Здесь должна быть логика запроса к реальной базе заказов
    await message.answer(
        "Чтобы проверить статус доставки, напишите номер вашего заказа (например: #12345).\n"
        "(Это демо-режим, поэтому просто напишите любой номер для примера)."
    )

@dp.message(F.text == "🔥 Акции и новости")
async def show_promo(message: types.Message):
    await message.answer(
        "🔥 **Акция недели!**\n"
        "Скидка 20% на все корма для кошек до конца месяца!\n"
        "Используйте промокод: MEOW20"
    )

# Обработка текста от пользователя (вопросы или номер заказа)
@dp.message(~F.text.startswith("/"))
async def handle_user_text(message: types.Message):
    user_id = message.from_user.id
    
    # Если это ответ на вопрос о статусе заказа (простая эмуляция)
    if message.text.startswith("#"):
        await message.answer(f"Заказ {message.text} находится в пути! 🚚 Ожидайте курьера завтра.")
        return

    # Если это обычный вопрос админу
    if user_id not in ADMIN_IDS:
        # Сохраняем вопрос в очередь
        question_data = {
            "user_id": user_id,
            "username": message.from_user.first_name,
            "text": message.text,
            "message_id": message.message_id
        }
        questions_queue.append(question_data)
        
        await message.answer("✅ Ваш вопрос принят! Ожидайте ответа от оператора.")
        
        # Уведомляем админов
        for admin_id in ADMIN_IDS:
            try:
                kb = InlineKeyboardBuilder()
                kb.button(text="Ответить пользователю", callback_data=f"reply_{user_id}")
                await bot.send_message(
                    admin_id,
                    f"❓ **Новый вопрос от @{message.from_user.username or message.from_user.first_name}**:\n\n"
                    f"{message.text}\n\n"
                    f"ID пользователя: <code>{user_id}</code>\n"
                    f"<i>(Нажмите кнопку ниже или просто ответьте сообщением (Reply) на это сообщение)</i>",
                    parse_mode="HTML",
                    reply_markup=kb.as_markup()
                )
            except Exception as e:
                logging.error(f"Не удалось отправить уведомление админу {admin_id}: {e}")

# --- ХЕНДЛЕРЫ АДМИНА ---

@dp.message(F.text == "📬 Новые вопросы")
async def show_questions(message: types.Message):
    if message.from_user.id not in ADMIN_IDS:
        return
    
    if not questions_queue:
        await message.answer("Нет новых вопросов в очереди. ✅")
        return
    
    await message.answer(f"В очереди {len(questions_queue)} вопросов. Они уже были отправлены вам выше по одному.")

@dp.message(F.text == "📢 Сделать рассылку")
async def start_broadcast(message: types.Message):
    if message.from_user.id not in ADMIN_IDS:
        return
    await message.answer(
        "Отправьте текст (или фото/видео) для рассылки всем пользователям.\n"
        "Для отмены напишите /cancel"
    )
    # В реальном боте здесь нужно переключать машину состояний (FSM) на режим рассылки

# Обработка ответа админа (через Reply)
@dp.message(lambda msg: msg.reply_to_message and msg.from_user.id in ADMIN_IDS)
async def admin_reply_handler(message: types.Message):
    original_msg = message.reply_to_message
    
    # Пытаемся извлечь ID пользователя из текста сообщения админа или из сохраненных данных
    # В упрощенном варианте мы искали ID в тексте уведомления, которое бот прислал админу
    # Формат уведомления: "... ID пользователя: <code>{user_id}</code>"
    
    target_user_id = None
    
    # Парсим ID из текста оригинального уведомления (костыль для простоты без БД)
    if "ID пользователя:" in original_msg.text:
        try:
            parts = original_msg.text.split("<code>")
            if len(parts) > 1:
                target_user_id = int(parts[1].split("</code>")[0])
        except ValueError:
            pass

    if target_user_id:
        try:
            # Пересылаем ответ пользователю
            await message.copy_to(target_user_id)
            await message.answer("✅ Ответ отправлен пользователю.")
            
            # Удаляем вопрос из очереди (если найдем)
            global questions_queue
            questions_queue = [q for q in questions_queue if q["user_id"] != target_user_id]
            
        except Exception as e:
            await message.answer(f"❌ Ошибка отправки: {e}\nВозможно, пользователь заблокировал бота.")
    else:
        # Если это не ответ на уведомление о вопросе, игнорируем или обрабатываем как чат
        pass

# Запуск процесса поллинга
async def main():
    print("Бот запущен...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот остановлен")
