---
name: license
description: License projects under the EUPL-1.2. Use when adding or replacing a LICENSE file, setting license metadata in Cargo.toml, package.json, or flake.nix, or writing the README license section.
---

# License

Projects are licensed under the EUPL-1.2-or-later.

## Sources

| Resource            | URL                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| How to use          | https://interoperable-europe.ec.europa.eu/collection/eupl/how-use-eupl                           |
| Licence texts       | https://interoperable-europe.ec.europa.eu/collection/eupl/eupl-text-eupl-12                      |
| Developers' version | https://joinup.ec.europa.eu/sites/default/files/custom-page/attachment/2020-03/EUPL-1.2%20EN.txt |

[files/LICENSE](files/LICENSE) is the English developers' version, downloaded unmodified.

## Files to Copy

| Skill file                     | Repository file |
| ------------------------------ | --------------- |
| [files/LICENSE](files/LICENSE) | `LICENSE`       |

## Files to Modify

| Repository file | Change                                    |
| --------------- | ----------------------------------------- |
| `Cargo.toml`    | `license = "EUPL-1.2+"`                   |
| `package.json`  | `"license": "EUPL-1.2+"`                  |
| `flake.nix`     | `meta.license = pkgs.lib.licenses.eupl12` |
| `README.md`     | License section with the notice below     |

## Notice

```text
Licensed under the EUPL.
```

## Key Rules

- copy `LICENSE` with `cp`, never retype or reformat it
- replace any existing licence only after confirming with the user
- remove leftover references to the previous licence
- refresh `files/LICENSE` only from the developers' version
