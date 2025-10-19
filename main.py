from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from joblib import load
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain.prompts import PromptTemplate
from langchain_core.prompts import PromptTemplate

# === Load environment variables ===
load_dotenv()

# === Initialize FastAPI app ===
app = FastAPI(title="Furniture Recommender API", version="1.0")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# === Load models and embeddings ===
try:
    print("⏳ Loading models and data...")
    model = load("models/recommender_model.joblib")
    embeddings_df = pd.read_csv("models/furniture_embeddings.csv")
    print("✅ Models and embeddings loaded successfully.")
except Exception as e:
    print("❌ Error loading model files:", e)
    raise e

# === Load original dataset for analytics ===
try:
    data_df = pd.read_csv("../data/furniture_data_with_embeddings.csv")
except:
    data_df = pd.DataFrame()


# === LangChain (GenAI setup) ===
load_dotenv()
GEMINI_KEY = os.getenv("GOOGLE_API_KEY")

if GEMINI_KEY:
    llm = ChatGoogleGenerativeAI(
        model="gemini-pro",
        google_api_key=GEMINI_KEY,
        temperature=0.7,
    )
else:
    llm = None


# === Pydantic Models ===
class QueryRequest(BaseModel):
    query: str
    top_n: int = 5

# === Helper function: recommend similar products ===
def recommend_products(query, top_n=5):
    try:
        print(f"🔍 Incoming query: {query}")
        query_emb = model.encode(query).reshape(1, -1)
        print("✅ Query embedding generated")

        emb_values = embeddings_df.drop(columns=["uniq_id"], errors="ignore").values
        sims = cosine_similarity(query_emb, emb_values)[0]
        print("✅ Similarities computed")

        top_idx = sims.argsort()[-top_n:][::-1]
        top_results = embeddings_df.iloc[top_idx]
        print(f"✅ Top {top_n} results selected")

        results = []
        for _, row in top_results.iterrows():
            if "uniq_id" not in row or row["uniq_id"] not in data_df["uniq_id"].astype(str).values:
                print(f"⚠️ Skipping missing uniq_id: {row.get('uniq_id')}")
                continue

            item = data_df[data_df["uniq_id"].astype(str) == str(row["uniq_id"])]
            if not item.empty:
                # Safely extract values, replacing NaN with empty strings
                def safe_val(col):
                    val = item[col].values[0] if col in item.columns else ""
                    if pd.isna(val):
                        return ""
                    return str(val)

                img = ""
                if "images" in item.columns and isinstance(item["images"].values[0], str):
                    try:
                        img_list = eval(item["images"].values[0])
                        if isinstance(img_list, list) and len(img_list) > 0:
                            img = img_list[0]
                    except:
                        pass

                desc = generate_creative_description(safe_val("title"))
                results.append({
                    "title": safe_val("title"),
                    "price": safe_val("price"),
                    "brand": safe_val("brand"),
                    "image": img,
                    "description": desc
                })

        print("✅ Results prepared successfully")
        return results

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error during recommendation: {str(e)}")


# === Helper function: Generate creative descriptions ===
def generate_creative_description(title):
    if not llm:
        return f"A beautiful {title} designed for modern homes."
    try:
        prompt = PromptTemplate.from_template(
            "Write a short, creative product description for a furniture item named '{title}'. "
            "Make it sound elegant and engaging."
        )
        response = llm.predict(prompt.format(title=title))
        return response.strip()
    except:
        return f"A stylish and functional {title} for everyday use."

# === ROUTES ===
@app.get("/")
def root():
    return {"message": "Furniture Recommender Backend Running 🚀"}

@app.post("/recommend")
def recommend(request: QueryRequest):
    return {"query": request.query, "recommendations": recommend_products(request.query, request.top_n)}

@app.get("/analytics")
def analytics():
    if data_df.empty:
        raise HTTPException(status_code=404, detail="Analytics data not available")
    
    summary = {
        "total_products": len(data_df),
        "avg_price": data_df["price"].replace(r'[\$,]', '', regex=True).astype(float, errors='ignore').mean(),
        "top_brands": data_df["brand"].value_counts().head(5).to_dict(),
        "top_categories": data_df["categories"].value_counts().head(5).to_dict(),
    }
    return summary
