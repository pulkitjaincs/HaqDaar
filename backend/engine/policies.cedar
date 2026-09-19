permit(
    principal,
    action == Action::"apply",
    resource == Scheme::"pm-kisan"
)
when {
    principal.occupation == "farmer" &&
    principal.hh_owns_agri_land == true &&
    principal.is_income_tax_payer == false &&
    principal.is_govt_employee_or_pensioner == false
};

permit(
    principal,
    action == Action::"apply",
    resource == Scheme::"apy"
)
when {
    principal.age >= 18 &&
    principal.age <= 40 &&
    principal.has_bank_account == true &&
    principal.is_income_tax_payer == false
};

permit(
    principal,
    action == Action::"apply",
    resource == Scheme::"pmjjby"
)
when {
    principal.age >= 18 &&
    principal.age <= 50 &&
    principal.has_bank_account == true
};

permit(
    principal,
    action == Action::"apply",
    resource == Scheme::"pmsby"
)
when {
    principal.age >= 18 &&
    principal.age <= 70 &&
    principal.has_bank_account == true
};

permit(
    principal,
    action == Action::"apply",
    resource == Scheme::"sukanya-samriddhi"
)
when {
    principal.gender == "female" &&
    principal.age <= 9
};

permit(
    principal,
    action == Action::"apply",
    resource == Scheme::"pmuy"
)
when {
    principal.gender == "female" &&
    principal.age >= 18 &&
    principal.hh_has_lpg_connection == false &&
    ["bpl", "aay"].contains(principal.hh_ration_card)
};

permit(
    principal,
    action == Action::"apply",
    resource == Scheme::"pm-svanidhi"
)
when {
    principal.occupation == "street_vendor" &&
    principal.age >= 18
};

permit(
    principal,
    action == Action::"apply",
    resource == Scheme::"pm-mudra"
)
when {
    ["small_business", "street_vendor", "artisan"].contains(principal.occupation) &&
    principal.age >= 18
};

permit(
    principal,
    action == Action::"apply",
    resource == Scheme::"pm-vishwakarma"
)
when {
    principal.occupation == "artisan" &&
    principal.age >= 18 &&
    principal.is_govt_employee_or_pensioner == false
};

permit(
    principal,
    action == Action::"apply",
    resource == Scheme::"nsap-old-age-pension"
)
when {
    principal.age >= 60 &&
    ["bpl", "aay"].contains(principal.hh_ration_card)
};

permit(
    principal,
    action == Action::"apply",
    resource == Scheme::"ayushman-vay-vandana"
)
when {
    principal.age >= 70
};