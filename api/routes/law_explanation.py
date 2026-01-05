from fastapi import APIRouter, HTTPException, Depends
from api.core.deps import get_current_user
from api.schemas import ExplanationRequest, ExplanationResponse
from module_a.interface import LawExplanationAPI

router = APIRouter()
law_api = LawExplanationAPI()

@router.post("/explain", response_model=ExplanationResponse)
async def explain_law(request: ExplanationRequest, user: dict = Depends(get_current_user)):
    try:
        result = law_api.get_explanation(request.query)
        
        if "error" in result:
             # If it's a handled error from the module, we might still want to return 200 with error info
             # or 500 depending on design. Let's stick to the schema.
             # If result has error key, it might not match ExplanationResponse structure fully if we aren't careful.
             # Module A returns a dict with keys matching schema mostly.
             pass
             
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
