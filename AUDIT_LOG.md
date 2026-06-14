# AUDIT_LOG.md

## BioHealth Diagnostics — Incident Audit Log

---

| # | File | How the problem manifests | Mathematical / logical root cause | Structural correction implemented | Git commit hash |
|---|------|--------------------------|-----------------------------------|-----------------------------------|-----------------|
| 
 1 
| 
 `config.json`
| 
Script crashes with `JSONDecodeError` on startup 
| 
 `config.json` did not exist. `json.load()` on a missing file raises an immediate exception before anything runs 
| 
 Created `config.json` with all required keys: `DATA`, `DATA_PATH`, `MODEL`, `CHANNELS`, `NUM_CLASSES`, `BATCH_SIZE`, `EPOCHS`, `LEARNING_RATE`, `DROP_RATE`, `ACTIVATION` 
| 
 TBD 
|


---

## Summary

| Category | Count |
|----------|-------|
| Crashing / runtime errors | 3 |
| Silent logical flaws | 2 |
| Numerical / gradient failures | 2 |
| Rigid infrastructure | 2 |
| **Total** | **9** |

---

*Course: MAI/IDL SS26 — Final Assignment*
*Repository: https://github.com/YOUR_USERNAME/idl26_finalAssignment_MG*
