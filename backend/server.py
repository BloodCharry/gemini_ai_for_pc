from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
import os

from google import genai

from google.genai.types import (
    GenerationConfig,
    HttpOptions,
    Part,
    Tool,
    ToolCodeExecution,
    GenerateContentConfig,
    Modality
)

import base64
import tempfile
import speech_recognition as sr
from gtts import gTTS
import io
import uuid
from PIL import Image
import requests
from io import BytesIO
import uvicorn

load_dotenv()

app = FastAPI()

# ⚠️ В продакшене стоит ограничить allow_origins конкретными доменами
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальные настройки генерации
GENERATION_CONFIG = GenerateContentConfig(
    temperature=0.6,
    top_p=0.8,
    top_k=20,
)

client = genai.Client(http_options=HttpOptions(api_version="v1"))


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


# генерация текста
@app.post("/api/text")
async def text_endpoint(payload: dict):
    """
    Принимает JSON с ключом "messages" — список сообщений (диалог).
    Передаёт их в модель Gemini и возвращает сгенерированный текст.
    Пример payload: {"messages": ["Привет!", "Как дела?"]}
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=payload["messages"],
        config=GENERATION_CONFIG
    )
    return {"text": response.text}


# Анализ изображения + текстовый вопрос
@app.post("/api/vision")
async def vision_endpoint(
        file: UploadFile = File(...),
        question: str = Form(...)
):
    """
    Принимает изображение и вопрос.
    Gemini анализирует изображение и отвечает на вопрос.
    Поддерживает: JPG, PNG и другие форматы.
    """
    image_data = await file.read()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            question,
            Part(
                mime_type=file.content_type,
                data=image_data
            )
        ],
        config=GenerateContentConfig(response_modalities=[Modality.IMAGE])
    )

    return {"result": response.text}


# генерация изображения
@app.post("/api/image")
async def image_endpoint(payload: dict):
    """
    Генерирует изображение по текстовому описанию (prompt).
    Gemini может возвращать изображение как inline-данные.
    Возвращаем изображение в формате base64 для передачи по JSON.
    """
    response = client.models.generate_content(
        model="gemini-2.0-flash-preview-image-generation",
        contents=[payload["prompt"]],
        config=GenerateContentConfig(
            response_modalities=[Modality.TEXT, Modality.IMAGE],
            config=GENERATION_CONFIG
        )
    )

    for candidate in response.candidates:
        for part in candidate.content.parts:
            if part.inline_data:
                return {"image": base64.b64encode(part.inline_data.data).decode("utf-8")}
    return {"error": "Изображение не сгенерировано"}


# Выполнение кода
@app.post("/api/execute-code")
async def execute_code(payload: dict):
    """
    Выполняет код через Gemini API.
    Принимает JSON с ключом "prompt" - текстовое описание задачи.
    Возвращает сгенерированный код и результат выполнения.
    Пример payload: {"prompt": "Рассчитай 20-й номер Фибоначчи"}
    """
    code_execution_tool = Tool(code_execution=ToolCodeExecution())

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=payload["prompt"],
        config=GenerateContentConfig(
            tools=[code_execution_tool],
            temperature=0,
            config=GENERATION_CONFIG
        )
    )

    result = {
        "code": response.executable_code,
        "execution_result": response.code_execution_result
    }

    return result


# Преобразование речи в текст
@app.post("/api/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):
    """
    Принимает аудиофайл (например, .wav или .mp3), конвертирует в текст.
    Использует Google Speech Recognition (через библиотеку speech_recognition).
    Временный файл удаляется после обработки.
    """
    recognizer = sr.Recognizer()

    # Сохраняем аудио во временный файл
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        audio_data = await audio.read()
        tmp.write(audio_data)
        tmp_path = tmp.name

    # Распознаем речь
    with sr.AudioFile(tmp_path) as source:
        audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data, language="ru-RU")
            return {"text": text}
        except sr.UnknownValueError:
            return {"error": "Речь не распознана"}
        finally:
            os.unlink(tmp_path)


# Преобразование текста в речь
@app.post("/api/text-to-speech")
async def text_to_speech(payload: dict):
    """
    Принимает текст, генерирует аудио на русском языке с помощью Google TTS.
    Возвращает аудио в формате base64 (MP3).
    """
    text = payload.get("text", "")
    if not text:
        return {"error": "Текст не предоставлен"}

    # Генерируем аудио
    tts = gTTS(text=text, lang='ru')
    audio_bytes = io.BytesIO()
    tts.write_to_fp(audio_bytes)
    audio_bytes.seek(0)

    return {"audio": base64.b64encode(audio_bytes.read()).decode("utf-8")}


# Загрузка скриншота
@app.post("/api/upload-screenshot")
async def upload_screenshot(file: UploadFile = File(...)):
    """
    Принимает изображение (скриншот), сохраняет в папку 'screenshots' с уникальным именем.
    Возвращает публичный URL для доступа к файлу.
    Предполагается, что сервер раздаёт статику (например, через Nginx или FastAPI StaticFiles).
    """
    image_data = await file.read()

    # Сохраняем изображение
    filename = f"screenshots/{uuid.uuid4()}.png"
    with open(filename, "wb") as f:
        f.write(image_data)

    return {"url": f"http://{os.getenv('SERVER_URL')}/{filename}"}


if __name__ == "__main__":
    """
    Точка входа для локального запуска приложения.
    Запускает Uvicorn (ASGI-сервер) на всех интерфейсах (0.0.0.0) и порту 8000.
    В продакшене лучше использовать Gunicorn + Uvicorn или Docker.
    """

    uvicorn.run(app, host="0.0.0.0", port=8000)
