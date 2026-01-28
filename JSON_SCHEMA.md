# Esquema JSON: gameScript-es.json

## Visión General

El archivo `dist/data/gameScript-es.json` contiene todos los nodos (preguntas) y opciones del simulador. Está completamente desacoplado para permitir:

- ✅ Fácil edición sin tocar código
- ✅ Exportación/importación de contenido
- ✅ Reutilización en otros contextos educativos
- ✅ Internacionalización (gameScript-es.json, gameScript-en.json, etc.)
- ✅ A/B testing de contenido

---

## Estructura de Nodo (Node)

```json
{
  "id": 1,
  "time": "08:12",
  "text": "Te cuento po, me corté la mano...",
  "topic": "diat",
  "helpSection": "diat",
  "requiresMastery": null,
  "media": { "type": "image", "content": "dist/assets/hand.jpg" },
  "options": [ /* opciones aquí */ ]
}
```

### Campos de Nodo

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | número | ✅ | Identificador único del nodo (1-10) |
| `time` | string | ✅ | Timestamp del mensaje (ej: "08:12", "Martes, 08:55") |
| `text` | string | ✅ | Texto del mensaje de Nico |
| `topic` | string | ✅ | Tema pedagógico: diat, traslado, prestaciones, subsidio, licencia, trayecto, pruebas, trivia |
| `helpSection` | string\|null | ✅ | Sección de ayuda relacionada (ej: "diat", "prestaciones-medicas") |
| `requiresMastery` | string\|null | ✅ | Gate: si "diat", requiere ≥80% en tema diat antes de avanzar. null = sin gate |
| `media` | object\|null | ✅ | Media adjunto (imagen, documento, audio) o null |
| `options` | array | ✅ | Array de opciones de respuesta (1+ elementos) |

### Campos de Media

```json
{
  "type": "image",
  "content": "dist/assets/hand.jpg"
}
```

O para documentos:

```json
{
  "type": "document",
  "content": "dist/assets/licencia_medica.pdf",
  "fileName": "Licencia_Medica_Nico.pdf",
  "pages": "1 pág • PDF",
  "thumbnail": "dist/assets/blur.jpg"
}
```

**Tipos**: `image` | `document` | `audio`

---

## Estructura de Opción (Option)

```json
{
  "text": "Avísale de inmediato a tu jefatura para que emita la DIAT...",
  "score": 2,
  "maxScore": 2,
  "reaction": "¡Gracias, no sabía eso! Voy a buscar ayuda altiro.",
  "bossMessage": "✅ Bien hecho activando la DIAT dentro de 24 h...",
  "feedback": "✅ +2 pts. Activaste el proceso de denuncia y atención...",
  "cause": "La denuncia temprana asegura calificación y cobertura según Ley 16.744.",
  "recommendation": "Reporta TODO accidente de inmediato a jefatura o mutual/ISL...",
  "helpSection": "diat",
  "topic": "diat",
  "style": "truth"
}
```

### Campos de Opción

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `text` | string | ✅ | Texto visible de la opción |
| `score` | número | ✅ | Puntos que suma si se selecciona (0-2) |
| `maxScore` | número | ✅ | Puntuación máxima posible (típicamente 2) |
| `reaction` | string | ✅ | Reacción de Nico al seleccionar |
| `bossMessage` | string | ✅ | Mensaje de jefa sobre la respuesta |
| `feedback` | string | ✅ | Retroalimentación inmediata (con emoji de +/−pts) |
| `cause` | string\|null | ✅ | Análisis causal: POR QUÉ es correcta/incorrecta |
| `recommendation` | string\|null | ✅ | Recomendación accionable |
| `helpSection` | string\|null | ✅ | Sección de Ayuda donde aprender más |
| `topic` | string | ✅ | Tema de esta opción (puede diferir del nodo) |
| `style` | string\|null | ⚠️ | Solo para trivia: "truth" o "myth". Null en otros |

---

## Flujo de Datos

### En Modo Práctica (Practice Mode)

1. **Opciones se SHUFFLEAN**: `seededShuffle(options, gameState.step)`
   - Orden determinístico por paso
   - Mismo seed = mismo orden (consistente)
   - Usuario ve orden aleatorio pero reproducible

2. **Se muestran** `feedback` (inmediato) + `cause` + `recommendation`

3. **Gate bloqueante**: Si `requiresMastery` = "diat" y puntuación DIAT < 80%:
   - Se muestra mensaje de gate
   - Opción deshabilitada
   - Usuario debe mejorar en esa área

4. **Remediation**: Si errores en un tema ≥ 2:
   - Se dispara tarjeta de remediación
   - Muestra 3 bullets + 1 ejemplo contextualizado

### En Modo Evaluación (Evaluation Mode)

1. **Opciones mantienen orden original**: No se shufflean
   - Usuario ve opciones en orden definido en JSON
   - Más desafiante (sin desordenar)

2. **No se muestran** `feedback`, `cause`, `recommendation` hasta final
   - Solo se ve emoji de reacción
   - Usuario debe pensar sin hints

