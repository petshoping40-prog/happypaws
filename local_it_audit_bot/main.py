import os
import asyncio
import aiohttp
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message

# ================= КОНФИГУРАЦИЯ =================
# Токен бота от @BotFather
BOT_TOKEN = "ВАШ_ТОКЕН_БОТА"

# Адрес локального Ollama API (по умолчанию)
OLLAMA_API_URL = "http://localhost:11434/api/generate"

# Модель для использования (должна быть установлена в Ollama)
# Рекомендуемые модели: llava, llava-llama3, bakllava, moondream
MODEL_NAME = "llava"

# Промпт для формирования отчета ИТ-аудита
SYSTEM_PROMPT = """
Ты профессиональный ИТ-аудитор и системный администратор. 
Твоя задача - проанализировать описание проблемы и/или изображение, 
и составить структурированный профессиональный отчет для ИТ-отдела.

Формат ответа должен быть строго следующим:

📋 ОТЧЕТ ПО ИНЦИДЕНТУ
=====================
🔹 Категория: [Тип проблемы: Оборудование/ПО/Сеть/Безопасность]
🔹 Критичность: [Низкая/Средняя/Высокая/Критическая]
🔹 Описание проблемы: [Четкое техническое описание]
🔹 Наблюдаемые симптомы: [Что именно не работает]
🔹 Предполагаемая причина: [Возможные причины на основе анализа]
🔹 Шаги для воспроизведения: [Если применимо]
🔹 Рекомендации: [Конкретные шаги по устранению]
🔹 Необходимые ресурсы: [Что потребуется для решения]
=====================

Отвечай кратко, профессионально, без лишних слов. Используй техническую терминологию.
"""

# ================= ИНИЦИАЛИЗАЦИЯ =================
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Сессия для HTTP запросов к Ollama
session = None

async def get_ollama_session():
    global session
    if session is None or session.closed:
        session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=300))
    return session

async def send_to_ollama(text_prompt, image_base64=None):
    """Отправляет запрос к локальной Ollama модели"""
    
    # Формируем промпт
    if image_base64:
        prompt = f"{SYSTEM_PROMPT}\n\nПользователь предоставил изображение и текст:\n{text_prompt}"
        # Для мультимодальных моделей передаем изображение
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "images": [image_base64],
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9
            }
        }
    else:
        prompt = f"{SYSTEM_PROMPT}\n\nПользователь сообщил:\n{text_prompt}"
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9
            }
        }
    
    try:
        sess = await get_ollama_session()
        async with sess.post(OLLAMA_API_URL, json=payload) as response:
            if response.status == 200:
                data = await response.json()
                return data.get("response", "Ошибка: нет ответа от модели")
            else:
                return f"Ошибка API: {response.status}"
    except Exception as e:
        return f"Ошибка подключения к Ollama: {str(e)}. Убедитесь, что Ollama запущен и модель '{MODEL_NAME}' установлена."

# ================= ОБРАБОТЧИКИ =================

@dp.message(Command("start"))
async def cmd_start(message: Message):
    await message.answer(
        "👋 Привет! Я бот для формирования отчетов ИТ-аудита.\n\n"
        "📸 Отправьте мне фото проблемы (скриншот ошибки, фото оборудования) "
        "и опишите её текстом, или просто отправьте текстовое описание.\n\n"
        "Я сформирую профессиональный отчет для ИТ-отдела."
    )

@dp.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "📖 Инструкция:\n"
        "1. Отправьте фото проблемы (скриншот, фото устройства)\n"
        "2. Добавьте текстовое описание (что случилось, когда началось)\n"
        "3. Или просто напишите текстовое описание проблемы\n\n"
        "Я обработаю информацию и выдам структурированный отчет.\n\n"
        "Команды:\n"
        "/start - Запуск бота\n"
        "/help - Эта инструкция\n"
        "/model - Показать текущую модель"
    )

@dp.message(Command("model"))
async def cmd_model(message: Message):
    await message.answer(f"Текущая модель: {MODEL_NAME}\nAPI: {OLLAMA_API_URL}")

@dp.message()
async def handle_message(message: Message):
    # Проверяем есть ли фото
    image_base64 = None
    
    if message.photo:
        # Берем фото наилучшего качества
        photo = message.photo[-1]
        
        # Скачиваем фото
        file = await bot.get_file(photo.file_id)
        file_bytes = await bot.download_file(file.file_path)
        
        # Конвертируем в base64
        import base64
        image_base64 = base64.b64encode(file_bytes.read()).decode('utf-8')
        
        text = message.caption if message.caption else "Проанализируй это изображение проблемы."
    elif message.text:
        text = message.text
    else:
        return  # Игнорируем другие типы сообщений
    
    # Отправляем статус обработки
    status_msg = await message.answer("⏳ Анализирую проблему... Это может занять 30-60 секунд.")
    
    # Получаем ответ от Ollama
    report = await send_to_ollama(text, image_base64)
    
    # Удаляем статус и отправляем отчет
    try:
        await bot.delete_message(message.chat.id, status_msg.message_id)
    except:
        pass
    
    await message.answer(report)

# ================= ЗАПУСК =================

async def main():
    print(f"🤖 Бот запущен с моделью: {MODEL_NAME}")
    print(f"📡 Ollama API: {OLLAMA_API_URL}")
    print("Ожидаю сообщения...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    finally:
        if session and not session.closed:
            asyncio.run(session.close())
