import json
import os
from typing import List, Dict, Any, Optional, Literal, Tuple
from models import Profile, SchemeResult, CriterionResult

catalog_path = os.path.join(os.path.dirname(__file__), "..", "catalog", "schemes.json")
with open(catalog_path, "r", encoding="utf-8") as f:
    SCHEMES = json.load(f)

# Build a lookup dict for quick access
SCHEME_BY_ID = {s["id"]: s for s in SCHEMES}


def evaluate_criterion(field_value: Any, criterion: Dict[str, Any]) -> Literal["PASS", "FAIL", "UNKNOWN"]:
    """Evaluate a single criterion. Returns PASS, FAIL, or UNKNOWN (if field is null/missing)."""
    if field_value is None:
        return "UNKNOWN"

    op = criterion["op"]
    target = criterion["value"]

    if op == "eq":
        return "PASS" if field_value == target else "FAIL"
    elif op == "neq":
        return "PASS" if field_value != target else "FAIL"
    elif op == "gte":
        return "PASS" if field_value >= target else "FAIL"
    elif op == "lte":
        return "PASS" if field_value <= target else "FAIL"
    elif op == "gt":
        return "PASS" if field_value > target else "FAIL"
    elif op == "lt":
        return "PASS" if field_value < target else "FAIL"
    elif op == "in":
        return "PASS" if field_value in target else "FAIL"

    return "UNKNOWN"


def evaluate_profile(profile: Profile, lang: str = "en") -> List[SchemeResult]:
    """Evaluate all schemes for all members. Handles household collapsing and informational schemes."""
    results: List[SchemeResult] = []

    hh_dict = profile.household.model_dump()
    flattened_hh = {f"hh_{k}": v for k, v in hh_dict.items()}

    for scheme in SCHEMES:
        # Informational schemes go straight to CHECK_OFFICIALLY
        if scheme["decision_mode"] == "informational":
            results.append(SchemeResult(
                scheme_id=scheme["id"],
                member_id="household",
                status="CHECK_OFFICIALLY",
                why=[],
                missing_fields=[]
            ))
            continue

        # Rules-based: evaluate per member
        for member in profile.members:
            member_dict = member.model_dump()
            member_dict.update(flattened_hh)

            why: List[CriterionResult] = []
            missing_fields: List[str] = []
            fail_count = 0
            near_miss = False
            action: Optional[str] = None
            eligible_in_years: Optional[int] = None
            blocking_criterion: Optional[str] = None

            for crit in scheme["criteria"]:
                field = crit["field"]
                val = member_dict.get(field)
                res = evaluate_criterion(val, crit)

                label = crit["label"].get(lang, crit["label"].get("en"))
                if val is True:
                    val_str = "Yes" if lang == "en" else "हाँ"
                elif val is False:
                    val_str = "No" if lang == "en" else "नहीं"
                elif val is not None:
                    val_str = str(val)
                else:
                    val_str = "Unknown" if lang == "en" else "अज्ञात"
                    
                label_with_val = f"{label} (You: {val_str})" if lang == "en" else f"{label} (आप: {val_str})"
                
                why.append(CriterionResult(criterion=label_with_val, result=res))

                if res == "UNKNOWN":
                    missing_fields.append(field)
                elif res == "FAIL":
                    fail_count += 1

                    # Check for fix (actionable near-miss)
                    if "fix" in crit:
                        near_miss = True
                        action = crit["fix"].get(lang, crit["fix"].get("en"))
                        blocking_criterion = label
                    # Check for time-based near-miss
                    elif "near_miss" in crit:
                        nm = crit["near_miss"]
                        if nm["kind"] == "time" and isinstance(val, (int, float)):
                            if crit["op"] in ["gte", "gt"]:
                                gap = crit["value"] - val
                            else:
                                gap = val - crit["value"]
                            if 0 < gap <= nm["max_gap"]:
                                near_miss = True
                                eligible_in_years = int(gap)
                                blocking_criterion = label

            # Determine status per spec Section 8.2
            if fail_count == 0 and len(missing_fields) > 0:
                status = "NEEDS_INFO"
            elif fail_count == 0:
                status = "ELIGIBLE"
            elif fail_count == 1 and near_miss:
                status = "ONE_STEP_AWAY"
            else:
                status = "NOT_ELIGIBLE"

            results.append(SchemeResult(
                scheme_id=scheme["id"],
                member_id=member.id,
                status=status,
                why=why,
                missing_fields=missing_fields,
                blocking_criterion=blocking_criterion,
                action=action,
                eligible_in_years=eligible_in_years,
            ))

    # Collapse household-scoped schemes to the best result per household
    final_results: List[SchemeResult] = []
    status_rank = {"ELIGIBLE": 4, "ONE_STEP_AWAY": 3, "NEEDS_INFO": 2, "NOT_ELIGIBLE": 1, "CHECK_OFFICIALLY": 0}

    grouped: Dict[str, List[SchemeResult]] = {}
    for r in results:
        scheme = SCHEME_BY_ID[r.scheme_id]
        if scheme["scope"] == "household" and r.status != "CHECK_OFFICIALLY":
            grouped.setdefault(r.scheme_id, []).append(r)
        else:
            final_results.append(r)

    for scheme_id, grp in grouped.items():
        best = max(grp, key=lambda x: status_rank[x.status])
        best.via_member = best.member_id
        best.member_id = "household"
        final_results.append(best)

    return final_results


