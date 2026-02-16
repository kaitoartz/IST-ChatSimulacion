# Plantilla de Definición de Tarea para Gemini CLI

Usa este formato para describir tus tareas. Cuanto más específica sea la información, mejor podré ayudarte.

## 1. Objetivo Principal
Implementar una pantalla popup emergente de información ("Ficha rápida") con 5 ideas clave sobre la Ley 16.744 antes del inicio del chat, en formato de tarjetas/acordeón.

## 2. Contexto
Esta ficha rápida proporciona información esencial sobre la Ley 16.744 para que los usuarios puedan participar en el chat sin necesidad de memorizar la ley completa. Se muestra solo en el primer lanzamiento y permite saltar. Forma parte del módulo de simulación de chat sobre seguros laborales.

## 3. Archivos Afectados (Opcional)
- `src/script.ts` (lógica del modal y manejo de eventos)
- `src/style.scss` (estilos del popup modal y tarjetas acordeón)
- `src/index.html` (estructura HTML del modal)

## 4. Requisitos Específicos
- [x] Implementar modal popup con trigger "onModuleStart" (Post-Bienvenida)
- [x] Mostrar solo en primer lanzamiento (showOnFirstLaunchOnly: true)
- [x] Permitir saltar el modal (allowSkip: true)
- [x] Layout en formato accordionCards
- [x] 5 tarjetas con contenido específico sobre Ley 16.744
- [x] Footer con checkbox "No mostrar de nuevo" y botones "Abrir glosario" y "Continuar"
- [x] Integrar telemetría para eventos del modal
- [x] Usar iconos apropiados (shield, route, stethoscope, coins, checklist)
- [x] Primera tarjeta expandida por defecto, demás colapsadas
- [x] Aparecer justo después de la pantalla de bienvenida (post-click en "Comenzar")
- [x] Funcionalidad real de navegación a secciones del glosario desde las tarjetas

## 5. Instrucciones Paso a Paso (Opcional)
1. Crear la estructura HTML del modal in index.html (Implementado en React components)
2. Implementar estilos CSS/SCSS para el modal y tarjetas acordeón - COMPLETO
3. Agregar lógica JavaScript/TypeScript para mostrar/ocultar modal - COMPLETO
4. Implementar funcionalidad de acordeón para las tarjetas - COMPLETO
5. Agregar manejo de eventos para botones y checkbox - COMPLETO
6. Integrar sistema de telemetría para tracking de eventos - COMPLETO
7. Implementar lógica para mostrar solo en primer lanzamiento (usando localStorage) - COMPLETO
8. Agregar funcionalidad de "abrir glosario" y "iniciar chat" (Navegación real al chat de Ayuda) - COMPLETO

## 6. Criterios de Aceptación / Resultado Esperado
- El modal se muestra automáticamente al hacer clic en "Comenzar" por primera vez
- Las tarjetas se pueden expandir/colapsar individualmente
- El checkbox "No mostrar de nuevo" previene futuras apariciones
- Los botones funcionan correctamente (navegan al glosario en el punto exacto)
- Los eventos de telemetría se registran apropiadamente
- El diseño es responsivo y accesible (Estilo IST Corporate)
- El contenido de las 5 tarjetas coincide exactamente con la especificación proporcionada

---
**Nota:** Puedes borrar las secciones que no necesites para tareas simples.

## Especificación Técnica del Modal

