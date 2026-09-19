from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class Household(BaseModel):
    state: Optional[str] = None
    area_type: Optional[Literal["rural", "urban"]] = None
    annual_income_inr: Optional[int] = None
    ration_card: Optional[Literal["none", "apl", "bpl", "aay"]] = None
    has_pucca_house: Optional[bool] = None
    has_lpg_connection: Optional[bool] = None
    owns_agri_land: Optional[bool] = None

class Member(BaseModel):
    id: str
    relation: str
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[Literal["female", "male", "other"]] = None
    occupation: Optional[Literal["farmer", "street_vendor", "artisan", "small_business", "salaried", "homemaker", "student", "laborer", "unemployed", "retired", "other"]] = None
    is_income_tax_payer: Optional[bool] = None
    has_bank_account: Optional[bool] = None
    is_govt_employee_or_pensioner: Optional[bool] = None

class Profile(BaseModel):
    household: Household = Field(default_factory=Household)
    members: List[Member] = Field(default_factory=list)

class CriterionResult(BaseModel):
    criterion: str
    result: Literal["PASS", "FAIL", "UNKNOWN"]

class SchemeResult(BaseModel):
    scheme_id: str
    member_id: str
    status: Literal["ELIGIBLE", "ONE_STEP_AWAY", "NEEDS_INFO", "NOT_ELIGIBLE", "CHECK_OFFICIALLY"]
    why: List[CriterionResult]
    blocking_criterion: Optional[str] = None
    action: Optional[str] = None
    eligible_in_years: Optional[int] = None
    missing_fields: List[str] = Field(default_factory=list)
    via_member: Optional[str] = None