def next_question(profile: Profile) -> Optional[Dict[str, str]]:
    """Return the single missing field that would resolve the most NEEDS_INFO results.
    
    Spec Section 8.3: weighted toward schemes with ELIGIBLE potential.
    Returns {"field": ..., "question_en": ..., "question_hi": ...} or None.
    """
    results = evaluate_profile(profile, "en")

    # Count how many NEEDS_INFO results each missing field appears in
    field_weight: Dict[str, int] = {}
    for r in results:
        if r.status == "NEEDS_INFO":
            for f in r.missing_fields:
                field_weight[f] = field_weight.get(f, 0) + 1

    if not field_weight:
        return None

    best_field = max(field_weight, key=lambda f: field_weight[f])

    # Map field names to plain-language questions
    questions = {
        "age":                          {"en": "How old are you?", "hi": "आपकी आयु कितनी है?"},
        "gender":                       {"en": "What is your gender?", "hi": "आपका लिंग क्या है?"},
        "occupation":                   {"en": "What is your occupation?", "hi": "आपका पेशा क्या है?"},
        "has_bank_account":             {"en": "Do you have a bank account?", "hi": "क्या आपके पास बैंक खाता है?"},
        "is_income_tax_payer":          {"en": "Do you pay income tax?", "hi": "क्या आप आयकर देते हैं?"},
        "is_govt_employee_or_pensioner":{"en": "Are you a government employee or pensioner?", "hi": "क्या आप सरकारी कर्मचारी या पेंशनभोगी हैं?"},
        "hh_annual_income_inr":         {"en": "What is your household's approximate annual income?", "hi": "आपके परिवार की अनुमानित वार्षिक आय कितनी है?"},
        "hh_ration_card":               {"en": "What type of ration card do you have (BPL, AAY, APL, or none)?", "hi": "आपके पास कौन सा राशन कार्ड है (बीपीएल, एएवाई, एपीएल, या कोई नहीं)?"},
        "hh_owns_agri_land":            {"en": "Does your household own agricultural land?", "hi": "क्या आपके परिवार के पास कृषि भूमि है?"},
        "hh_has_lpg_connection":        {"en": "Does your household have an LPG connection?", "hi": "क्या आपके परिवार में एलपीजी कनेक्शन है?"},
        "hh_area_type":                 {"en": "Do you live in a rural or urban area?", "hi": "क्या आप ग्रामीण या शहरी क्षेत्र में रहते हैं?"},
        "hh_has_pucca_house":           {"en": "Do you live in a pucca (permanent) house?", "hi": "क्या आप पक्के (स्थायी) मकान में रहते हैं?"},
        "hh_state":                     {"en": "Which state do you live in?", "hi": "आप किस राज्य में रहते हैं?"},
    }

    q = questions.get(best_field, {"en": f"Please tell me about: {best_field}", "hi": f"कृपया बताएं: {best_field}"})
    return {"field": best_field, "question_en": q["en"], "question_hi": q["hi"]}
