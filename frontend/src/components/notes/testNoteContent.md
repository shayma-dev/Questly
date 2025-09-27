Math — Calculus: Limits and Derivatives
Title: Calculus: Limits and Derivatives
Content:

# Limits and Derivatives

> Intuition: derivatives measure instantaneous rate of change.

- Limit notation: `lim_{x->a} f(x)`
- Derivative as a limit:
  - $f'(x) = lim_{h->0} (f(x+h) - f(x)) / h$ (just plain text here)

Common rules:

1. Power rule
2. Product rule
3. Chain rule

Example (numerical derivative with Python):

```python
def df(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2*h)

import math
print(df(math.sin, math.pi/3))  # ≈ cos(pi/3) = 0.5
```

Key idea:

- Continuity implies left and right limits agree.
- Differentiability implies continuity (but not vice‑versa).

Math — Quadratic Equations Quick Sheet
Title: Quadratic Equations Quick Sheet
Content:

# Quadratic Equations

The quadratic equation helps you find the roots of an equation, both real and imaginary roots. Without having to factorise the equation.
Standard form: `ax^2 + bx + c = 0`

Discriminant: `Δ = b^2 - 4ac`

| Δ value | Roots                    |
| ------: | ------------------------ |
|   Δ > 0 | Two distinct real roots  |
|   Δ = 0 | One real (repeated) root |
|   Δ < 0 | Complex conjugate roots  |

JavaScript helper:

```js
function quadratic(a, b, c) {
  const D = b * b - 4 * a * c;
  if (D < 0) return null; // complex case omitted for brevity
  const sqrtD = Math.sqrt(D);
  return [(-b - sqrtD) / (2 * a), (-b + sqrtD) / (2 * a)];
}
console.log(quadratic(1, -3, 2)); // [1, 2]
```

Tip: Complete the square to derive the quadratic formula.

Science — DNA vs RNA (Biology)
Title: DNA vs RNA (Biology)
Content:

# DNA vs RNA

- DNA: double‑stranded, deoxyribose sugar, bases A T C G
- RNA: single‑stranded (most), ribose sugar, bases A U C G

| Feature   | DNA         | RNA           |
| --------- | ----------- | ------------- |
| Sugar     | Deoxyribose | Ribose        |
| Bases     | A T C G     | A U C G       |
| Strands   | Double      | Single (most) |
| Stability | High        | Lower         |

Simple transcription mapping:

```python
def dna_to_mrna(dna):
    return dna.upper().replace("T", "U")

print(dna_to_mrna("ATGCTT"))  # AUGCUU
```

> Remember: Uracil (U) replaces Thymine (T) in RNA.

Science — Kinematics Cheatsheet
Title: Kinematics Cheatsheet
Content:

# Kinematics

Key equations (constant acceleration):

- `v = v0 + a t`
- `s = s0 + v0 t + 0.5 a t^2`
- `v^2 = v0^2 + 2 a (s - s0)`

Projectile range (no air resistance):

```js
const g = 9.81;
function range(v0, angleDeg) {
  const θ = (angleDeg * Math.PI) / 180;
  return (v0 * v0 * Math.sin(2 * θ)) / g;
}
console.log(range(20, 45).toFixed(2), "meters");
```

Note: Units matter. Keep SI units for consistency.

History — World War II Snapshot
Title: World War II Snapshot
Content:

# World War II Snapshot

> 1939–1945: Global conflict reshaping geopolitics.

Highlights:

- 1939: Invasion of Poland
- 1941: Operation Barbarossa; Pearl Harbor
- 1944: D‑Day landings in Normandy
- 1945: VE Day (May); VJ Day (Sept)

Quick reference (YAML style for readability):

```yaml
theaters:
  - Europe
  - Pacific
turning_points:
  - "Stalingrad (1942-43)"
  - "Midway (1942)"
  - "Normandy (1944)"
```

Primary sources: speeches, letters, official communiqués.

History — Primary vs Secondary Sources
Title: Primary vs Secondary Sources
Content:

# Primary vs Secondary Sources

- Primary: created during the time under study (letters, diaries, photos).
- Secondary: analyses/interpretations (textbooks, articles).

Checklist:

1. Who created the source?
2. When/where was it produced?
3. Intended audience and purpose?

Command mnemonic (just to test bash highlighting):

```bash
# Remember P-A-P: Provenance, Audience, Purpose
echo "Provenance -> Audience -> Purpose"
```
