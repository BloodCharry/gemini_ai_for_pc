from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from google import genai
from google.genai.types import (
    HttpOptions,
    GenerateContentConfig,
    Modality,
    Part,
    Tool,
    ToolCodeExecution,
)
from io import BytesIO
from PIL import Image
import base64

load_dotenv()
client = genai.Client(http_options=HttpOptions(api_version="v1"))

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])


# текстовые запросы
@app.post("/api/text/")
async def text_endpoint(payload: dict):
    resp = client.models.generate_content(
        model="gemini-2.5-flash", contents=payload["question"]
    )
    return {"answer": resp.text}


# генерация изображения
@app.post("/api/image/")
async def image_endpoint(payload: dict):
    resp = client.models.generate_content(
        model="gemini-2.0-flash-preview-image-generation",
        contents=payload["question"],
        config=GenerateContentConfig(response_modalities=[Modality.IMAGE]),
    )
    data = resp.candidates[0].content.parts[0].inline_data.data
    b64 = base64.b64encode(data).decode("utf-8")
    return {"image_base64": b64}


# распознавание изображений
@app.post("/api/recognize/")
async def recognize_endpoint(payload: dict):
    parts = [
        payload["question"],
        Part.from_uri(
            file_uri=payload["image_uri"], mime_type="image/jpeg"
        ),
    ]
    resp = client.models.generate_content(
        model="gemini-2.5-flash", contents=parts
    )
    return {"result": resp.text}


# выполнение кода
@app.post("/api/execute/")
async def exec_endpoint(payload: dict):
    tool = Tool(code_execution=ToolCodeExecution())
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=payload["question"],
        config=GenerateContentConfig(tools=[tool], temperature=0),
    )
    return {
        "code": resp.executable_code,
        "output": resp.code_execution_result,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
