# AUDIT_LOG.md
# BioHealth Diagnostics — Operation Cyber-Histology
# Incident Audit Log — Recovered Codebase Bug Tracker

## Overview

This document itemizes every bug, corruption, and anti-pattern discovered
in the recovered draft codebase in the logical order they must be fixed.
Each entry documents the file, manifestation, root cause, correction
implemented, and the git commit hash containing the fix.

---

## Audit Table

| # | File | How it manifests | Mathematical / Logical root cause | Correction implemented | Commit hash |
|---|------|-----------------|-----------------------------------|----------------------|-------------|
| 1 | `config.json` | File completely empty — crashes on startup with `JSONDecodeError` before anything runs | `json.load()` on an empty file raises `json.JSONDecodeError` immediately. Every key accessed in `train.py` — `DATA`, `DATA_PATH`, `MODEL`, `CHANNELS`, `NUM_CLASSES`, `BATCH_SIZE`, `EPOCHS`, `LEARNING_RATE` — comes from this file. Nothing in the pipeline can execute without it. | Create `config.json` from scratch with all required keys: `DATA`, `DATA_PATH`, `MODEL`, `CHANNELS`, `NUM_CLASSES`, `BATCH_SIZE`, `EPOCHS`, `LEARNING_RATE`, `DROP_RATE`, `ACTIVATION`. | TBD |
| 2 | `config.json` | `NUM_CLASSES` key missing — `KeyError` crash when building model | Even after partial reconstruction `config.json` was missing `NUM_CLASSES`. `train.py` accessed it with hard bracket notation `config["NUM_CLASSES"]` which raises `KeyError` immediately before any model is built. Without this key no model can be instantiated. | Add `"NUM_CLASSES"` to `config.json` with the correct value per dataset. Use `config.get("NUM_CLASSES", 11)` in `train.py` as a safe fallback. | TBD |
| 3 | `data.py` | Training set includes validation samples — silent data leak corrupting all results | `train_data` was assigned the full `train_images` array with no upper bound slice. `val_data` correctly took `[val_start:]` but `train_data` was never sliced to `[:val_start]`. Both sets overlapped — the model updated weights on samples it later validated against, producing artificially inflated validation accuracy and an invalid generalisation signal. All reported metrics were dishonest. | Slice `train_data` and `train_labels` to `[:val_start]` so the two splits are mutually exclusive and no sample appears in both sets. | TBD |
| 4 | `fit.py` | Gradients accumulate across batches causing explosion or NaN loss | `optimizer.zero_grad()` was completely absent from `train_one_epoch`. PyTorch accumulates gradients in `.grad` tensors by default rather than replacing them. Without zeroing, each backward pass adds to all previous gradients. After N batches the effective gradient magnitude is N times the correct value, causing loss to diverge or produce NaN values from batch 2 onwards. Parameter updates are mathematically wrong from the very first step. | Add `self.optimizer.zero_grad()` as the first statement inside the training loop before the forward pass. This ensures gradients are fresh for every batch. | TBD |
| 5 | `fit.py` | Python built-in `sum()` shadowed by counter variable — silent anti-pattern | Counter variable named `sum` overwrites Python's built-in `sum()` function for the entire scope of `train_one_epoch`. The `evaluate()` method correctly used `total`. While not an immediate crash in this specific context, it is a dangerous anti-pattern that silently breaks any future code in the same scope that calls the built-in `sum()`, and creates inconsistency within the same class. | Rename the counter variable from `sum` to `total` throughout `train_one_epoch` to match `evaluate()` and eliminate the shadowing risk entirely. | TBD |
| 6 | `models.py` | `activation_str` module-level global forces `nn.Identity` on all `ResNet18` instances — network is completely linear | `activation_str = "Identity"` was declared as a module-level global. `ResNet18.__init__` called `getattr(nn, activation_str)` which always read the global regardless of what was passed via `**kwargs`. `nn.Identity` has no non-linearity. A deep network with only identity activations collapses mathematically to a single affine transformation no matter how many layers it has. The model had effectively zero representational capacity beyond a linear classifier and could not learn any non-linear decision boundary. | Remove the module-level global entirely. Read `activation_str` from `kwargs.get("activation_str", "ReLU")` inside `ResNet18.__init__` so it is config-driven and defaults to `ReLU`. | TBD |
| 7 | `models.py` | `ResNet18.forward()` missing `return` statement — model outputs `None` causing immediate crash | The last line of `ResNet18.forward()` was `self.classifier(out)` with no `return` keyword. The classifier computation was performed but the result was silently discarded. The method implicitly returned `None`. When `Trainer` called `outputs = self.model(images)`, `outputs` was `None`. The next line `self.criterion(outputs, labels)` immediately threw a `TypeError` halting all training with `ResNet18` before a single weight update occurred. | Add `return` to the final line: `return self.classifier(out)`. | TBD |
| 8 | `models.py` | `AlexNet.__init__` accepts only `**kwargs` — hardcodes `in_channels=3` and `num_classes=11` silently ignoring config | `AlexNet` did not accept `in_channels` or `num_classes` as explicit parameters. Both were hardcoded in the architecture. When `train.py` passed `in_channels=config["CHANNELS"]` and `num_classes=config["NUM_CLASSES"]` they were silently swallowed into `kwargs` and ignored. For any dataset that is not 3-channel or does not have exactly 11 classes the wrong architecture was built silently with no error or warning. | Add `in_channels` and `num_classes` as explicit positional parameters to `AlexNet.__init__`, matching the interface of `VGG16` and `ResNet18`. Use them in `nn.Conv2d(in_channels, ...)` and `nn.Linear(1024, num_classes)`. | TBD |
| 9 | `models.py` | `VGGBlock` applies `padding=1` to 1×1 convolutions causing spatial dimension distortion | `VGGBlock.__init__` had a single `padding=1` default parameter applied to every `nn.Conv2d` including the 1×1 tail conv in config-C blocks. Applying `padding=1` to a 1×1 kernel increases spatial dimensions by 2 in both H and W per block that uses config-C. This produces unexpectedly large feature maps and a shape mismatch when the flattened tensor reaches the first `nn.Linear` layer, causing an immediate runtime crash. | Compute padding per iteration inside the loop: `padding = 0 if is_config_c_tail else 1`. Remove the `padding` parameter from the function signature entirely since it is now computed internally. | TBD |
| 10 | `models.py` | `VGGBlock` never updates `current_in_channels` inside the conv loop — channel mismatch crash | `current_in_channels` was initialised to `in_channels` before the loop but never updated to `out_channels` after each iteration. In blocks with `num_convs > 1` every conv after the first still used the original `in_channels` as its input channel count. After the first conv outputs `out_channels` feature maps, the second conv expects `out_channels` as input but receives `in_channels`, producing a channel dimension mismatch crash at runtime for any `VGGBlock` with `num_convs >= 2`. | Add `current_in_channels = out_channels` at the end of each loop iteration so each subsequent conv receives the correct input channel count. | TBD |
| 11 | `models.py` | `AlexNet` missing `BatchNorm2d` after three middle conv layers — inconsistent normalisation | The first two conv layers of `AlexNet` each had `nn.BatchNorm2d`. The last three conv layers had no `BatchNorm`, going straight `Conv → ReLU → Conv → ReLU → Conv → ReLU`. This inconsistency means deeper conv layers receive unnormalised inputs while earlier ones do not, causing inconsistent gradient magnitudes across the network and unstable training especially for deeper feature maps that accumulate more representational variance. | Add `nn.BatchNorm2d` after each of the three middle conv layers (`256`, `256`, `192` channels) to make normalisation consistent throughout the entire feature extractor. | TBD |
| 12 | `models.py` | `AlexNet` and `VGG16` missing `AdaptiveAvgPool2d` — hardcoded `nn.Linear(2048,...)` causes shape crash | Both models went directly from `self.features(x)` to `torch.flatten(x, 1)` with no adaptive pooling. `nn.Linear(2048, 1024)` was hardcoded. For `AlexNet`: 2048 / 192 output channels = 10.67 — not a whole number, mathematically impossible regardless of input size. For `VGG16`: valid only at one specific resolution. Any other input size or dataset crashes with a shape mismatch at the `nn.Linear` layer. `ResNet18` already correctly used `AdaptiveAvgPool2d((1,1))` making this an inconsistency across the model registry. | Add `self.avgpool = nn.AdaptiveAvgPool2d((1, 1))` to both `__init__` methods. Add `x = self.avgpool(x)` before `torch.flatten` in both `forward` methods. Update `nn.Linear` input sizes to `192` for `AlexNet` and `512` for `VGG16`. | TBD |
| 13 | `train.py` | `drop_rate=0.99` hardcoded — 99% of neurons zeroed, training capacity destroyed | `model_class(..., drop_rate=0.99, ...)` was hardcoded in `train.py`, completely bypassing whatever `DROP_RATE` may be in `config.json`. A dropout probability of 0.99 zeros 99% of neurons every forward pass during training. The effective model capacity collapses to near-zero. The network cannot propagate meaningful gradients and loss plateaus at random-chance performance regardless of architecture or learning rate. This is the single most damaging training configuration bug. | Read dropout rate from config: `drop_rate=config.get("DROP_RATE", 0.5)`. Add `"DROP_RATE": 0.5` to `config.json`. | TBD |
| 14 | `train.py` | `activation_str=None` passed as kwarg — latent crash if ever correctly read | `train.py` passed `activation_str=None` to the model constructor. If `ResNet18` had correctly read this via `kwargs.get("activation_str")`, calling `getattr(nn, None)` would raise a `TypeError`. This was silently masked by bug 6 (global ignored kwargs) but represents a latent crash waiting to surface once that bug is fixed. | Pass a valid string from config: `activation_str=config.get("ACTIVATION", "ReLU")`. Add `"ACTIVATION": "ReLU"` to `config.json`. | TBD |
| 15 | `train.py` | `test_loader` discarded with `_` — no held-out test evaluation ever performed | `train_loader, val_loader, _ = get_loaders(...)` discarded the test loader with `_`. No final held-out evaluation was ever performed. The project specification explicitly requires test set performance metrics including accuracy, precision, recall, and macro F1-score. Without this the pipeline produces no reportable results. | Capture the test loader: `train_loader, val_loader, test_loader = get_loaders(...)`. Add full test evaluation after training using all required metrics. | TBD |

