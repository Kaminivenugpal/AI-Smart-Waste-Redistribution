"""
============================================================
AI SMART WASTE REDISTRIBUTION PLATFORM
Module 1: AI Analysis Engine (ai_service/model.py)
============================================================
This module implements the AI Surplus Item Analyzer.
Stage 1 adds CLIP (openai/clip-vit-base-patch32) vision AI for
image-based category classification, with graceful text-only
fallback when CLIP is unavailable (OOM, no internet, import error).
"""

import re
import io
from typing import Dict, Any, Optional

# ──────────────────────────────────────────────────────────────
# CLIP Model Initialisation
# Loaded at module import time; sets CLIP_AVAILABLE flag.
# If loading fails for any reason, the service degrades gracefully
# to text-only analysis without crashing.
# ──────────────────────────────────────────────────────────────
CLIP_AVAILABLE = False
clip_model = None
clip_processor = None

CATEGORY_LABELS = [
    "a photograph of food, meals, groceries, or cooked dishes",
    "a photograph of clothing, garments, fabric, or wearables",
    "a photograph of books, textbooks, or reading material",
    "a photograph of furniture such as tables, chairs, sofas, or cabinets",
    "a photograph of electronics, devices, phones, laptops, or appliances"
]
CATEGORY_NAMES = ["Food", "Clothes", "Books", "Furniture", "Electronics"]

try:
    from transformers import CLIPProcessor, CLIPModel
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    CLIP_AVAILABLE = True
    print("[AI Service] CLIP model loaded successfully.")
except Exception as e:
    print(f"[AI Service] CLIP unavailable: {e}. Text-only mode active.")