3. **Sin gates**: Todas opciones habilitadas
   - Puede fallar sin consecuencia
   - Score final al terminar

---

## Ejemplo Completo: Nodo 1

```json
{
  "id": 1,
  "time": "08:12",
  "text": "Te cuento po, me corté la mano con una lámina en el taller. ¿Qué hago? 😰",
  "topic": "diat",
  "helpSection": "diat",
  "requiresMastery": null,
  "media": {
    "type": "image",
    "content": "dist/assets/hand.jpg"
  },
  "options": [
    {
      "text": "Avísale de inmediato a tu jefatura para que emita la DIAT y te acompaño al centro de la mutual/ISL.",
      "score": 2,
      "maxScore": 2,
      "reaction": "¡Gracias, no sabía eso! Voy a buscar ayuda altiro.",
      "bossMessage": "✅ Bien hecho activando la DIAT dentro de 24 h y derivando al organismo administrador; así cumples la norma y aseguras atención inmediata.",
      "feedback": "✅ +2 pts. Activaste el proceso de denuncia y atención por el seguro laboral.",
      "cause": "La denuncia temprana dentro de 24 hrs asegura calificación y cobertura según Ley 16.744.",
      "recommendation": "Reporta TODO accidente de inmediato a jefatura o mutual/ISL para resguardar la salud del trabajador y cumplir la ley.",
      "helpSection": "diat",
      "topic": "diat",
      "style": null
    },
    {
      "text": "Dejate la venda nomás y veamos si se te pasa.",
      "score": 0,
      "maxScore": 2,
      "reaction": "¿Seguro? Es que sangra caleta…",
      "bossMessage": "❌ ¡Ojo! Ignorar un accidente grave puede traer sanciones y agravar la lesión.",
      "feedback": "❌ 0 pts. Minimizas el accidente y retrasas cobertura.",
      "cause": "No se activó la denuncia legal dentro del plazo de 24 hrs ni se aseguró cobertura por Ley 16.744.",
      "recommendation": "Reporta TODO accidente de inmediato a jefatura o mutual/ISL para resguardar la salud del trabajador y cumplir la ley.",
      "helpSection": "diat",
      "topic": "diat",
      "style": null
    }
  ]
}
```

---

## Tabla de Topics

| Topic | Secciones | Puerta |
|-------|-----------|--------|
| `diat` | Denuncia e investigación | Nodo 2 lo requiere |
| `traslado` | Transporte seguro | Nodo 3 |
| `prestaciones` | Cobertura médica gratuita | Nodos 4, 10 |
| `subsidio` | Ingresos durante reposo | Nodo 5 |
| `licencia` | Trámite licencia médica | Nodo 6 |
| `trayecto` | Cobertura ida/vuelta | Nodo 9 |
| `pruebas` | Acreditación de circunstancias | Nodo 7 |
| `trivia` | Validación de conocimientos | Nodos 8-10 |

---

## Tabla de Help Sections

| helpSection | Descripción |
|-------------|-------------|
| `diat` | Denuncia y calificación |
| `traslado` | Traslado y cobertura de gastos |
| `prestaciones-medicas` | Cobertura médica sin costo |
| `subsidio-incapacidad` | Subsidios por licencia |
| `trayecto` | Cobertura de trayecto |
| `organismo-administrador` | Organismo administrador (mutual/ISL) |

---

## Validación de JSON

El archivo debe cumplir:

✅ JSON válido (no trailing commas, quotes correctas)
✅ Todos los nodos tienen `id` único (1-10)
✅ Cada opción tiene `text`, `score`, `feedback`, `reaction`, `bossMessage`
✅ `topic` es válido (existe en script.js)
✅ `media.type` es: image, document, o audio
✅ `score` ≤ `maxScore`
✅ Sin campos typos (ej: `mesage` en lugar de `message`)

---

## Exportación a Otros Idiomas

Para crear `gameScript-en.json`:

```bash
# 1. Duplicar el archivo
cp dist/data/gameScript-es.json dist/data/gameScript-en.json

# 2. Traducir estos campos:
# - text
# - reaction
# - bossMessage
# - feedback
# - cause
# - recommendation

# 3. NO traducir:
# - id, time, topic, helpSection, requiresMastery, media, style
```

Estructura idéntica, solo contenido localizado.

---

## Actualizaciones Futuras

Si quieres agregar nodos o alterar el flujo:

1. **Nuevo nodo**: Incrementa `id`, agrega a array
2. **Nueva opción**: Agrega objeto con todos los campos
3. **Nueva sección**: Actualiza tabla `helpSection` en script.js
4. **Gate nuevo**: Agrega `"requiresMastery": "tema"` en nodo
5. **Trivia**: Usa `"style": "truth"` o `"style": "myth"`

**Validar siempre**:
- JSON syntax con: `cat dist/data/gameScript-es.json | jq .`
- O en DevTools: `fetch('dist/data/gameScript-es.json').then(r=>r.json()).then(console.log)`

---

Última actualización: Enero 2026
