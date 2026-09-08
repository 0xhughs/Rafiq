# LOOP runtime identities

This directory stores snapshot manifests and extracted contract texts.
Manifests are excluded from candidate coverage so identity files do not hash themselves.

Commands (from repository root):

```
python3 .loop/identity.py contract
python3 .loop/identity.py snapshot --label baseline
python3 .loop/identity.py snapshot --label candidate
python3 .loop/identity.py both --label candidate
```