class SurplusItemAnalyzer:
    """
    Modular AI Analyzer for Surplus Items.

    Stage 1 pipeline:
      1. Text keyword analysis — always runs; produces text_score (0.0–1.0).
      2. CLIP vision analysis — runs when image_bytes are provided AND
         CLIP_AVAILABLE is True; produces per-category probabilities from
         softmax over cosine similarities (model_score, NOT hardcoded).
      3. Combined scoring: 60 % CLIP + 40 % text when vision is used.
      4. Graceful degradation to text-only when CLIP is unavailable.

    Analyzes item name, description, user-selected category, quantity,
    and optional image bytes to determine:
      - Predicted Category   (Food / Clothes / Books / Furniture / Electronics)
      - Item Condition       (keyword heuristic — based on description)
      - Priority             (rule-based from category + condition)
      - CLIP model score     (actual softmax output, 0.0–1.0)
      - Analysis method      (Vision AI (CLIP) + Text Analysis | Text Analysis Only | …)
      - Manual review flag   (when model confidence is low)
      - Estimated Shelf Life (food only, keyword heuristic — see disclaimer)
    """

    SUPPORTED_CATEGORIES = ["Food", "Clothes", "Books", "Furniture", "Electronics"]

    # Category keywords for text feature matching
    CATEGORY_KEYWORDS = {
        "Food": [
            "meal", "rice", "curry", "bread", "fruit", "vegetable", "apple",
            "milk", "canned", "snack", "cooked", "cake", "food", "grocery",
            "soup", "paneer", "roti", "biryani", "lunch", "dinner", "banana",
            "tomato", "produce", "dairy", "curd", "pastry", "bakery", "grain",
            "flour", "biscuit", "packaged", "perishable", "hot"
        ],
        "Clothes": [
            "shirt", "pant", "t-shirt", "dress", "jacket", "coat", "jeans",
            "sweater", "saree", "kurta", "shoes", "wear", "cloth", "fabric",
            "cotton", "garment", "hoodie", "blouse", "skirt", "trousers",
            "uniform", "scarf", "socks", "underwear"
        ],
        "Books": [
            "book", "textbook", "novel", "dictionary", "notebook", "guide",
            "magazine", "literature", "reading", "edition", "paperback",
            "hardcover", "story", "comics", "journal", "manual", "atlas"
        ],
        "Furniture": [
            "table", "chair", "sofa", "desk", "bed", "cupboard", "shelf",
            "closet", "cabinet", "bench", "stool", "mattress", "dining",
            "wardrobe", "drawer", "bookshelf", "couch", "recliner"
        ],
        "Electronics": [
            "phone", "laptop", "monitor", "keyboard", "mouse", "charger",
            "cable", "tv", "camera", "headphone", "speaker", "appliance",
            "fan", "fridge", "oven", "tablet", "electronic", "printer",
            "router", "modem", "microwave", "television", "remote", "iron"
        ]
    }

    # ──────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────

    @classmethod
    def analyze(
        cls,
        name: str,
        description: str,
        category: str,
        quantity: str,
        location: str,
        image_bytes: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """
        Executes the complete AI analysis pipeline on a surplus item.

        Parameters
        ----------
        name         : Item name as entered by the donor.
        description  : Free-text description of the item.
        category     : Category selected by the donor (used as fallback).
        quantity     : Quantity string (informational).
        location     : Pickup location (informational).
        image_bytes  : Raw bytes of an uploaded image, or None.

        Returns
        -------
        Dict with keys: predicted_category, item_condition, priority,
        model_score, confidence, analysis_method, needs_manual_review,
        review_reason, estimated_shelf_life, shelf_life_disclaimer.
        """
        text_content = f"{name} {description}".lower()

        # Step 1 — Text keyword analysis (always runs)
        text_category, text_score = cls._text_category_score(text_content, category)

        # Step 2 — CLIP vision analysis (only if image provided and model loaded)
        clip_ran = False
        clip_top_category = None
        clip_top_score = 0.0
        clip_probs = []

        if image_bytes and CLIP_AVAILABLE:
            try:
                clip_top_category, clip_top_score, clip_probs = cls._run_clip(image_bytes)
                clip_ran = True
            except Exception as clip_err:
                print(f"[AI Service] CLIP inference error: {clip_err}. Falling back to text.")

        # Step 3 — Combine scores and determine analysis method
        if clip_ran:
            model_score = round(0.6 * clip_top_score + 0.4 * text_score, 3)
            predicted_category = clip_top_category
            analysis_method = "Vision AI (CLIP) + Text Analysis"
        else:
            model_score = round(text_score, 3)
            predicted_category = text_category
            if image_bytes and not CLIP_AVAILABLE:
                analysis_method = "Vision AI unavailable — Text Analysis Only"
            else:
                analysis_method = "Text Analysis Only"

        # Step 4 — Manual review flag
        needs_manual_review = False
        review_reason = None

        if clip_ran and clip_top_score < 0.35:
            needs_manual_review = True
            review_reason = (
                f"Low CLIP model score ({clip_top_score:.2f}) — image may be ambiguous, "
                "blurry, or not clearly matching any supported category. "
                "Please verify the category manually."
            )
        elif not clip_ran and text_score < 0.40:
            needs_manual_review = True
            review_reason = (
                f"Low text analysis score ({text_score:.2f}) — item description contains "
                "few recognisable category keywords. "
                "Please verify or enrich the description."
            )

        # Step 5 — Condition (keyword heuristic from description)
        condition = cls._evaluate_condition(text_content)

        # Step 6 — Priority (rule-based)
        priority = cls._calculate_priority(predicted_category, condition, text_content)

        # Step 7 — Shelf life (food only, keyword heuristic)
        if predicted_category == "Food":
            estimated_shelf_life = cls._estimate_shelf_life(text_content)
            shelf_life_disclaimer = (
                "Estimated range based on food type keywords — not a food safety assessment. "
                "Inspect all food before distribution."
            )
        else:
            estimated_shelf_life = None
            shelf_life_disclaimer = None

        return {
            "predicted_category": predicted_category,
            "item_condition": f"{condition} (based on description)",
            "priority": priority,
            "model_score": model_score,          # 0.0–1.0; actual model output
            "confidence": round(model_score * 100, 1),  # backward-compat percentage
            "analysis_method": analysis_method,
            "needs_manual_review": needs_manual_review,
            "review_reason": review_reason,
            "estimated_shelf_life": estimated_shelf_life,
            "shelf_life_disclaimer": shelf_life_disclaimer
        }

    # ──────────────────────────────────────────────────────────
    # Private — CLIP inference
    # ──────────────────────────────────────────────────────────

    @classmethod
    def _run_clip(cls, image_bytes: bytes):
        """
        Run CLIP zero-shot classification on raw image bytes.

        Returns (top_category_name, top_score_float, all_probs_list).
        Scores come directly from the model softmax output — never hardcoded.
        """
        import torch
        from PIL import Image

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        inputs = clip_processor(
            text=CATEGORY_LABELS,
            images=image,
            return_tensors="pt",
            padding=True
        )

        with torch.no_grad():
            outputs = clip_model(**inputs)
            # logits_per_image shape: [1, num_labels]
            logits = outputs.logits_per_image  # raw cosine-similarity logits
            probs = logits.softmax(dim=1)[0]   # softmax → probability distribution

        probs_list = probs.tolist()
        top_idx = probs.argmax().item()
        top_category = CATEGORY_NAMES[top_idx]
        top_score = probs_list[top_idx]

        return top_category, top_score, probs_list

    # ──────────────────────────────────────────────────────────
    # Private — Text analysis
    # ──────────────────────────────────────────────────────────

    @classmethod
    def _text_category_score(cls, text: str, user_category: str):
        """
        Keyword-based category matching.

        Returns (predicted_category, text_score) where text_score is 0.0–1.0.
        Score is derived from keyword hit density across all categories,
        normalised so a strong match approaches 1.0.
        """
        scores = {cat: 0 for cat in cls.SUPPORTED_CATEGORIES}

        for cat, keywords in cls.CATEGORY_KEYWORDS.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', text):
                    scores[cat] += 1

        best_cat = max(scores, key=scores.get)
        max_hits = scores[best_cat]

        if max_hits > 0:
            predicted = best_cat
            # Normalise: each additional keyword hit adds ~0.10, capped at 0.95
            text_score = min(0.95, 0.50 + max_hits * 0.09)
        else:
            # No keywords matched — fall back to user-supplied category
            predicted = user_category if user_category in cls.SUPPORTED_CATEGORIES else "Food"
            text_score = 0.30  # low baseline; triggers manual review when no image

        return predicted, text_score

    @classmethod
    def _evaluate_condition(cls, text: str) -> str:
        """
        Evaluates item condition based on descriptive keywords.
        Result is labelled '(based on description)' in the returned dict.
        """
        if any(w in text for w in [
            "brand new", "unopened", "sealed", "freshly prepared",
            "fresh", "mint condition", "unused"
        ]):
            return "New"
        elif any(w in text for w in [
            "damaged", "broken", "needs repair", "not working",
            "torn", "expired", "stale"
        ]):
            return "Needs Repair"
        elif any(w in text for w in [
            "used", "gently used", "slightly worn", "opened",
            "good condition", "working fine", "readable"
        ]):
            return "Good"
        elif any(w in text for w in [
            "old", "fair", "wear and tear", "scratched", "acceptable"
        ]):
            return "Fair"
        else:
            return "Good"  # Default clean condition

    @classmethod
    def _calculate_priority(cls, category: str, condition: str, text: str) -> str:
        """
        Determines redistribution priority (High / Medium / Low).
        Perishable food items always get High priority for rapid redistribution.
        """
        if category == "Food":
            if any(w in text for w in [
                "cooked", "hot", "curry", "rice", "biryani",
                "prepared", "lunch", "dinner", "perishable"
            ]):
                return "High"
            elif any(w in text for w in ["canned", "packaged", "dry", "unopened"]):
                return "Medium"
            else:
                return "High"

        if condition == "Needs Repair":
            return "Low"

        if category in ["Clothes", "Electronics"]:
            return "High" if condition in ["New", "Good"] else "Medium"

        return "Medium"

    @classmethod
    def _estimate_shelf_life(cls, text: str) -> str:
        """
        Estimates remaining usable time / shelf life for Food items.
        This is a keyword heuristic only — see shelf_life_disclaimer in response.
        """
        if any(w in text for w in [
            "cooked", "hot", "prepared", "rice", "curry",
            "soup", "biryani", "roti", "lunch", "dinner"
        ]):
            return "12 - 24 Hours (Immediate Redistribution Required)"
        elif any(w in text for w in [
            "milk", "dairy", "paneer", "curd", "cake",
            "pastry", "bread", "bakery"
        ]):
            return "1 - 3 Days (Keep Refrigerated)"
        elif any(w in text for w in [
            "fruit", "apple", "banana", "vegetable", "tomato", "produce"
        ]):
            return "3 - 5 Days"
        elif any(w in text for w in [
            "canned", "packaged", "dry", "biscuit", "grain", "flour"
        ]):
            return "3 - 6 Months"
        else:
            return "24 - 48 Hours"
