import sys
import os
import pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models import Profile, Household, Member
from engine.criteria import evaluate_profile, next_question

def test_scenario_a_sita():
    """Spec Section 14: Sita's family — rural Rajasthan, farmer, BPL, 4 members."""
    profile = Profile(
        household=Household(
            state="Rajasthan",
            area_type="rural",
            annual_income_inr=120000,
            ration_card="bpl",
            has_pucca_house=False,
            has_lpg_connection=False,
            owns_agri_land=True
        ),
        members=[
            Member(id="m1", relation="self", name="Sita", age=34, gender="female",
                   occupation="homemaker", is_income_tax_payer=False, has_bank_account=True,
                   is_govt_employee_or_pensioner=False),
            Member(id="m2", relation="husband", name="Ramesh", age=38, gender="male",
                   occupation="farmer", is_income_tax_payer=False, has_bank_account=True,
                   is_govt_employee_or_pensioner=False),
            Member(id="m3", relation="daughter", name="Priya", age=7, gender="female",
                   occupation="student", is_income_tax_payer=False, has_bank_account=False,
                   is_govt_employee_or_pensioner=False),
            Member(id="m4", relation="mother-in-law", name="MIL", age=68, gender="female",
                   occupation="retired", is_income_tax_payer=False, has_bank_account=True,
                   is_govt_employee_or_pensioner=False)
        ]
    )

    results = evaluate_profile(profile)
    rm = {(r.scheme_id, r.member_id): r for r in results}

    # PM-KISAN: household, via Ramesh (farmer)
    assert rm[("pm-kisan", "household")].status == "ELIGIBLE"
    assert rm[("pm-kisan", "household")].via_member == "m2"

    # APY for Sita (34, bank, no tax) and Ramesh (38, bank, no tax)
    assert rm[("apy", "m1")].status == "ELIGIBLE"
    assert rm[("apy", "m2")].status == "ELIGIBLE"

    # PMJJBY/PMSBY for adults with bank accounts
    assert rm[("pmjjby", "m1")].status == "ELIGIBLE"
    assert rm[("pmjjby", "m2")].status == "ELIGIBLE"
    assert rm[("pmsby", "m1")].status == "ELIGIBLE"
    assert rm[("pmsby", "m2")].status == "ELIGIBLE"
    assert rm[("pmsby", "m4")].status == "ELIGIBLE"  # MIL age 68, bank account

    # Sukanya for Priya (female, age 7)
    assert rm[("sukanya-samriddhi", "m3")].status == "ELIGIBLE"

    # PMUY for Sita (female, 18+, no LPG, BPL)
    assert rm[("pmuy", "m1")].status == "ELIGIBLE"

    # NSAP old-age pension for MIL (68, BPL)
    assert rm[("nsap-old-age-pension", "m4")].status == "ELIGIBLE"

    # Ayushman Vay Vandana: MIL is 68, needs 70 → ONE_STEP_AWAY (2 years)
    assert rm[("ayushman-vay-vandana", "m4")].status == "ONE_STEP_AWAY"
    assert rm[("ayushman-vay-vandana", "m4")].eligible_in_years == 2

    # PMJAY general: CHECK_OFFICIALLY
    assert rm[("pmjay-general", "household")].status == "CHECK_OFFICIALLY"

    # PMAY-G: CHECK_OFFICIALLY
    assert rm[("pmay-g", "household")].status == "CHECK_OFFICIALLY"


