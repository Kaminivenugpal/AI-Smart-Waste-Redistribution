"""
============================================================
AI SMART WASTE REDISTRIBUTION PLATFORM
Module 1: AI Analysis Engine (ai_service/model.py)
============================================================
This module implements the AI Surplus Item Analyzer.
It is designed with clean modular interfaces so machine learning
models (e.g., PyTorch, TensorFlow, OpenCV, or Vision Transformers)
can be seamlessly integrated in place of or alongside heuristic classifiers.
"""

import re
from typing import Dict, Any, Optional

class SurplusItemAnalyzer:
    """
    Modular AI Analyzer for Surplus Items.
    Analyzes item name, description, user-selected category, quantity,
    and optional image features to determine:
    1. Predicted Category
    2. Item Condition (New / Good / Fair / Needs Repair)
    3. Priority (High / Medium / Low)
    4. AI Confidence Score (%)
    5. Estimated Remaining Shelf Life / Usable Time (For Food)
    """

    SUPPORTED_CATEGORIES = ["Food", "Clothes", "Books", "Furniture", "Electronics"]

    # Category keywords for text feature matching
    CATEGORY_KEYWORDS = {
        "Food": ["meal", "rice", "curry", "bread", "fruit", "vegetable", "apple", "milk", "canned", "snack", "cooked", "cake", "food", "grocery", "soup", "paneer", "roti", "biryani", "lunch", "dinner"],
        "Clothes": ["shirt", "pant", "t-shirt", "dress", "jacket", "coat", "jeans", "sweater", "saree", "kurta", "shoes", "wear", "cloth", "fabric", "cotton", "garment", "hoodie"],
        "Books": ["book", "textbook", "novel", "dictionary", "notebook", "guide", "magazine", "literature", "reading", "edition", "paperback", "hardcover", "story", "comics"],
        "Furniture": ["table", "chair", "sofa", "desk", "bed", "cupboard", "shelf", "closet", "cabinet", "bench", "stool", "mattress", "dining"],
        "Electronics": ["phone", "laptop", "monitor", "keyboard", "mouse", "charger", "cable", "tv", "camera", "headphone", "speaker", "appliance", "fan", "fridge", "oven", "tablet", "electronic"]
    }

    @classmethod
    def analyze(cls, name: str, description: str, category: str, quantity: str, location: str, image_filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes complete AI analysis pipeline on the surplus item.
        """
        text_content = f"{name} {description}".lower()
        
        # 1. Category Prediction
        predicted_category, category_confidence = cls._predict_category(text_content, category)

        # 2. Condition Analysis
        condition = cls._evaluate_condition(text_content)

        # 3. Priority Calculation
        priority = cls._calculate_priority(predicted_category, condition, text_content)

        # 4. Overall AI Confidence Score
        overall_confidence = round(min(99.0, max(75.0, (category_confidence + 85.0) / 2.0 + (5.0 if image_filename else 0.0))), 1)

        # 5. Shelf Life Estimation (For Food)
        estimated_shelf_life = cls._estimate_shelf_life(text_content) if predicted_category == "Food" else None

        return {
            "predicted_category": predicted_category,
            "item_condition": condition,
            "priority": priority,
            "confidence": overall_confidence,
            "estimated_shelf_life": estimated_shelf_life
        }

    @classmethod
    def _predict_category(cls, text: str, user_category: str) -> (str, float):
        """
        Matches text keywords against category keyword maps.
        Returns predicted category and classification confidence.
        """
        scores = {cat: 0 for cat in cls.SUPPORTED_CATEGORIES}

        for cat, keywords in cls.CATEGORY_KEYWORDS.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', text):
                    scores[cat] += 2

        # Check max scoring category
        best_cat = max(scores, key=scores.get)
        max_score = scores[best_cat]

        if max_score > 0:
            predicted = best_cat
            confidence = min(98.0, 70.0 + max_score * 5.0)
        else:
            # Fall back to user category if text is neutral
            predicted = user_category if user_category in cls.SUPPORTED_CATEGORIES else "Food"
            confidence = 85.0

        return predicted, confidence

    @classmethod
    def _evaluate_condition(cls, text: str) -> str:
        """
        Evaluates item condition based on descriptive keywords.
        """
        if any(w in text for w in ["brand new", "unopened", "sealed", "freshly prepared", "fresh", "mint condition", "unused"]):
            return "New"
        elif any(w in text for w in ["damaged", "broken", "needs repair", "not working", "torn", "expired", "stale"]):
            return "Needs Repair"
        elif any(w in text for w in ["used", "gently used", "slightly worn", "opened", "good condition", "working fine", "readable"]):
            return "Good"
        elif any(w in text for w in ["old", "fair", "wear and tear", "scratched", "acceptable"]):
            return "Fair"
        else:
            return "Good"  # Default clean condition

    @classmethod
    def _calculate_priority(cls, category: str, condition: str, text: str) -> str:
        """
        Determines redistribution priority (High / Medium / Low).
        Perishable food items get High priority for rapid redistribution.
        """
        if category == "Food":
            if any(w in text for w in ["cooked", "hot", "curry", "rice", "biryani", "prepared", "lunch", "dinner", "perishable"]):
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
        """
        if any(w in text for w in ["cooked", "hot", "prepared", "rice", "curry", "soup", "biryani", "roti", "lunch", "dinner"]):
            return "12 - 24 Hours (Immediate Redistribution Required)"
        elif any(w in text for w in ["milk", "dairy", "paneer", "curd", "cake", "pastry", "bread", "bakery"]):
            return "1 - 3 Days (Keep Refrigerated)"
        elif any(w in text for w in ["fruit", "apple", "banana", "vegetable", "tomato", "produce"]):
            return "3 - 5 Days"
        elif any(w in text for w in ["canned", "packaged", "dry", "biscuit", "grain", "flour"]):
            return "3 - 6 Months"
        else:
            return "24 - 48 Hours"