---

## Bug Category Summary

| Category | Bugs | Files affected |
|----------|------|----------------|
| Infrastructure / config | 2 | `config.json` |
| Silent logical flaws | 2 | `data.py`, `fit.py` |
| Numerical / gradient failures | 3 | `fit.py`, `models.py`, `train.py` |
| Crashing / runtime errors | 6 | `models.py`, `train.py` |
| Rigid infrastructure | 2 | `train.py`, `config.json` |
| **Total** | **15** | **All files** |

---

## Commit Message Convention

Each bug was fixed in a separate commit following this format:

```
Fix [short description] — [filename]
```

Examples:
```
Fix empty config.json — create from scratch
Fix NUM_CLASSES missing from config.json
Fix data leak in train/val split — data.py
Fix missing zero_grad before forward pass — fit.py
Fix sum variable shadowing built-in — fit.py
Fix Identity activation global — read from kwargs — models.py
Fix missing return in ResNet18.forward — models.py
Fix AlexNet hardcoded in_channels and num_classes — models.py
Fix VGGBlock padding=1 on 1x1 convolutions — models.py
Fix VGGBlock current_in_channels not updated — models.py
Fix AlexNet missing BatchNorm in middle convs — models.py
Fix AlexNet VGG16 missing AdaptiveAvgPool2d — models.py
Fix drop_rate hardcoded 0.99 — read from config — train.py
Fix activation_str=None — read from config — train.py
Fix test_loader discarded — add test evaluation — train.py
```

---

## How to retrieve commit hashes

After committing all fixes run:

```bash
git log --oneline
```

Copy each 7-character hash and replace the corresponding `TBD` entry above.

---

*Audit conducted by: [Your Name / Group Members]*
*Course: MAI/IDL SS26 — Final Assignment*
*Date: June 2026*
*Repository: https://github.com/YOUR_USERNAME/idl26_finalAssignment_MG*
