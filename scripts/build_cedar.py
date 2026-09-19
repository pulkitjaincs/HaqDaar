import json
import os

def build_policies():
    catalog_path = os.path.join(os.path.dirname(__file__), "..", "backend", "catalog", "schemes.json")
    out_path = os.path.join(os.path.dirname(__file__), "..", "backend", "engine", "policies.cedar")
    
    with open(catalog_path, "r", encoding="utf-8") as f:
        schemes = json.load(f)
        
    policies = []
    
    for s in schemes:
        if s["decision_mode"] == "informational":
            continue
            
        policy = f'permit(\n    principal,\n    action == Action::"apply",\n    resource == Scheme::"{s["id"]}"\n)\nwhen {{\n'
        
        conditions = []
        for crit in s["criteria"]:
            field = crit["field"]
            val = crit["value"]
            op = crit["op"]
            
            if isinstance(val, str):
                val_str = f'"{val}"'
            elif isinstance(val, bool):
                val_str = "true" if val else "false"
            else:
                val_str = str(val)
                
            if op == "eq":
                cond = f"    principal.{field} == {val_str}"
            elif op == "neq":
                cond = f"    principal.{field} != {val_str}"
            elif op == "gte":
                cond = f"    principal.{field} >= {val_str}"
            elif op == "lte":
                cond = f"    principal.{field} <= {val_str}"
            elif op == "gt":
                cond = f"    principal.{field} > {val_str}"
            elif op == "lt":
                cond = f"    principal.{field} < {val_str}"
            elif op == "in":
                if isinstance(val, list):
                    set_str = "[" + ", ".join(f'"{v}"' if isinstance(v, str) else str(v) for v in val) + "]"
                    cond = f"    {set_str}.contains(principal.{field})"
            
            conditions.append(cond)
            
        policy += " &&\n".join(conditions) + "\n};"
        policies.append(policy)
        
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n\n".join(policies))
        
if __name__ == "__main__":
    build_policies()
    print("Cedar policies built successfully in backend/engine/policies.cedar")