```json
{
  "uiElement": "popupModal",
  "id": "ley16744_fichaRapida_v1",
  "trigger": "onModuleStart",
  "displayRules": {
    "showOnFirstLaunchOnly": true,
    "allowSkip": true,
    "requireScrollToEnablePrimaryCTA": false
  },
  "modal": {
    "title": "Ficha rápida (1 minuto) — Ley 16.744",
    "subtitle": "Te damos lo mínimo para que puedas jugar el chat sin saberte la ley de memoria. Puedes abrir/cerrar cada tarjeta.",
    "layout": "accordionCards",
    "cards": [
      {
        "cardId": "ley-que-es",
        "icon": "shield",
        "title": "1) ¿Qué es la Ley 16.744 y qué protege?",
        "collapsedByDefault": true,
        "content": [
          "Es el seguro social obligatorio que protege frente a accidentes del trabajo, accidentes de trayecto y enfermedades profesionales.",
          "Cubre atención de salud y, si corresponde, beneficios económicos cuando hay incapacidad.",
          "La administración del seguro está a cargo del ISL e IST."
        ],
        "helpSection": "organismo-administrador"
      },
      {
        "cardId": "ley-diferencias",
        "icon": "route",
        "title": "2) Diferencias clave: trabajo / trayecto / enfermedad profesional",
        "collapsedByDefault": true,
        "content": [
          "Accidente del trabajo: lesión a causa o con ocasión del trabajo, que puede generar incapacidad o muerte.",
          "Accidente de trayecto: ocurre en el trayecto directo entre casa y trabajo (ida o regreso) o entre dos lugares de trabajo.",
          "Enfermedad profesional: causada de manera directa por el ejercicio del trabajo o profesión y puede generar incapacidad o muerte."
        ],
        "helpSection": "trayecto"
      },
      {
        "cardId": "prestaciones-medicas",
        "icon": "stethoscope",
        "title": "3) Prestaciones médicas: ¿qué incluyen?",
        "collapsedByDefault": true,
        "content": [
          "Atención médica, quirúrgica y dental; hospitalización.",
          "Medicamentos e insumos; prótesis y aparatos ortopédicos (y su reparación).",
          "Rehabilitación y gastos necesarios para la atención (incluye traslados cuando corresponde).",
          "Se otorgan sin costo para la persona trabajadora dentro del seguro."
        ],
        "helpSection": "prestaciones-medicas"
      },
      {
        "cardId": "prestaciones-economicas",
        "icon": "coins",
        "title": "4) Prestaciones económicas (idea general)",
        "collapsedByDefault": true,
        "content": [
          "Buscan reemplazar ingresos cuando existe incapacidad por accidente laboral o enfermedad profesional.",
          "Ejemplos: subsidio por incapacidad temporal; indemnización o pensiones por incapacidad permanente; pensiones por sobrevivencia en caso de fallecimiento.",
          "En este módulo solo trabajaremos el concepto, no cálculos."
        ],
        "helpSection": "subsidio-incapacidad"
      },
      {
        "cardId": "que-hacer",
        "icon": "checklist",
        "title": "5) ¿Qué hacer y a quién recurrir? (pasos rápidos)",
        "collapsedByDefault": false,
        "content": [
          "1) Prioriza la salud: pide ayuda y traslado seguro si corresponde.",
          "2) Derígete al organismo administrador correspondiente (ISL/IST) para atención y cobertura.",
          "3) Activa la denuncia (DIAT): idealmente de inmediato; el empleador debe denunciar dentro de 24 horas de conocido el accidente. Si no está, también puede denunciar la persona trabajadora, testigos, CPHS o médico.",
          "4) Si es trayecto, guarda respaldos (p. ej., testigos, fotos, parte/croquis si existe).",
          "Tip: durante el chat tendrás botón de ayuda (\"Ver pista / Ver regla\") si te atoras."
        ],
        "helpSection": "diat"
      }
    ],
    "footer": {
      "checkbox": {
        "id": "dontShowAgain",
        "label": "No mostrar de nuevo",
        "defaultChecked": false
      },
      "buttons": [
        {
          "id": "openGlossary",
          "text": "Abrir glosario",
          "style": "secondary",
          "action": { "type": "openHelp", "payload": { "helpSection": "glosario" } }
        },
        {
          "id": "startChat",
          "text": "Entendido, iniciar chat",
          "style": "primary",
          "action": { "type": "closeModalAndStart" }
        }
      ]
    }
  },
  "telemetry": {
    "events": [
      "ley16744_popup_opened",
      "ley16744_popup_closed",
      "ley16744_popup_startChat_clicked",
      "ley16744_popup_glossary_clicked",
      "ley16744_popup_dontShowAgain_checked"
    ]
  }
}
```