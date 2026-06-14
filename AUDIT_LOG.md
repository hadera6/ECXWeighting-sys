# AUDIT_LOG.md

## BioHealth Diagnostics — Incident Audit Log

---

| # | File | How the problem manifests | Mathematical / logical root cause | Structural correction implemented | Git commit hash |
|---|------|--------------------------|-----------------------------------|-----------------------------------|-----------------|
| 1 | `config.json` | Script crashes with `JSONDecodeError` on startup | `config.json` did not exist. `json.load()` on a missing file raises an immediate exception before anything runs | Created `config.json` with all required keys: `DATA`, `DATA_PATH`, `MODEL`, `CHANNELS`, `NUM_CLASSES`, `BATCH_SIZE`, `EPOCHS`, `LEARNING_RATE`, `DROP_RATE`, `ACTIVATION` | TBD |



| 2 | `data.py` | Validation accuracy is inflated — metrics are unreliable | `train_data` was assigned the full array without slicing. Both train and val sets contained the same samples | Sliced `train_data` and `train_labels` to `[:val_start]` to make the two splits mutually exclusive | TBD |
| 3 | `fit.py` | Loss diverges or produces NaN from the first epoch | `optimizer.zero_grad()` was called after the forward pass. Gradients accumulated across batches making updates mathematically wrong | Moved `zero_grad()` to before the forward pass | TBD |
| 4 | `fit.py` | Python built-in `sum()` is overwritten in `train_one_epoch` | Counter variable was named `sum`, shadowing the Python built-in. Inconsistent with `evaluate()` which used `total` | Renamed variable from `sum` to `total` | TBD |
| 5 | `models.py` | `RuntimeError: mat1 and mat2 shapes cannot be multiplied` in `AlexNet` and `VGG16` | `nn.Linear(2048, 1024)` was hardcoded. `AlexNet` outputs 192 channels — `2048 / 192 = 10.67`, not a whole number. `VGG16` size was input-resolution dependent. Neither model had `AdaptiveAvgPool2d` unlike `ResNet18` | Added `AdaptiveAvgPool2d((1,1))` to both models. Updated `nn.Linear` input to `192` for `AlexNet` and `512` for `VGG16`. Added `avgpool` call in both `forward` methods | TBD |
| 6 | `models.py` | `TypeError` when computing loss — `ResNet18` cannot train | Last line of `ResNet18.forward()` was `self.classifier(out)` with no `return`. Method returned `None` implicitly | Added `return` to the last line: `return self.classifier(out)` | TBD |
| 7 | `models.py` | `ResNet18` does not learn — loss does not improve | `activation_str = "Identity"` was a module-level global. `ResNet18.__init__` always read the global ignoring `**kwargs`. `nn.Identity` has no non-linearity so the network behaved as a single linear layer | Removed the global. Read `activation_str` from `kwargs.get("activation_str", "ReLU")` inside `ResNet18.__init__` | TBD |
| 8 | `train.py` | Model learns nothing — loss stuck at random chance | `drop_rate=0.99` was hardcoded. 99% of neurons were zeroed every forward pass collapsing model capacity. `activation_str=None` was also passed which would crash if ever read | Replaced both with config reads: `drop_rate=config.get("DROP_RATE", 0.5)` and `activation_str=config.get("ACTIVATION", "ReLU")` | TBD |
| 9 | `train.py` | No test evaluation is ever performed | `get_loaders()` returns three loaders but the third was discarded with `_`. No code ran on the test set | Changed to `train_loader, val_loader, test_loader = get_loaders(...)` and added test evaluation after training | TBD |

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
