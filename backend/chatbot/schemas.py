from typing import TypedDict, Optional, List, Dict, Any

class IntentFilters(TypedDict, total=False):
    category: Optional[str]
    price_max: Optional[int]
    price_min: Optional[int]
    color: Optional[str]
    brand: Optional[str]
    keywords: List[str]

class IntentData(TypedDict):
    intent: str
    filters: IntentFilters
    target_product_id: Optional[str]
    context_ref: Optional[str]