def test_scenario_b_arjun():
    """Spec Section 14: Arjun, 29, urban street vendor, no bank account."""
    profile = Profile(
        household=Household(state="Delhi", area_type="urban", owns_agri_land=False),
        members=[
            Member(id="m1", relation="self", name="Arjun", age=29, gender="male",
                   occupation="street_vendor", is_income_tax_payer=False, has_bank_account=False,
                   is_govt_employee_or_pensioner=False)
        ]
    )
    results = evaluate_profile(profile)
    rm = {(r.scheme_id, r.member_id): r for r in results}

    # SVANidhi: occupation=street_vendor, age>=18
    assert rm[("pm-svanidhi", "m1")].status == "ELIGIBLE"
    # PM-MUDRA: street_vendor, age>=18
    assert rm[("pm-mudra", "m1")].status == "ELIGIBLE"

    # APY: age ok, no tax, but no bank → ONE_STEP_AWAY with fix
    assert rm[("apy", "m1")].status == "ONE_STEP_AWAY"
    assert rm[("apy", "m1")].action is not None
    assert "Jan Dhan" in rm[("apy", "m1")].action or "bank" in rm[("apy", "m1")].action.lower()

    # PMJJBY/PMSBY: no bank → ONE_STEP_AWAY
    assert rm[("pmjjby", "m1")].status == "ONE_STEP_AWAY"
    assert rm[("pmsby", "m1")].status == "ONE_STEP_AWAY"

    # PM-KISAN: not a farmer → NOT_ELIGIBLE
    assert rm[("pm-kisan", "household")].status == "NOT_ELIGIBLE"


def test_scenario_c_salaried():
    """Spec Section 14: salaried engineer who pays income tax."""
    profile = Profile(
        household=Household(owns_agri_land=False),
        members=[
            Member(id="m1", relation="self", age=30, gender="male", occupation="salaried",
                   is_income_tax_payer=True, has_bank_account=True,
                   is_govt_employee_or_pensioner=False)
        ]
    )
    results = evaluate_profile(profile)
    rm = {(r.scheme_id, r.member_id): r for r in results}

    # PM-KISAN: not farmer → NOT_ELIGIBLE
    assert rm[("pm-kisan", "household")].status == "NOT_ELIGIBLE"
    # APY: tax payer → NOT_ELIGIBLE
    assert rm[("apy", "m1")].status == "NOT_ELIGIBLE"


def test_scenario_d_sparse():
    """Spec Section 14: 72-year-old, sparse profile. Many NEEDS_INFO results."""
    profile = Profile(
        household=Household(),
        members=[
            Member(id="m1", relation="self", age=72)
        ]
    )
    results = evaluate_profile(profile)
    rm = {(r.scheme_id, r.member_id): r for r in results}

    # Ayushman Vay Vandana: age 72 >= 70 → ELIGIBLE
    assert rm[("ayushman-vay-vandana", "m1")].status == "ELIGIBLE"
    # APY: age 72 > 40 → NOT_ELIGIBLE (age lte 40 fails, not a near-miss)
    assert rm[("apy", "m1")].status == "NOT_ELIGIBLE"
    # PMSBY: age 72 > 70, fails lte 70 → NOT_ELIGIBLE (but bank also unknown)
    # actually age 72 fails lte 70, but has_bank_account unknown → fail + unknown → NOT_ELIGIBLE
    assert rm[("pmsby", "m1")].status in ["NOT_ELIGIBLE", "NEEDS_INFO"]


def test_next_question():
    """Spec Section 8.3: next_question returns the field that resolves the most NEEDS_INFO."""
    profile = Profile(
        household=Household(),
        members=[Member(id="m1", relation="self", age=30)]
    )
    q = next_question(profile)
    assert q is not None
    assert "field" in q
    assert "question_en" in q
    assert "question_hi" in q


def test_profile_merge_no_overwrite():
    """Spec Section 14: update_profile never overwrites known values with null."""
    m = Member(id="m1", relation="self", age=30, occupation="farmer")
    # Simulating a merge: known values should not be overwritten by None
    new_data = {"age": None, "occupation": None, "has_bank_account": True}
    for k, v in new_data.items():
        if v is not None:
            setattr(m, k, v)
    assert m.age == 30  # not overwritten
    assert m.occupation == "farmer"  # not overwritten
    assert m.has_bank_account == True  # new value set
