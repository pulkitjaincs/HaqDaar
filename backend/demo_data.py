"""Demo scenarios for Haqdaar."""

SCENARIO_A = {
    "turns": [
        {
            "user": "I'm a farmer in Rajasthan with a wife, a 7-year-old daughter and a mother aged 68",
            "reply_en": "I can help with that. Could you please tell me your age?",
            "reply_hi": "मैं इसमें मदद कर सकता हूँ। कृपया मुझे अपनी आयु बताएं?",
            "profile_update": {
                "household": {"state": "Rajasthan", "owns_agri_land": True, "area_type": "rural"},
                "members": [
                    {"id": "m1", "relation": "self", "occupation": "farmer"},
                    {"id": "m2", "relation": "wife"},
                    {"id": "m3", "relation": "daughter", "age": 7, "gender": "female"},
                    {"id": "m4", "relation": "mother", "age": 68, "gender": "female"}
                ]
            }
        },
        {
            "user": "I am 38",
            "reply_en": "Thank you. Does your household have a BPL ration card?",
            "reply_hi": "धन्यवाद। क्या आपके परिवार के पास बीपीएल राशन कार्ड है?",
            "profile_update": {
                "household": {},
                "members": [
                    {"id": "m1", "relation": "self", "age": 38, "gender": "male"}
                ]
            }
        },
        {
            "user": "Yes we have a BPL card. Also my wife is 34 and we both have bank accounts.",
            "reply_en": "Got it. I have enough information to check your eligibility. Please see your results below.",
            "reply_hi": "समझ गया। मेरी पास आपकी पात्रता जांचने के लिए पर्याप्त जानकारी है। कृपया नीचे अपने परिणाम देखें।",
            "profile_update": {
                "household": {"ration_card": "bpl", "annual_income_inr": 120000},
                "members": [
                    {"id": "m1", "relation": "self", "has_bank_account": True, "is_income_tax_payer": False},
                    {"id": "m2", "relation": "wife", "age": 34, "gender": "female", "has_bank_account": True, "is_income_tax_payer": False},
                    {"id": "m4", "relation": "mother", "has_bank_account": True}
                ]
            }
        }
    ]
}
