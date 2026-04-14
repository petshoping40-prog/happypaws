import os
import asyncio
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import Message
from openai import AsyncOpenAI

# --- КОНФИГУРАЦИЯ ---
# Замените на ваши ключи или используйте переменные окружения
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "ВАШ_ТЕЛЕГРАМ_ТОКЕН")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "ВАШ_OPENAI_API_KEY")

# Инициализация клиентов
bot = Bot(token=TELEGRAM_TOKEN)
dp = Dispatcher()
client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# Промпт для формирования отчета ИТ-аудита
SYSTEM_PROMPT = """
Ты — профессиональный ИТ-аудитор и специалист технической поддержки.
Твоя задача: проанализировать описание проблемы и/или изображение, предоставленное пользователем, 
и сформировать структурированный, профессиональный отчет об инциденте для передачи разработчикам или аудиторам.

Формат ответа должен быть строго следующим:

📋 **ОТЧЕТ ОБ ИНЦИДЕНТЕ (ИТ-АУДИТ)**

1. **Краткое резюме:** (Одно предложение, суть проблемы)
2. **Категория:** (Например: ПО, Оборудование, Сеть, Безопасность, Доступ)
3. **Уровень критичности:** (Низкий / Средний / Высокий / Критический)
4. **Детальное описание:** (Профессиональное переформулирование жалобы пользователя, техническим языком)
5. **Анализ визуальных данных (если есть фото):** (Что видно на скриншоте/фото: коды ошибок, состояние оборудования, сообщения в логах)
6. **Предполагаемая причина:** (Гипотеза на основе данных)
7. **Рекомендуемые действия:** (Пошаговый план для решения или дальнейшего расследования)

Если данных недостаточно для точного диагноза, укажи, какую дополнительную информацию необходимо запросить у пользователя.
Отвечай на русском языке.
"""

async def analyze_content(text: str, image_data: bytes = None) -> str:
    """Отправляет данные в OpenAI для анализа"""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    
    user_content = []
    
    if text:
        user_content.append({"type": "text", "text": f"Описание проблемы от пользователя: {text}"})
    
    if image_data:
        # Кодируем изображение в base64 для отправки в API
        import base64
        base64_image = base64.b64encode(image_data).decode('utf-8')
        user_content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
        })
    
    if not user_content:
        return "❌ Ошибка: Не получено ни текста, ни изображения для анализа."

    messages.append({"role": "user", "content": user_content})

    try:
        response = await client.chat.completions.create(
            model="gpt-4o", # Или gpt-4-turbo, в зависимости от доступа
            messages=messages,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ Ошибка при анализе через ИИ: {str(e)}. Проверьте API ключ и баланс."

@dp.message(Command("start"))
async def cmd_start(message: Message):
    await message.answer(
        "👋 Привет! Я бот-ассистент для ИТ-аудита.\n\n"
        "📸 Пришлите мне фото проблемы (скриншот ошибки, фото оборудования) и краткое описание.\n"
        "📝 Или просто напишите текст проблемы.\n"
        "Я сформирую профессиональный отчет для передачи специалистам."
    )

@dp.message(F.photo | F.text)
async def handle_input(message: Message):
    text = message.text or ""
    image_data = None
    
    # Если есть фото, берем последнее (наибольшее качество)
    if message.photo:
        photo = message.photo[-1]
        file = await bot.get_file(photo.file_id)
        image_data = await bot.download_file(file.file_path)
        
        if not text and message.caption:
            text = message.caption

    if not text and not image_data:
        await message.answer("Пожалуйста, отправьте фото или опишите проблему текстом.")
        return

    status_msg = await message.answer("⏳ Анализирую данные и формирую отчет...")

    report = await analyze_content(text, image_data)

    await status_msg.delete()
    await message.answer(
        report,
        parse_mode="Markdown"
    )

async def main():
    print("Бот ИТ-аудита запущен...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот остановлен.")
