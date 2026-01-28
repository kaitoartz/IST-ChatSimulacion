# IST-ChatSimulacion: Configuración de Quality-of-Life

## 1. Constantes de Tiempos Tunables

Todos los tiempos del simulador están centralizados en [dist/script.js](dist/script.js) (líneas 131-155) para fácil tunado sin buscar por el código:

```javascript
/* --- TIMING CONSTANTS (ms) --- */
// UI Feedback Timings
const TYPING_MS = 2000;           // Message typing delay
const PREDELAY_MS = 2000;         // Pre-message delay before text appears
const IMAGE_DELAY_MS = 5000;      // Delay before first image appears
const TEXT_DELAY_MS = 9000;       // Delay before initial text message
const REACTION_DELAY_MS = 600;    // Sticker/reaction display delay
const FOLLOWUP_DELAY_MS = 800;    // Follow-up message after reaction
const NOTIFICATION_SHOW_MS = 5000; // Notification visibility duration
const VIBRATION_MS = 200;         // Haptic feedback duration
const VIBRATION_RESET_MS = 300;   // Vibration state reset delay
const CONFETTI_MS = 2000;         // Confetti animation duration
const EVAL_MSG_DELAY_MS = 1500;   // Evaluation message display delay
const LINK_MSG_DELAY_MS = 1000;   // Contact link display delay
const ANSWER_FEEDBACK_MS = 1500;  // Correct/incorrect answer feedback delay
const FOLLOWUP_ANSWER_MS = 2000;  // Follow-up message after answer
const NEXT_NODE_DELAY_MS = 2500;  // Delay before next question node
const WRONG_ANSWER_DELAY_MS = 1500; // Wrong answer acknowledgment delay

// Inactivity Timings
const INACTIVITY_CALL_MS = 10000; // Trigger incoming call after inactivity
const IMAGE_TO_TEXT_MS = 5000;    // Time from image to initial message (IMAGE_DELAY_MS)
const TEXT_READY_MS = 9000;       // Time until options are ready

// Loading & Pre-game
const PRELOAD_START_MS = 800;     // Pre-game loading simulation
const MODE_SELECT_MS = 1500;      // Mode selection display delay
```

### Cambios Rápidos Comunes

#### Hacer la experiencia más rápida
```javascript
const TYPING_MS = 1000;           // Reduce from 2000
const PREDELAY_MS = 1000;         // Reduce from 2000
const ANSWER_FEEDBACK_MS = 800;   // Reduce from 1500
const NEXT_NODE_DELAY_MS = 1500;  // Reduce from 2500
const INACTIVITY_CALL_MS = 5000;  // Trigger call sooner
```

#### Hacer la experiencia más lenta/reflexiva
```javascript
const TYPING_MS = 3000;           // Increase from 2000
const ANSWER_FEEDBACK_MS = 2500;  // Increase from 1500
const NEXT_NODE_DELAY_MS = 4000;  // Increase from 2500
const INACTIVITY_CALL_MS = 15000; // Wait longer before call
```

---

## 2. PWA (Progressive Web App) - Offline Support

El simulador incluye soporte PWA para funcionar offline con caché inteligente.

### Archivos PWA Creados

- **[dist/service-worker.js](dist/service-worker.js)** - Service Worker con estrategia de caché
- **[dist/manifest.json](dist/manifest.json)** - Manifest PWA con iconos y metadatos
- **index.html actualizado** - Enlaces a manifest y registro del SW

### Cómo Funciona

1. **En Primera Visita**: El Service Worker se registra en `navigator.serviceWorker.register()`
2. **Instalación**: Se cachean todos los assets esenciales
3. **Estrategia de Caché**:
   - **Archivos JSON** (gameScript-es.json): Network first → Cache fallback
   - **Assets estáticos** (CSS, JS, imágenes, audio): Cache first → Network fallback
   - **External CDNs**: Se cachean después de primer download

### Activar PWA en Producción

Para usar offline en producción:

1. Servir HTTPS (requerido para Service Worker)
2. Incluir manifest.json válido (ya incluido)
3. Icons PWA en `dist/assets/` (icon-192x192.png, icon-512x512.png, etc.)

### Ventajas
- ✅ Funciona completamente offline después de primera carga
- ✅ Instalable como app nativa (iOS/Android)
- ✅ Caché automática de assets
- ✅ Sincronización de datos en background (preparado para futuro)

---

## 3. Virtualización (Opcional - Cuando Crece el Hilo)

Si el simulador crece mucho (más de 50-100 mensajes), considera virtualizar el chat:

### Instalación (cuando sea necesario)

```bash
npm install react-window
# o desde esm.sh
import { FixedSizeList } from "https://esm.sh/react-window";
```

### Implementación Futura

```javascript
// Envolver ChatInterface messages en FixedSizeList
const MessageRow = ({ index, style }) => (
  <div style={style}>
    {messages[index]}
  </div>
);

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={80}
  width="100%"
>
  {MessageRow}
</FixedSizeList>
```

**Cuando Usar**: Solo si la lista de mensajes crece más allá de lo manejable (~100+ mensajes)

---

## 4. Testing Rápido de Cambios

### Verificar Service Worker

```javascript
// En DevTools Console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Active SWs:', regs);
});

// Ver cachés
caches.keys().then(names => console.log('Caches:', names));
```

### Simular Offline

1. DevTools → Network tab → "Offline" checkbox
2. Recargar página
3. El app debe funcionar con assets cacheados

### Limpiar Caché

```javascript
// En Console
caches.keys().then(names => {
  Promise.all(names.map(n => caches.delete(n)));
});
```

---

## 5. Resumen de Changes

✅ **Tiempos Centralizados**: 20 constantes de tiempo en un solo lugar (líneas 131-155)
✅ **PWA Habilitado**: Service Worker + Manifest + HTML actualizado
✅ **Offline-First**: Caché estratégica (Network first para datos, Cache first para assets)
✅ **Virtualización Preparada**: Comentarios y referencias para react-window
✅ **Accesible**: Todos los tiempos son tunables sin buscar en el código

---

## 6. Próximos Pasos Opcionales

1. **Agregar icons PWA** en `dist/assets/icon-*.png` (192x192, 512x512)
2. **Implementar Virtualización** si mensajes > 100
3. **Background Sync** para sincronizar resultados en background
4. **Web Share API** para compartir resultados
5. **Notificaciones Push** (opcional, requiere backend)

---

Última actualización: Enero 2026
