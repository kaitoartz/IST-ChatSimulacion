
import React, { StrictMode, useEffect, useLayoutEffect, useRef, useState, useMemo, useReducer } from "https://esm.sh/react";
import { motion, AnimatePresence } from "https://esm.sh/framer-motion";
import { createRoot } from "https://esm.sh/react-dom/client";
import remarkGfm from "https://esm.sh/remark-gfm";
import { 
	Send, 
	ArrowLeft, 
	MoreVertical, 
	Phone, 
	Video, 
	Camera, 
	Mic, 
	Paperclip, 
	Smile,
	Search,
	Check,
	Info,
	Bell,
	RotateCcw,
	XCircle,
	HardHat,
	Briefcase,
	User,
	Image as ImageIcon,
	Loader2,
	Play,
	Pause,
	FileText,
	Download,
	MoreHorizontal,
	CheckCircle,
    PhoneOff,
    Moon,
    SunMedium,
    Book,
    AlertCircle
} from "https://esm.sh/lucide-react";
import Markdown from "https://esm.sh/react-markdown";

// Agregar estilos CSS para accesibilidad
const style = document.createElement('style');
style.textContent = `
    button[role="button"]:focus {
        outline: 3px solid #0073ffff;
        outline-offset: 2px;
    }
    
    button[role="button"]:focus-visible {
        outline: 3px solid #0073ffff;
        outline-offset: 2px;
    }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
    React.createElement(StrictMode, null, 
        React.createElement(WhatsAppSimulator, null)
    )
);

/* --- AUDIO CONTEXT --- */
let audioContext = null;
let audioUnlocked = false;

const getAudioContext = () => {
	if (!audioContext) {
		const AudioContextClass = window.AudioContext || window.webkitAudioContext;
		audioContext = new AudioContextClass();
	}
	return audioContext;
};

const unlockAudio = async () => {
	if (audioUnlocked) return;
	try {
		const ctx = getAudioContext();
		if (ctx.state === 'suspended') {
			await ctx.resume();
		}
		// Play silent sound to unlock browser autoplay
		const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
		const source = ctx.createBufferSource();
		source.buffer = buf;
		source.connect(ctx.destination);
		source.start(0);
		audioUnlocked = true;
		console.log("Audio unlocked");
	} catch (e) {
		console.warn("Audio unlock failed:", e);
	}
};

const playAudio = (path, options = {}) => {
	const { volume = 0.5, fallbackSilent = true } = options;
	try {
		const audio = new Audio(path);
		audio.volume = volume;
		const playPromise = audio.play();
		
		if (playPromise !== undefined) {
			playPromise
				.catch(e => {
					if (fallbackSilent) {
						console.warn("Audio play failed, continuing silently:", path, e);
					} else {
						console.error("Audio play error:", path, e);
					}
				});
		}
	} catch (e) {
		if (!fallbackSilent) {
			console.error("Audio error", e);
		} else {
			console.warn("Audio error (silent fallback):", e);
		}
	}
};

/* --- ASSETS --- */
const SOUND_SENT = "dist/assets/sounds/sent.mp3";
const SOUND_RECV = "dist/assets/sounds/received.mp3";
const RING_URL = "dist/assets/sounds/call.mp3"; // Updated call sound
const SOUND_NOTIFY = "dist/assets/sounds/notification.wav";
const IMAGE_PLACEHOLDER = "dist/assets/blur.jpg";
const AUDIO_MSG_SRC = "dist/assets/sounds/nico_audio.ogg"; 
const STICKER_THUMB = "dist/assets/sticker.png"; 
const DOC_ICON_PATH = "dist/assets/doc_icon.png"; // Placeholder
const HAND_IMG = "dist/assets/hand.jpg"; // Placeholder for Node 1
const LICENCIA_DOC = "dist/assets/licencia_medica.pdf"; // Placeholder for Node 6

/* --- TIMING CONSTANTS (ms) --- */
// UI Feedback Timings
const TYPING_MS = 2000;           // Message typing delay
const PREDELAY_MS = 2000;         // Pre-message delay before text appears
const IMAGE_DELAY_MS = 6000;      // Delay before first image appears
const TEXT_DELAY_MS = 10000;       // Delay before initial text message
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
const INACTIVITY_CALL_MS = 12000; // Trigger incoming call after inactivity
const IMAGE_TO_TEXT_MS = 5000;    // Time from image to initial message (IMAGE_DELAY_MS)
const TEXT_READY_MS = 9000;       // Time until options are ready

// Loading & Pre-game
const PRELOAD_START_MS = 800;     // Pre-game loading simulation
const MODE_SELECT_MS = 1500;      // Mode selection display delay

const assetsToPreload = [
	SOUND_SENT, SOUND_RECV, RING_URL, SOUND_NOTIFY, AUDIO_MSG_SRC,
	HAND_IMG, "dist/assets/logo.png", "dist/assets/nico.jpg"
];

const preloadAssets = async () => {
	const ctx = getAudioContext();
	const promises = assetsToPreload.map(url => {
		if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
			return fetch(url).then(r => r.arrayBuffer()).then(buf => {
				try {
					ctx.decodeAudioData(buf);
				} catch (e) {
					console.warn("Audio decode warning:", url, e);
				}
			}).catch(e => console.warn("Preload error:", url, e));
		} else {
			return fetch(url).catch(e => console.warn("Preload error:", url, e));
		}
	});
	await Promise.all(promises);
};

/* --- GAME DATA --- */
const stickers = {
    ok: "dist/assets/sticker-ok.webp", 
    gg: "dist/assets/sticker-gg.webp"
};

let gameScript = [];
const gameScriptPromise = fetch("dist/data/gameScript-es.json")
    .then(res => res.json())
    .then(data => {
        gameScript = data || [];
        return gameScript;
    })
    .catch(err => {
        console.error("No se pudo cargar gameScript", err);
        return [];
    });

const getGameScript = async () => {
    if (gameScript.length) return gameScript;
    return gameScriptPromise;
};

const PASSING_SCORE = 14; 

const initialGameState = { 
	step: 0, 
	score: 0, 
	status: "idle", 
	isFinished: false, 
	isTerminated: false,
	mode: null, // 'practice' or 'evaluation'
	topicScores: {}, // Track scores by topic for domain mastery
	topicAttempts: {} // Track attempts by topic
};

const gameReducer = (state, action) => {
	switch (action.type) {
		case "RESET":
			return { ...initialGameState, status: action.status || initialGameState.status, mode: state.mode };
		case "SET_MODE":
			return { ...state, mode: action.value };
		case "ADD_SCORE":
			return { ...state, score: state.score + (action.value || 0) };
		case "SET_SCORE":
			return { ...state, score: action.value ?? state.score };
		case "UPDATE_TOPIC_SCORE": {
			const { topic, score, maxScore } = action;
			const currentTopic = state.topicScores[topic] || { earned: 0, possible: 0 };
			return {
				...state,
				topicScores: {
					...state.topicScores,
					[topic]: {
						earned: currentTopic.earned + score,
						possible: currentTopic.possible + maxScore
					}
				}
			};
		}
		case "RECORD_ATTEMPT": {
			const { topic } = action;
			return {
				...state,
				topicAttempts: {
					...state.topicAttempts,
					[topic]: (state.topicAttempts[topic] || 0) + 1
				}
			};
		}
		case "ADVANCE_STEP":
			return { ...state, step: state.step + 1 };
		case "SET_STEP":
			return { ...state, step: action.value ?? state.step };
		case "SET_STATUS": {
			const status = action.value || state.status;
			return { ...state, status, isFinished: status === "finished", isTerminated: status === "terminated" };
		}
		case "FINISH":
			return { ...state, status: "finished", isFinished: true };
		case "TERMINATE":
			return { ...state, status: "terminated", isTerminated: true };
		default:
			return state;
	}
};

const getEvaluationMessage = (score) => {
	const TOTAL_SCORE = 18; // 14 base + 4 bonus
	let msg = `🏁 **Evaluación Final**\n\n🎯 **Puntaje: ${score}/${TOTAL_SCORE}**\n\n`;
	
	const percentage = (score / TOTAL_SCORE) * 100;

	if (percentage < 50) msg += "⚠️ **Nivel: En proceso**\nDebes reforzar los pasos y coberturas de la Ley 16.744.";
	else if (percentage < 80) msg += "👍 **Nivel: Logro parcial**\nTienes buen criterio, pero faltan ajustar algunos detalles.";
	else msg += "🏆 **Nivel: Logro esperado**\n¡Excelente! Manejas la orientación correcta y oportuna.";
	
	if (score >= PASSING_SCORE) {
		msg += "\n\n✅ **Curso Aprobado**";
	} else {
		msg += "\n\n❌ **Curso Reprobado**";
	}
	return msg;
};

/* --- DETERMINISTIC SHUFFLE --- */
function mulberry32(seed) {
	let t = seed + 0x6d2b79f5;
	return () => {
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}

function seededShuffle(arr, seed = 1) {
	const rnd = mulberry32(seed || 1);
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rnd() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

/* --- PERFORMANCE HOOKS --- */
function useIsVisible(ref, options = { threshold: 0.1 }) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (!ref.current) return;

		const observer = new IntersectionObserver(([entry]) => {
			setIsVisible(entry.isIntersecting);
		}, options);

		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [options]);

	return isVisible;
}

const ChatText = {
	p({ node, ...rest }) {
		return React.createElement("p", Object.assign({ className: "msg-text" }, rest));
	},
	ul({ node, ...rest }) {
		return React.createElement("ul", Object.assign({ className: "msg-list" }, rest));
	}
};

/* --- COMPONENTS --- */

function SplashScreen({ isLoading, preloadProgress = 0 }) {
	const [fadeOut, setFadeOut] = useState(false);

	useEffect(() => {
		if (!isLoading) {
			setFadeOut(true);
		}
	}, [isLoading]);

	if (!isLoading && !fadeOut) return null;

	const progressPercent = Math.min((preloadProgress / assetsToPreload.length) * 100, 100);

	return React.createElement("div", { className: `splash-screen ${isLoading ? '' : 'hidden'}` },
		React.createElement("div", { className: "splash-content" },
			React.createElement("img", { src: "dist/assets/logo.png", className: "splash-logo", alt: "IST Educa" }),
			React.createElement(Loader2, { className: "splash-spinner", size: 48 }),
			React.createElement("p", { className: "splash-text" }, "Abriendo ISTeduca APP..."),
			React.createElement("div", { style: { width: '200px', height: '4px', background: '#e0e0e0', borderRadius: '2px', marginTop: '20px', overflow: 'hidden' } },
				React.createElement("div", { style: { width: `${progressPercent}%`, height: '100%', background: '#00bcd4', transition: 'width 0.3s' } })
			)
		)
	);
}

function ProgressBar({ step, total }) {
	const current = Math.min(step + 1, total);
	const percentage = (current / total) * 100;

	return React.createElement("div", { className: "progress-bar-container" },
		Array.from({ length: total }).map((_, i) => 
			React.createElement("div", { 
				key: i, 
				className: `progress-step ${i <= step ? 'active' : ''}` 
			})
		)
	);
}

const getAvatarBg = (type) => {
	switch(type) {
		case 'nico': return 'transparent'; // Image covers it
		case 'jefe': return 'linear-gradient(135deg, #4f0b7b, #cb348c)'; 
		case 'eval': return '#4CAF50';
		default: return '#ccc';
	}
};

const renderAvatar = (type) => {
	switch(type) {
		case 'nico': return React.createElement("img", { src: "dist/assets/nico.jpg", alt: "Avatar de Nico", style: { width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' } });
		case 'jefe': return React.createElement(Briefcase, { size: 24 });
		case 'eval': return React.createElement(Check, { size: 24 });
		default: return React.createElement(User, { size: 24 });
	}
};

/* Updated AudioBubble to match WhatsApp Style (Avatar inside) */
/* Updated AudioBubble to match WhatsApp Style (Avatar inside) */
function AudioBubble({ src, duration = "0:15", withAvatar = false, onPlay }) {
	const [isPlaying, setIsPlaying] = useState(false);
    const [played, setPlayed] = useState(false);
	const audioRef = useRef(null);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const updateProgress = () => {
			if (audio.duration) {
				setProgress((audio.currentTime / audio.duration) * 100);
			}
		};

		const handleEnded = () => {
			setIsPlaying(false);
			setProgress(0);
            setPlayed(true);
		};

		audio.addEventListener('timeupdate', updateProgress);
		audio.addEventListener('ended', handleEnded);
		return () => {
			audio.removeEventListener('timeupdate', updateProgress);
			audio.removeEventListener('ended', handleEnded);
		};
	}, []);

	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isPlaying) {
			audio.pause();
		} else {
            setPlayed(true);
			audio.play();
			if (onPlay) onPlay();
		}
		setIsPlaying(!isPlaying);
	};

	return React.createElement("div", { className: "audio-bubble" },
    
    // 1. El Audio tag invisible
    React.createElement("audio", { ref: audioRef, src: src }),

    // 2. El Avatar (opcional)
    withAvatar && React.createElement("div", { className: "audio-avatar-container" },
        React.createElement("img", { src: "dist/assets/nico.jpg", className: "audio-internal-avatar", alt: "Avatar de Nico" }),
        React.createElement("div", { className: "audio-mic-badge" }, 
            React.createElement(Mic, { size: 15, color: played ? "#0073ffff" : "#4f4f4f" })
        )
    ),

    // 3. El Botón de Play (Se queda a la izquierda)
    React.createElement("button", { className: "audio-play-btn", onClick: togglePlay },
        isPlaying 
            ? React.createElement(Pause, { size: 18, fill: "currentColor" }) 
            : React.createElement(Play, { size: 18, fill: "currentColor" })
    ),

    // 4. EL ARREGLO: Un wrapper para que el Track y la Info no se escapen
    React.createElement("div", { className: "audio-content-wrapper" }, 
        
        // El Track (Ondas)
        React.createElement("div", { className: "audio-track" },
            React.createElement("div", { className: "audio-progress", style: { width: `${progress}%` } }),
            React.createElement("div", { className: "audio-waveform" }, 
                Array.from({length: 20}).map((_, i) => 
                    React.createElement("span", { key: i, style: { height: `${30 + Math.random() * 70}%` } }) 
                )
            )
        ),

        // La Info (Duración)
        React.createElement("div", { className: "audio-info" },
            React.createElement("span", { className: "audio-duration" }, duration),
            // Si quieres poner los tickets azules o algo así, va acá
            React.createElement("span", { className: "audio-status" }) 
        )
    )
);
}

function TypingBubble() {
	return React.createElement("div", { className: "wa-bubble wa-bubble-ai", style: { padding: '12px 16px', width: 'fit-content' } },
		React.createElement("div", { className: "wa-typing-dots" },
			React.createElement("span", null),
			React.createElement("span", null),
			React.createElement("span", null)
		)
	);
}

function ConfettiLayer({ confetti }) {
	const ref = useRef(null);
	const isVisible = useIsVisible(ref);

	if (!isVisible) return null;

	return React.createElement("div", { ref: ref, style: { position: 'absolute', inset: 0, pointerEvents: 'none' } },
		confetti.map(c => 
			React.createElement("div", { 
				key: c.id, 
				className: "floating-emoji", 
				style: { left: `${c.x}%` } 
			}, c.emoji)
		)
	);
}

function MessageBubble({ msg, chatId, renderContent, onNavigateHelp }) {
	const ref = useRef(null);
	const isVisible = useIsVisible(ref, { threshold: 0.05 });

	return React.createElement("div", { 
		ref: ref,
		id: msg.sectionId || msg.id,
		key: msg.id, 
		className: `wa-bubble wa-bubble-${msg.type} ${msg.type === 'audio' && chatId === 'nico' ? 'wa-bubble-audio-custom' : ''} ${msg.type === 'image' && chatId === 'nico' ? 'wa-bubble-image-custom' : ''} ${msg.type === 'contact_link' ? 'wa-bubble-ai' : ''}`, 
		style: msg.type === 'contact_link' ? { padding: 0, background: 'transparent', maxWidth: '300px' } : {} 
	},
		isVisible && React.createElement("div", { className: "wa-bubble-content" },
			renderContent(),
			msg.type !== 'contact_link' && React.createElement("span", { className: "wa-msg-time" },
				msg.timestamp,
				msg.type === 'user' && React.createElement(Check, { size: 14, className: "wa-double-check" })
			),
			msg.helpSection && onNavigateHelp && React.createElement("button", {
				onClick: () => {
					onNavigateHelp('ayuda');
					setTimeout(() => {
						const section = document.getElementById(msg.helpSection);
						if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}, 300);
				},
				style: {
					marginTop: '8px',
					padding: '6px 12px',
					background: '#0ea5e9',
					color: 'white',
					border: 'none',
					borderRadius: '6px',
					fontSize: '12px',
					fontWeight: '600',
					cursor: 'pointer',
					display: 'inline-flex',
					alignItems: 'center',
					gap: '4px'
				}
			}, React.createElement(Book, { size: 14 }), "Ver fundamento")
		)
	);
}

const remediationContent = {
	diat: {
		title: "📋 Repaso: DIAT",
		bullets: [
			"La DIAT debe hacerse dentro de 24 hrs del accidente",
			"Puede denunciar el empleador, trabajador, testigo, médico o CPHS",
			"Se presenta al organismo administrador (IST/ISL)"
		],
		example: "💡 Ejemplo: Si Nico se corta en el taller a las 10:00, debe denunciarse antes de las 10:00 del día siguiente, aunque la jefa no esté."
	},
	trayecto: {
		title: "🚗 Repaso: Accidente de trayecto",
		bullets: [
			"Cubre trayecto directo habitual entre casa↔trabajo",
			"Desvíos personales rompen la cobertura",
			"Se requiere documentar con parte, fotos o testigos"
		],
		example: "💡 Ejemplo: Si tomas un desvío para ir al supermercado, ese tramo no está cubierto."
	},
	prestaciones: {
		title: "🏥 Repaso: Prestaciones médicas",
		bullets: [
			"Las prestaciones se otorgan gratuitamente",
			"No hay copagos, reembolsos ni cobros al trabajador",
			"Cubre atención, medicamentos, procedimientos, rehabilitación"
		],
		example: "💡 Ejemplo: Si Nico se atiende en el IST, no paga nada: consulta, remedios y suturas son gratis."
	},
	traslado: {
		title: "🚑 Repaso: Traslado de urgencia",
		bullets: [
			"El traslado y sus gastos son cobertura de la Ley 16.744",
			"En urgencias vitales, excepcionalmente puede usarse cualquier centro (posterior derivación obligatoria)",
			"Idealmente debe derivarse al organismo administrador para evitar cobros y garantizar continuidad"
		],
		example: "💡 Ejemplo: Si hay sangrado severo, requiere ambulancia; los gastos corren por el organismo. Luego se deriva a red del OA."
	},
	subsidio: {
		title: "💰 Repaso: Subsidio e incapacidad",
		bullets: [
			"Las prestaciones médicas se otorgan gratuitamente independientemente del reposo",
			"El subsidio solo aplica si hay licencia médica (incapacidad temporal)",
			"Ambos se cubren por el organismo administrador"
		],
		example: "💡 Ejemplo: Nico puede volver a trabajar sin reposo, pero sus remedios y controles siguen siendo gratuitamente otorgados por el OA."
	},
	licencia: {
		title: "📜 Repaso: Trámite de licencias",
		bullets: [
			"La licencia 5/6 debe presentarse dentro de 3 días hábiles",
			"Si la empresa no puede, el trabajador la presenta directo al organismo",
			"No se debe esperar; los plazos son fatales"
		],
		example: "💡 Ejemplo: Si RR.HH. no recibe la licencia, Nico la lleva personalmente al IST."
	}
};

function ModeSelector({ onSelectMode }) {
	return React.createElement("div", { className: "mode-overlay" },
		React.createElement("div", { className: "mode-notifications-container" },
			// Practice Mode Notification
			React.createElement("div", { 
				className: "mode-notification-card", 
				onClick: () => onSelectMode('practice'),
				role: "button",
				"aria-label": "Seleccionar Modo Práctica"
			},
				React.createElement("div", { className: "mode-icon-box", style: { background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' } }, "📚"),
				React.createElement("div", { className: "mode-info" },
					React.createElement("div", { className: "mode-header" },
						React.createElement("span", { className: "mode-title" }, "Modo Práctica"),
						React.createElement("span", { className: "mode-time" }, "ahora")
					),
					React.createElement("div", { className: "mode-desc" }, "Pistas activadas • Feedback inmediato")
				)
			),

			// Evaluation Mode Notification
			React.createElement("div", { 
				className: "mode-notification-card", 
				onClick: () => onSelectMode('evaluation'),
				role: "button",
				"aria-label": "Seleccionar Modo Evaluación"
			},
				React.createElement("div", { className: "mode-icon-box", style: { background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' } }, "🎯"),
				React.createElement("div", { className: "mode-info" },
					React.createElement("div", { className: "mode-header" },
						React.createElement("span", { className: "mode-title" }, "Modo Evaluación"),
						React.createElement("span", { className: "mode-time" }, "ahora")
					),
					React.createElement("div", { className: "mode-desc" }, "Sin pistas • Puntaje final")
				)
			)
		)
	);
}

function RemediationCard({ topic, onClose }) {
	const content = remediationContent[topic];
	if (!content) return null;

	return React.createElement("div", {
		style: {
			position: 'fixed',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			zIndex: 9998,
			background: 'white',
			padding: '20px',
			borderRadius: '12px',
			boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
			maxWidth: '90%',
			width: '340px',
			border: '2px solid #f59e0b'
		}
	},
		React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' } },
			React.createElement("h3", { style: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#f59e0b' } }, content.title),
			React.createElement("button", {
				onClick: onClose,
				style: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '4px', color: '#6b7280' }
			}, "×")
		),
		React.createElement("ul", { style: { margin: '12px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' } },
			...content.bullets.map((b, i) => React.createElement("li", { key: i }, b))
		),
		React.createElement("div", {
			style: {
				background: '#fef3c7',
				padding: '12px',
				borderRadius: '8px',
				fontSize: '13px',
				marginTop: '12px',
				borderLeft: '3px solid #f59e0b'
			}
		}, content.example),
		React.createElement("button", {
			onClick: onClose,
			style: {
				width: '100%',
				marginTop: '16px',
				padding: '10px',
				background: '#f59e0b',
				color: 'white',
				border: 'none',
				borderRadius: '8px',
				fontWeight: '600',
				cursor: 'pointer'
			}
		}, "Entendido")
	);
}

function NotificationBanner({ message, show, onClick, title = "LA JEFA", icon = "👩‍💼" }) {
	if (!show || !message) return null;

	return React.createElement("div", { className: `ios-notification ${show ? 'show' : ''}`, onClick: onClick },
		React.createElement("div", { className: "ios-notif-header" },
			React.createElement("div", { className: "ios-notif-icon" }, icon),
			React.createElement("span", { className: "ios-notif-title" }, title),
			React.createElement("span", { className: "ios-notif-time" }, "ahora")
		),
		React.createElement("div", { className: "ios-notif-body" },
			message
		)
	);
}

/* --- SST WIDGET HELPERS --- */

const NOTIFY_URL = "dist/assets/sounds/notification.wav";

function useAudio(url) {
  const ref = useRef(null);
  useEffect(() => {
    const a = new Audio(url);
    a.preload = "auto";
    ref.current = a;
    return () => { a.pause(); ref.current = null; };
  }, [url]);
  return {
    play: async () => {
      await unlockAudio();
      try {
        return await ref.current?.play?.();
      } catch (e) {
        console.warn("Audio play failed:", url, e);
      }
    },
    stop: () => { if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; } },
  };
}

function useSfx(url, options = {}) {
  const { volume = 0.5 } = options;
  const ref = useRef(null);
  useEffect(() => {
    const a = new Audio(url);
    a.preload = "auto";
    a.volume = volume;
    ref.current = a;
    return () => { a.pause(); ref.current = null; };
  }, [url, volume]);
  return {
    play: async () => {
      await unlockAudio();
      if (ref.current) {
        ref.current.currentTime = 0;
        try {
          await ref.current.play();
        } catch (e) {
          console.warn('SFX play failed:', url, e);
        }
      }
    }
  };
}

function IncomingCallModal({ open, callerName = "La Jefa", subtitle = "Llamada entrante", avatar = "👩🏻‍💼", onAnswer, onDecline }) {
  return React.createElement(AnimatePresence, null,
    open && React.createElement(motion.div, {
      className: "fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm",
      style: { zIndex: 9999 },
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
      React.createElement(motion.div, {
        initial: { y: 40, scale: 0.96, opacity: 0 },
        animate: { y: 0, scale: 1, opacity: 1 },
        exit: { y: 20, scale: 0.98, opacity: 0 },
        transition: { type: "spring", stiffness: 190, damping: 18 },
        className: "mx-4 w-[92%] max-w-sm rounded-2xl bg-white p-6 text-slate-800 shadow-2xl dark:bg-slate-900 dark:text-slate-100"
      },
        React.createElement("div", { className: "flex flex-col items-center gap-3" },
          React.createElement("div", { className: "text-6xl select-none" }, avatar),
          React.createElement("div", { className: "text-lg text-slate-500 dark:text-slate-400" }, subtitle),
          React.createElement("div", { className: "text-2xl font-semibold" }, callerName),
          React.createElement("div", { className: "mt-4 grid w-full grid-cols-2 gap-3" },
            React.createElement("button", {
              onClick: onDecline,
              className: "flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-medium text-white shadow hover:bg-red-600 active:scale-[0.98]"
            }, React.createElement(PhoneOff, { size: 20 }), " Rechazar"),
            React.createElement("button", {
              onClick: onAnswer,
              className: "flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white shadow hover:bg-emerald-600 active:scale-[0.98]"
            }, React.createElement(Phone, { size: 20 }), " Contestar")
          )
        )
      )
    )
  );
}



// Check if user has mastered a topic (≥80% correct)
const checkTopicMastery = (topicScores, topic, threshold = 0.8) => {
	const stats = topicScores[topic];
	if (!stats || stats.possible === 0) return false;
	return (stats.earned / stats.possible) >= threshold;
};

// Get mastery percentage for a topic
const getTopicMastery = (topicScores, topic) => {
	const stats = topicScores[topic];
	if (!stats || stats.possible === 0) return 0;
	return Math.round((stats.earned / stats.possible) * 100);
};

function AyudaLeyButton({ onClick }) {
  return React.createElement("button", {
    "aria-label": "Ayuda Ley 16.744",
    onClick: onClick,
    style: { 
      padding: '8px 16px', 
      background: '#0ea5e9', 
      color: 'white', 
      border:'none', 
      borderRadius: '10px', 
      cursor: 'pointer', 
      fontWeight: 600, 
      fontSize:'13px', 
      boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, React.createElement(Book, { size: 16 }), "📚 Ayuda");
}

function WhatsAppSimulator() {
    const [view, setView] = useState("list"); 
	const [activeChat, setActiveChat] = useState("nico");
	const [gameState, dispatchGame] = useReducer(gameReducer, initialGameState);
    const [isVibrating, setIsVibrating] = useState(false);
	const [isTyping, setIsTyping] = useState(false); // New Typing State
	const [confetti, setConfetti] = useState([]);
	const [notification, setNotification] = useState({ show: false, message: "", title: "LA JEFA", icon: "👩‍💼" });
	const [loading, setLoading] = useState(true);
	const [preloadProgress, setPreloadProgress] = useState(0);
	const [introPlayed, setIntroPlayed] = useState(false);
	const [scriptReady, setScriptReady] = useState(false);
	const [scriptData, setScriptData] = useState([]);
	const [errorsByTopic, setErrorsByTopic] = useState({});
	const [showRemediation, setShowRemediation] = useState(null);

	const [callOpen, setCallOpen] = useState(false);
    const [nicoStarted, setNicoStarted] = useState(false); // Start Flow flag
	const ring = useAudio(RING_URL);
	const notify = useAudio(NOTIFY_URL);
	const sfxSent = useSfx(SOUND_SENT);
	const sfxRecv = useSfx(SOUND_RECV);
	const sfxNotify = useSfx(SOUND_NOTIFY);
	
	// Ref to handle pending navigation safely
	const pendingNavRef = useRef(null);

	// Unlock audio on first user interaction
	useEffect(() => {
		const handleFirstInteraction = async () => {
			await unlockAudio();
			document.removeEventListener('click', handleFirstInteraction);
			document.removeEventListener('touchend', handleFirstInteraction);
		};
		document.addEventListener('click', handleFirstInteraction);
		document.addEventListener('touchend', handleFirstInteraction);
		return () => {
			document.removeEventListener('click', handleFirstInteraction);
			document.removeEventListener('touchend', handleFirstInteraction);
		};
	}, []);

	// Cleanup global: timers and sounds on unmount
	useEffect(() => {
		return () => {
			if (callTimerRef.current) clearTimeout(callTimerRef.current);
			ring.stop();
		};
	}, []);

	// Cleanup on game end
	useEffect(() => {
		if (gameState.isFinished || gameState.isTerminated) {
			if (callTimerRef.current) {
				clearTimeout(callTimerRef.current);
				callTimerRef.current = null;
			}
			setCallOpen(false);
			ring.stop();
		}
	}, [gameState.isFinished, gameState.isTerminated]);

	// Process pending navigation safely
	useEffect(() => {
		if (pendingNavRef.current) {
			const { targetChat, targetView } = pendingNavRef.current;
			setActiveChat(targetChat);
			setView(targetView);
			pendingNavRef.current = null;
		}
	});

	// Load game script and preload assets once
	useEffect(() => {
		const load = async () => {
			// Preload key assets
			const preloadAssetList = assetsToPreload.map(url => {
				if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
					return fetch(url)
						.then(r => r.arrayBuffer())
						.then(buf => {
							try {
								getAudioContext().decodeAudioData(buf);
								setPreloadProgress(p => p + 1);
							} catch (e) {
								console.warn("Audio decode:", e);
								setPreloadProgress(p => p + 1);
							}
						})
						.catch(e => {
							console.warn("Asset fetch:", e);
							setPreloadProgress(p => p + 1);
						});
				} else {
					return fetch(url)
						.catch(e => console.warn("Asset fetch:", e))
						.finally(() => setPreloadProgress(p => p + 1));
				}
			});
			await Promise.all(preloadAssetList);

			// Load game script
			getGameScript().then(data => {
				setScriptData(data || []);
				const ready = !!(data && data.length);
				setScriptReady(ready);
				dispatchGame({ type: "SET_STATUS", value: ready ? "ready" : "idle" });
			});
		};
		load();
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, MODE_SELECT_MS); 
		return () => clearTimeout(timer);
	}, []);

    // Start Flow: Trigger Nico's audio after delay in Boss Chat
    useEffect(() => {
        if (!nicoStarted && activeChat === 'jefe') {
            setNicoStarted(true);
            setTimeout(() => {
                receiveNicoAudio();
            }, MODE_SELECT_MS);
        }
    }, [activeChat, nicoStarted]);

    const receiveNicoAudio = () => {
        sfxNotify.play();
        triggerVibration();
        const audioMsg = { id: "audio-1", type: "audio", content: AUDIO_MSG_SRC, timestamp: "08:10", duration: "0:12" };
        addMessage("nico", audioMsg);
        setNotification({ show: true, message: "🎤 Audio (0:12)", title: "Nico compita IST", icon: "👷" });
        // Sticky notification for initial contact. Closes on click.
    };

	const openCall = () => {
 		if (gameState.isFinished || gameState.isTerminated) return;
		if (!(activeChat === 'nico' && view === 'chat')) return; // Only in Nico's chat
		setCallOpen(true);
		ring.play();
	};

	const handleAnswer = () => {
		if (gameState.isFinished || gameState.isTerminated) return;
		setCallOpen(false);
		ring.stop();
		addMessage("jefe", {
			id: Date.now().toString(),
			type: "ai",
			content: "No puedo hablar más, pero confío en que estén gestionando la DIAT y derivando al organismo administrador. Avísenme el cualquier cosa.",
			timestamp: "Ahora"
		});
		dispatchGame({ type: "ADD_SCORE", value: 1 });
		
		navigateToChat("jefe");
		setChatList(prev => prev.map(c => c.id === "jefe" ? { ...c, unread: 0 } : c));
	};

	const handleDecline = () => {
		setCallOpen(false);
		ring.stop();
		addMessage("jefe", {
			id: Date.now().toString(),
			type: "system",
			content: "🚫 Llamada perdida de la Jefa. Recuerda gestionar la DIAT y documentar el accidente.",
			timestamp: "Ahora"
		});
		navigateToChat("jefe");
		setChatList(prev => prev.map(c => c.id === "jefe" ? { ...c, unread: 0 } : c));
	};

	const triggerTiaNotification = (msg = "¿Qué le pasó a mi niño? ¿Es grave?") => {
		setNotification({ show: true, message: msg, title: "Tía del Nico", icon: "👵" });
		notify.play();
		setTimeout(() => setNotification(s => ({ ...s, show: false })), NOTIFICATION_SHOW_MS);
	};

	// Persistent Chat History
	const initialHistory = {
		nico: [], // Initially empty
		jefe: [{ id: "init-j", type: "ai", content: "Habla con el Nico y recuerda enviar el informe de incidentes.", timestamp: "Ayer" }],
		eval: [],
		ayuda: [
			{ id: "ayuda-1", type: "ai", content: "¡Hola! 👋 Soy tu asistente de información sobre la **Ley 16.744**.", timestamp: "09:00" },
			{ id: "ayuda-2", sectionId: "diat", type: "ai", content: "📋 **¿Qué es la DIAT?**\n\nDenuncia wIndividual de Accidente del Trabajo: debe hacerse dentro de las **24 horas** desde que se conoce el accidente. La hace el empleador; también pueden denunciar la trabajadora, testigos, médico tratante o CPHS. Si el empleador no la hace, puedes denunciar directamente en el organismo administrador (IST/ISL).", timestamp: "09:00" },
			{ id: "ayuda-3", sectionId: "prestaciones-medicas", type: "ai", content: "🏥 **Cobertura de prestaciones:**\n\n• Atención médica de urgencia\n• Hospitalización\n• Medicamentos y tratamientos\n• Rehabilitación\n• Prótesis y aparatos ortopédicos\n\n✅ Se otorgan gratuitamente a cargo del organismo administrador, sin copagos ni reembolsos.", timestamp: "09:01" },
			{ id: "ayuda-4", sectionId: "organismo-administrador", type: "ai", content: "🏢 **Organismo Administrador:**\n\nEs la mutual o ISL donde tu empresa tiene contrato. En urgencias vitales (excepcional), cualquier centro puede atender con posterior derivación obligatoria al OA para continuidad de atención.", timestamp: "09:02" },
			{ id: "ayuda-5", sectionId: "trayecto", type: "ai", content: "🚗 **Accidente de trayecto:**\n\nSe cubre el trayecto **directo**, habitual y sin desvíos personales entre:\n• Casa ↔ Trabajo\n• Trabajo ↔ Lugar donde recibes remuneración\n\n📸 **Medios de prueba:** parte, fotos, testigos, documentos\n⚠️ Desvío personal rompe cobertura; excepción: interrupción habitual por necesidad objetiva (SUSESO).", timestamp: "09:03" },
			{ id: "ayuda-6", sectionId: "subsidio-incapacidad", type: "ai", content: "💰 **Subsidios e ingresos (D.S. 109):**\n\nSi quedas con incapacidad temporal, recibes:\n• Continuidad de ingresos durante tratamiento (conforme D.S. 109)\n• Subsidio por incapacidad laboral (si hay licencia médica)\n• Pensión si queda incapacidad permanente\n\n✅ Las prestaciones médicas se otorgan gratuitamente independientemente de licencia; subsidio aplica solo con reposo.", timestamp: "09:04" },
			{ id: "ayuda-7", type: "ai", content: "📞 **¿Necesitas más ayuda?**\n\nPuedes contactar a:\n• IST o ISL\n• Dirección del Trabajo\n• Superintendencia de Seguridad Social\n\n¡Siempre estoy aquí para ayudarte! 💜", timestamp: "09:05" }
		]
	};
	const [chatHistory, setChatHistory] = useState(initialHistory);
	
	const initialChatList = [
		// Nico missing initially
		{ id: "jefe", name: "Jefatura", lastMsg: "Habla con el Nico y recuerda enviar el...", time: "Ayer", avatar: "jefe", unread: 1 },
		{ id: "ayuda", name: "📚 Ayuda Ley 16.744", lastMsg: "Información sobre tus derechos laborales", time: "Siempre", avatar: "book", unread: 0 }
	];
	const [chatList, setChatList] = useState(initialChatList);

	// Use global playAudio already defined above for consistency with unlock

	const triggerVibration = () => {
		setIsVibrating(true);
		if (navigator.vibrate) navigator.vibrate(VIBRATION_MS);
		setTimeout(() => setIsVibrating(false), VIBRATION_RESET_MS);
	};

	const triggerConfetti = () => {
		const newConfetti = [];
		const emojis = ['🎉', '✅', '🌟', '👏'];
		for(let i=0; i<8; i++) {
			newConfetti.push({
				id: Date.now() + i,
				x: Math.random() * 80 + 10,
				emoji: emojis[Math.floor(Math.random() * emojis.length)]
			});
		}
		setConfetti(newConfetti);
		setTimeout(() => setConfetti([]), CONFETTI_MS);
	};

    const handleChatSelect = (chatId) => {
		setActiveChat(chatId);
		setView("chat");
        // Clear unread count
        setChatList(prev => prev.map(c => c.id === chatId ? { ...c, unread: 0 } : c));
	};

	const handleBack = () => {
		setView("list");
	};

	const handleNotificationClick = () => {
		const currentTitle = notification.title;
		
        if (currentTitle === "Tía del Nico") {
			setNotification(prev => ({ ...prev, show: false }));
			return;
		}
		
		// Determine target chat
		let targetId = "jefe";
		if (currentTitle === "Evaluación") targetId = "eval";
		else if (currentTitle === "Nico compita IST") targetId = "nico";
		
		// Update chat list to add Nico if needed
		setChatList(prev => {
			const exists = prev.find(c => c.id === targetId);
			if (!exists && targetId === "nico") {
				return [{ 
					id: "nico", 
					name: "Nico compita IST", 
					lastMsg: "👷 Nico",
					time: "Ahora",
					avatar: "nico",
					unread: 0 
				}, ...prev];
			}
			return prev.map(c => c.id === targetId ? { ...c, unread: 0 } : c);
		});
		
		// Close notification
		setNotification(prev => ({ ...prev, show: false }));
		
		// Store navigation to apply in useEffect
		pendingNavRef.current = { targetChat: targetId, targetView: "chat" };
	};

	const addMessage = (chatId, msg) => {
		setChatHistory(prev => ({
			...prev,
			[chatId]: [...(prev[chatId] || []), msg]
		}));
		// Update Chat List Preview
		setChatList(prev => {
			const existing = prev.find(c => c.id === chatId);
            
            // Check if we are currently inside this chat
            const isInsideChat = (activeChat === chatId && view === 'chat');
            // If user message, never mark as unread (optional, but logical)
            const shouldIncrement = !isInsideChat && msg.type !== 'user' && msg.type !== 'system';

			if (existing) {
				return prev.map(chat => {
					if (chat.id === chatId) {
						let preview = msg.content;
						if (msg.type === "image") preview = "📷 Foto";
						if (msg.type === "audio") preview = `🎤 ${msg.duration || "Audio"}`;
						if (msg.type === "sticker") preview = "💟 Sticker";
						return { 
                            ...chat, 
                            lastMsg: preview, 
                            time: msg.timestamp === "React" ? "Ahora" : msg.timestamp,
                            unread: (isInsideChat ? 0 : (chat.unread || 0) + (shouldIncrement ? 1 : 0))
                        };
					}
					return chat;
				});
			} else {
                let preview = msg.content;
                if (msg.type === "image") preview = "📷 Foto";
                if (msg.type === "audio") preview = `🎤 ${msg.duration || "Audio"}`;
                if (msg.type === "sticker") preview = "💟 Sticker";

				const newChat = {
					id: chatId,
					name: chatId === 'nico' ? "Nico compita IST" : (chatId === 'eval' ? "Evaluación" : "Chat"),
					lastMsg: preview,
					time: "Ahora",
					avatar: chatId === 'eval' ? "eval" : (chatId === 'nico' ? 'nico' : "default"),
                    unread: (isInsideChat ? 0 : 1) // Only mark unread if not inside
				};
				return [newChat, ...prev]; 
			}
		});
	};

	const resetGame = () => {
		dispatchGame({ type: "RESET", status: scriptReady ? "ready" : "idle" });
		setIntroPlayed(false);
        setNicoStarted(false);
		setChatHistory(initialHistory);
		setChatList(initialChatList);
		setErrorsByTopic({});
		setShowRemediation(null);
 		if (callTimerRef.current) {
 			clearTimeout(callTimerRef.current);
 			callTimerRef.current = null;
 		}
		setLoading(true); 
		setTimeout(() => setLoading(false), MODE_SELECT_MS); 
		setActiveChat("nico");
	};

	const terminateGame = () => {
		dispatchGame({ type: "TERMINATE" });
		if (callTimerRef.current) {
			clearTimeout(callTimerRef.current);
			callTimerRef.current = null;
		}
		addMessage("eval", {
			id: "term",
			type: "system",
			content: "Gracias por participar. Puedes cerrar esta ventana.",
			timestamp: "Fin"
		});
	};

	const handleGameChoice = (option) => {
		if (gameState.isFinished || gameState.isTerminated) return;
		if (gameState.status !== "playing") return;
		if (!scriptReady || !scriptData.length) return;
		const script = scriptData;
		const isPracticeMode = gameState.mode === 'practice';
        
        // User acted! Cancel the inactivity call
        if (callTimerRef.current) {
            clearTimeout(callTimerRef.current);
            callTimerRef.current = null;
        }

		// Track topic attempt
		if (option.topic) {
			dispatchGame({ type: "RECORD_ATTEMPT", topic: option.topic });
		}

		// 1. User Choice (SEND)
		sfxSent.play();
		const userMsg = {
			id: Date.now().toString(),
			type: "user",
			content: option.text,
			timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
		};
		addMessage("nico", userMsg);

		// 2. Nico Reaction (RECV)
		setIsTyping(true); // Start typing
		setTimeout(() => {
			setIsTyping(false); // Stop typing
			sfxRecv.play();
			triggerVibration();
			const reactionMsg = {
				id: (Date.now() + 1).toString(),
				type: "ai",
				content: option.reaction,
				timestamp: "React",
				isReaction: true
			};
			addMessage("nico", reactionMsg);

			// 2.5 Optional Sticker
			if (option.sticker) {
				setTimeout(() => {
					sfxRecv.play();
					const stickerMsg = {
						id: (Date.now() + 5).toString(),
						type: "sticker",
						content: option.sticker,
						timestamp: "Ahora"
					};
					addMessage("nico", stickerMsg);
				}, 600);
			}

			// 2.6 Optional Response Media (Image/Doc attached to the response)
			if (option.media) {
				setTimeout(() => {
					sfxRecv.play();
					const mediaMsg = {
						id: (Date.now() + 6).toString(),
						type: option.media.type, 
						content: option.media.content,
						fileName: option.media.fileName,
						pages: option.media.pages,
						timestamp: "Ahora"
					};
					addMessage("nico", mediaMsg);
				}, 800); // Slightly after sticker or reaction
			}

			// 3. Boss Notification
			if (option.bossMessage) {
				setTimeout(() => {
					sfxNotify.play();

					// 3.1 Context Message (The Question)
					const contextMsg = {
						id: (Date.now() + 5).toString(),
						type: "system",
						content: `❓ Contexto: "${script[gameState.step].text}"`,
						timestamp: "Ahora"
					};
					addMessage("jefe", contextMsg);

					// 3.2 Boss Message
					const bossMsg = {
						id: (Date.now() + 10).toString(),
						type: "ai",
						content: option.bossMessage,
						timestamp: "Ahora"
					};
					addMessage("jefe", bossMsg);

					setNotification({ show: true, message: option.bossMessage, title: "LA JEFA", icon: "👩‍💼" });
					setTimeout(() => setNotification({ show: false, message: "" }), NOTIFICATION_SHOW_MS);
				}, 1500);
			}

			// 4. System Feedback
			setTimeout(() => {
				const earnedScore = (option.score || 0);
				const maxScore = option.maxScore || 2; // Default max score per question
				const newScore = gameState.score + earnedScore;
				
				// Update topic scores for domain mastery
				if (option.topic) {
					dispatchGame({ 
						type: "UPDATE_TOPIC_SCORE", 
						topic: option.topic, 
						score: earnedScore, 
						maxScore: maxScore 
					});
				}
				
				let feedbackContent = option.feedback;
				
				// Mode-specific feedback
				if (isPracticeMode) {
					// Practice Mode: Show detailed feedback
					if (earnedScore === 0 && option.cause && option.recommendation) {
						feedbackContent += `\n\n**¿Por qué?** ${option.cause}\n\n**💡 Pista:** ${option.recommendation}`;
					}
					
					// Show current score
					feedbackContent += `\n\n**Puntaje actual:** ${newScore} pts`;
					
					// Track errors for remediation
					if (earnedScore === 0 && option.topic) {
						setErrorsByTopic(prev => {
							const count = (prev[option.topic] || 0) + 1;
							const updated = { ...prev, [option.topic]: count };
							
							// Trigger remediation if 2+ errors on same topic
							if (count >= 2 && !showRemediation) {
								setTimeout(() => {
									setShowRemediation(option.topic);
								}, 3000);
							}
							
							return updated;
						});
					}
				} else {
					// Evaluation Mode: Minimal feedback
					if (earnedScore > 0) {
						feedbackContent = "✅ Respuesta registrada";
					} else {
						feedbackContent = "Respuesta registrada";
					}
				}
				
				const feedbackMsg = {
					id: (Date.now() + 2).toString(),
					type: "system",
					content: feedbackContent,
					timestamp: "System",
					helpSection: isPracticeMode ? option.helpSection : null
				};
				addMessage("nico", feedbackMsg);

				dispatchGame({ type: "SET_SCORE", value: newScore });

				if (earnedScore === 2) {
					triggerConfetti();
					const shouldSticker = Math.random() < 0.5;
					if (shouldSticker) {
						setTimeout(() => {
							sfxRecv.play();
							addMessage("nico", {
								id: (Date.now() + 8).toString(),
								type: "sticker",
								content: stickers.ok,
								timestamp: "Ahora"
							});
						}, 300);
					}
				} else if (earnedScore === 0) {
					const shouldSticker = Math.random() < 0.5;
					if (shouldSticker) {
						setTimeout(() => {
							sfxRecv.play();
							addMessage("nico", {
								id: (Date.now() + 8).toString(),
								type: "sticker",
								content: stickers.gg,
								timestamp: "Ahora"
							});
						}, 300);
					}
					const notifyTia = Math.random() < 0.35;
					if (notifyTia) {
						triggerTiaNotification("Mijito, me dijeron que el Nico se equivocó ¿ya lo vieron?");
					}
				}
								// 5. Next Step Check with Domain Gates
				const nextStepIndex = gameState.step + 1;
				
				// Check if there's a gate requirement
				const currentNode = script[gameState.step];
				const requiresMastery = currentNode.requiresMastery; // e.g., "diat" topic
				
				if (false && requiresMastery && isPracticeMode) {
					// Check if user has mastered the required topic
					const hasMastery = checkTopicMastery(gameState.topicScores, requiresMastery);
					const masteryPercent = getTopicMastery(gameState.topicScores, requiresMastery);
					
					if (!hasMastery) {
						// User hasn't mastered the topic - show gate message
						setTimeout(() => {
							const gateMsg = {
								id: (Date.now() + 3).toString(),
								type: "system",
								content: `🚧 **Dominio insuficiente**\n\nNecesitas ≥80% en ${requiresMastery.toUpperCase()} para continuar.\n\n📊 Tu nivel actual: **${masteryPercent}%**\n\n💡 **Pista:** Revisa la sección de Ayuda sobre ${requiresMastery} y vuelve a intentar las preguntas anteriores.`,
								timestamp: "Sistema"
							};
							addMessage("nico", gateMsg);
							
							// Don't advance, allow retry
							// Show remediation card
							setTimeout(() => {
								setShowRemediation(requiresMastery);
							}, 2000);
						}, 1500);
						return; // Block advancement
					}
				}
				
				if (nextStepIndex < script.length) {
					dispatchGame({ type: "ADVANCE_STEP" });
					
					setTimeout(() => {
						setIsTyping(true); // Start typing for next question
						setTimeout(() => {
							setIsTyping(false);
							const nextNode = script[nextStepIndex];
							
							// 5.1 Pre-Message Media (Image or Doc)
							if (nextNode.media) {
								const mediaMsg = {
									id: (Date.now() + 2).toString(),
									type: nextNode.media.type, // 'image' or 'document'
									content: nextNode.media.content,
									fileName: nextNode.media.fileName, // for docs
									pages: nextNode.media.pages, // for docs
									timestamp: "Ahora"
								};
								addMessage("nico", mediaMsg);
							}
	
							const aiMsg = {
								id: (Date.now() + 3).toString(),
								type: "ai",
								content: nextNode.text,
								timestamp: nextNode.media ? "Ahora" : (nextNode.time.includes(":") ? nextNode.time : "12:00")
							};
							addMessage("nico", aiMsg);
							sfxRecv.play();
							triggerVibration();
						}, TYPING_MS); // Typing delay
					}, PREDELAY_MS); // Pre-delay
				} else {
					setTimeout(() => {
						// REMOVED HARDCODED IMAGE
						
						dispatchGame({ type: "FINISH" });
						
						// Evaluation follows
						setTimeout(() => {
							const finalMsgText = getEvaluationMessage(newScore);
							addMessage("eval", {
								id: "eval-1",
								type: "system",
								content: finalMsgText,
								timestamp: "Ahora"
							});
							
							// Send Link in Nico's Chat
							const contactPreMsg = {
								id: "pre-contact",
								type: "ai",
								content: "Toma, te mando este contacto, revisa el mensaje",
								timestamp: "Ahora"
							};
							addMessage("nico", contactPreMsg);

							setTimeout(() => {
								const linkMsg = {
									id: "eval-link",
									type: "contact_link",
									content: "Evaluación",
									actionLabel: "Ver mensaje",
									timestamp: "Ahora"
								};
								addMessage("nico", linkMsg);

								sfxNotify.play();
								setNotification({ show: true, message: "Tus resultados están listos.", title: "Evaluación", icon: "✅" });
								setTimeout(() => setNotification({ show: false, message: "" }), NOTIFICATION_SHOW_MS);
								
								if (newScore >= PASSING_SCORE && window.parent) {
									window.parent.postMessage({ type: 'complete'}, '*');
								}
							}, LINK_MSG_DELAY_MS);

						}, EVAL_MSG_DELAY_MS); // Reduced delay for better feel
					}, ANSWER_FEEDBACK_MS);
				}
			}, NEXT_NODE_DELAY_MS);
		}, ANSWER_FEEDBACK_MS);
	};

    const callTimerRef = useRef(null); // Ref to store call timer

	const handleIntroPlay = () => {
		if (introPlayed) return;
		if (!scriptReady || !scriptData.length) return;
		if (gameState.status !== "ready") return;
		const script = scriptData;
		setIntroPlayed(true);
		dispatchGame({ type: "SET_STATUS", value: "playing" });
        // Removed immediate timer from here. Call triggers after OPTIONS appear (12s later + 18s).
 
		// Image -> Text sequence
		setTimeout(() => {
			sfxRecv.play();
			triggerVibration();
			const imgMsg = { 
				id: "img-1", 
				type: "image", 
				content: HAND_IMG, 
				timestamp: "08:11" 
			};
			addMessage("nico", imgMsg);
		}, IMAGE_DELAY_MS);

		// Text message with inactivity timer
		setTimeout(() => {
			sfxRecv.play();
			triggerVibration();
			const textMsg = { 
				id: "init-1", 
				type: "ai", 
				content: script[0].text, 
				timestamp: "08:12" // Fixed timestamp to match script
			};
			addMessage("nico", textMsg);

            // Start Inactivity Timer for Call (18s AFTER options appear)
            // Options appear effectively when this message arrives.
            if (callTimerRef.current) clearTimeout(callTimerRef.current);
			callTimerRef.current = setTimeout(() => openCall(), INACTIVITY_CALL_MS);
		}, TEXT_DELAY_MS);
	};

	const navigateToChat = (chatId) => {
		setActiveChat(chatId);
		setView("chat");
	};

    return React.createElement("main", { className: "phone-wrapper" },
		// Mode Selector (shown before game starts)

		// Helper Components inside the main wrapper (Overlay)
		React.createElement(IncomingCallModal, {
			open: callOpen,
			callerName: "La Jefa",
			subtitle: "Llamada entrante",
            avatar: "👩‍💼",
			onAnswer: handleAnswer,
			onDecline: handleDecline
		}),
		showRemediation && React.createElement(RemediationCard, {
			topic: showRemediation,
			onClose: () => setShowRemediation(null)
		}),
		// TopToast removed, using NotificationBanner unified system
		// Help Button removed per user request

        React.createElement("div", { className: `phone-frame ${isVibrating ? 'vibrate' : ''}` },
			React.createElement(SplashScreen, { isLoading: loading, preloadProgress: preloadProgress }),
			React.createElement(NotificationBanner, { 
				message: notification.message, 
				show: notification.show,
				title: notification.title,
				icon: notification.icon,
				onClick: handleNotificationClick
			}),
			confetti.length > 0 && React.createElement(ConfettiLayer, { confetti: confetti }),
            React.createElement("div", { className: "phone-notch" }),
            React.createElement("div", { className: "status-bar" },
                React.createElement("span", null, "08:12"),
                React.createElement("div", { className: "status-icons" },
                     React.createElement("svg", { width:14, height:14, viewBox:"0 0 24 24", fill:"currentColor" }, 
                        React.createElement("path", { d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" })
                    ),
                    React.createElement("svg", { width:14, height:14, viewBox:"0 0 24 24", fill:"currentColor" }, 
                        React.createElement("path", { d:"M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" })
                    )
                )
            ),
            view === "list" 
                ? React.createElement(ChatList, { onSelect: handleChatSelect, chats: chatList })
                : React.createElement(ChatInterface, { 
                    chatId: activeChat, 
                    chatName: chatList.find(c => c.id === activeChat)?.name || "Chat",
					avatarType: chatList.find(c => c.id === activeChat)?.avatar || "default",
                    onBack: handleBack,
                    messages: chatHistory[activeChat] || [],
					gameState: gameState,
					isVibrating: isVibrating,
					isTyping: isTyping && activeChat === 'nico', // Only show typing in Nico's chat
					onOptionSelect: handleGameChoice,
					onReset: resetGame,
					onTerminate: terminateGame,
					onIntroPlay: handleIntroPlay,
					onNavigate: navigateToChat,
					scriptReady: scriptReady,
					script: scriptData
                }),
            React.createElement("div", { className: "home-indicator" }),

			// Mode Selector (Moved inside phone frame)
			!loading && !gameState.mode && React.createElement(ModeSelector, {
				onSelectMode: (mode) => {
					dispatchGame({ type: "SET_MODE", value: mode });
					dispatchGame({ type: "SET_STATUS", value: "ready" });
				}
			})
        )
    );
}



function ChatList({ onSelect, chats }) {
    return React.createElement("div", { className: "wa-list-view" },
        React.createElement("div", { className: "wa-header" },
            React.createElement("div", { className: "wa-header-top" },
                React.createElement("div", { className: "wa-logo-wrapper" },
					React.createElement("img", { src: "dist/assets/logo.png", alt: "IST Educa", className: "wa-logo-img", style: { height: '35px' } })
				),
                React.createElement("div", { className: "wa-header-icons" },
                    React.createElement(Camera, { size: 20 }),
                    React.createElement(Search, { size: 20 }),
                    React.createElement(MoreVertical, { size: 20 })
                )
            ),
            React.createElement("div", { className: "wa-tabs" },
                React.createElement("div", { className: "wa-tab" }, React.createElement(Camera, { size: 16 })),
                React.createElement("div", { className: "wa-tab active" }, "CHATS"),
                React.createElement("div", { className: "wa-tab" }, "STATUS"),
                React.createElement("div", { className: "wa-tab" }, "CALLS")
            )
        ),
        React.createElement("div", { className: "wa-chats-container" },
            chats.map(chat => 
                React.createElement("div", { key: chat.id, className: "wa-chat-item", onClick: () => onSelect(chat.id) },
                    React.createElement("div", { className: "wa-avatar", style: { background: getAvatarBg(chat.avatar) } }, 
						renderAvatar(chat.avatar)
					),
                    React.createElement("div", { className: "wa-chat-info" },
                        React.createElement("div", { className: "wa-chat-row-1" },
                            React.createElement("span", { className: "wa-chat-name" }, chat.name),
                            React.createElement("span", { className: "wa-chat-time" }, chat.time)
                        ),
                        React.createElement("div", { className: "wa-chat-row-2" },
                            React.createElement("span", { className: "wa-chat-preview" }, chat.lastMsg),
                            chat.unread > 0 && React.createElement("div", { className: "wa-unread-badge" }, chat.unread)
                        )
                    )
                )
            )
        ),
        React.createElement("div", { className: "wa-fab" },
            React.createElement("div", { className: "wa-fab-icon" }, "+")
        )
    );
}

function ChatInterface({ chatId, chatName, avatarType, onBack, messages, gameState, isVibrating, isTyping, onOptionSelect, onReset, onTerminate, onIntroPlay, onNavigate, scriptReady, script = [] }) {
    const scrollRef = useRef(null);
    const bottomRef = useRef(null);

    // Scroll on New Messages or Typing
    useEffect(() => {
        const scrollToBottom = () => {
             if (bottomRef.current) {
                bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        };

		// 1. Immediate scroll attempt
		scrollToBottom();
        
        // 2. Delayed scroll for any layout shifts
		const timer = setTimeout(scrollToBottom, 400); 
        return () => clearTimeout(timer);
    }, [messages, gameState.step, isTyping]);

    // Scroll on Container Resize (e.g. Controls appearing)
    useLayoutEffect(() => {
        if (!scrollRef.current) return;
        const observer = new ResizeObserver(() => {
			if (!scrollRef.current || !bottomRef.current) return;
			
			// Check if user is near bottom (allow 150px threshold)
			const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
			const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
			const isNearBottom = distanceFromBottom < 150;

             if (isNearBottom) {
                bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        });
        observer.observe(scrollRef.current);
        return () => observer.disconnect();
    }, []);

	// FIXED: Calculate before conditionals to respect Rules of Hooks
	const lastMsg = messages[messages.length - 1];
	const canShowOptions = 
		chatId === 'nico' &&
		scriptReady && 
		!gameState.isFinished && 
		lastMsg && 
		lastMsg.type === 'ai' && 
		!lastMsg.isReaction;
	
	const currentNode = canShowOptions ? script[gameState.step] : null;
	const rawOptions = currentNode?.options || [];
	
	// Deterministic shuffle: stable per step, random in practice, fixed in evaluation
	const currentOptions = useMemo(() => {
		if (rawOptions.length === 0) return [];
		if (gameState.mode === 'evaluation') {
			return rawOptions; // Fixed order in evaluation mode
		}
		return seededShuffle(rawOptions, gameState.step); // Stable shuffle per step
	}, [rawOptions, gameState.step, gameState.mode]);

	let showControls = false;
	let controlsContent = null;

	if (chatId === 'nico') {
		
		showControls = true;
		if (currentOptions.length > 0) {
			controlsContent = React.createElement("div", { className: "wa-options-grid" },
				currentOptions.map((opt, i) => 
					React.createElement("button", { 
						key: i,
						role: "button",
						"aria-pressed": false,
						className: `wa-option-btn ${opt.style === 'truth' ? 'wa-btn-truth' : opt.style === 'myth' ? 'wa-btn-myth' : ''}`,
						onClick: () => onOptionSelect(opt),
						onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOptionSelect(opt); } }
					}, opt.text)
				)
			);
		} else 
			{
				controlsContent = React.createElement("div", { className: "wa-input-wrapper disabled" }, 
					gameState.isFinished 
						? React.createElement("span", { style:{color:'#888', padding:'0 10px'} }, "Juego finalizado.") 
						: isTyping 
							? React.createElement("span", { style:{color: 'var(--wa-teal)', padding:'0 10px', fontWeight:'bold'} }, "Nico está escribiendo...")
							: React.createElement("span", { style:{color:'#888', padding:'0 10px'} }, "Selecciona una respuesta...")
				);
			}
	} else if (chatId === 'eval') {
		showControls = true;
		if (!gameState.isTerminated) {
			controlsContent = React.createElement("div", { className: "wa-options-grid" },
				React.createElement("button", { 
					className: "wa-option-btn",
					"aria-label": "Reintentar la simulación desde el inicio",
					onClick: onReset,
					style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }
				}, React.createElement(RotateCcw, { size: 18 }), "Reintentar"),
				React.createElement("button", { 
					className: "wa-option-btn",
					"aria-label": "Terminar la simulación",
					onClick: onTerminate,
					style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#0dc11cff' }
				}, React.createElement(CheckCircle, { size: 18 }), "Terminar")
			);
		} else {
			controlsContent = React.createElement("div", { className: "wa-input-wrapper disabled" }, 
				React.createElement("span", { style:{color:'#888', padding:'0 10px'} }, "Sesión finalizada.") 
			);
		}
	} else {
		showControls = true;
		controlsContent = React.createElement("div", { className: "wa-input-wrapper disabled" }, 
			React.createElement("span", { style:{color:'#888', padding:'0 10px'} }, "Solo lectura") 
		);
	}

	const renderMessageContent = (msg) => {
		if (msg.type === 'document') {
            if (msg.thumbnail) {
                 return React.createElement("div", { className: "wa-document-bubble", style: { padding: 0, display: 'flex', flexDirection: 'column' } },
                    React.createElement("div", { style: { height: '140px', background: '#e0e0e0', position: 'relative', overflow: 'hidden', borderTopLeftRadius: '7.5px', borderTopRightRadius: '7.5px' } },
                        React.createElement("img", { src: msg.thumbnail, style: { width: '100%', height: '100%', objectFit: 'cover' } }),
                        React.createElement("div", { style: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.2)', borderRadius: '50%', padding: '12px' } },
                             React.createElement(FileText, { size: 24, color: "white" })
                        )
                    ),
                    React.createElement("div", { className: "wa-doc-info", style: { background: 'rgba(0,0,0,0.05)', padding: '10px 12px', borderBottomLeftRadius: '7.5px', borderBottomRightRadius: '7.5px' } },
                         React.createElement("span", { className: "wa-doc-name", style: { fontSize: '13.5px', fontWeight: '500', display: 'block' } }, msg.fileName || "Doc"),
                         React.createElement("span", { className: "wa-doc-meta" }, msg.pages || "PDF")
                    )
                 );
            }
			return React.createElement("div", { className: "wa-document-bubble" },
				React.createElement("div", { className: "wa-doc-icon" }, 
					React.createElement(FileText, { size: 20, color: "white" })
				),
				React.createElement("div", { className: "wa-doc-info" },
					React.createElement("span", { className: "wa-doc-name" }, msg.fileName || "Documento.pdf"),
					React.createElement("span", { className: "wa-doc-meta" }, msg.pages || "PDF")
				),
				React.createElement("div", { className: "wa-arrow-down" },
					React.createElement(Download, { size: 20 })
				)
			);
		}
		if (msg.type === 'image') return React.createElement("img", { src: msg.content, className: "wa-msg-image", alt: "Foto de corte en mano de Nico (simulada)" });
		if (msg.type === 'sticker') return React.createElement("img", { src: msg.content, className: "wa-sticker", alt: "Sticker emocional" });
		if (msg.type === 'audio') return React.createElement(AudioBubble, { 
			src: msg.content, 
			duration: msg.duration,
            withAvatar: true,
			onPlay: (chatId === 'nico' && msg.id === 'audio-1') ? onIntroPlay : undefined 
		});
		if (msg.type === 'contact_link') {
			return React.createElement("div", { className: "wa-contact-card" },
				React.createElement("div", { className: "wa-contact-header" },
					React.createElement("div", { className: "wa-contact-avatar" },
						React.createElement(Check, { size: 20, color: "white" })
					),
					React.createElement("span", { className: "wa-contact-title" }, msg.content),
					React.createElement("div", { className: "wa-contact-time-inner" }, 
						msg.timestamp,
						React.createElement(Check, { size: 12, className: "wa-double-check", color: "#80cbc4" })
					)
				),
				React.createElement("div", { className: "wa-contact-footer" },
					React.createElement("button", { className: "wa-contact-btn", onClick: () => onNavigate('eval') },
						msg.actionLabel || "Mensaje"
					)
				)
			);
		}
		return React.createElement(Markdown, { components: ChatText, remarkPlugins: [remarkGfm], skipHtml: true }, msg.content);
	};

    return React.createElement("div", { className: "wa-chat-view" },
        React.createElement("div", { className: "wa-chat-header" },
            React.createElement("button", { className: "wa-back-btn", onClick: onBack },
                React.createElement(ArrowLeft, { size: 24 })
            ),
            React.createElement("div", { className: "wa-chat-avatar-small" }, chatId === 'eval' ? '✅' : renderAvatar(avatarType)),
            React.createElement("div", { className: "wa-chat-details" },
                React.createElement("span", { className: "wa-contact-name" }, chatName),
                React.createElement("span", { className: "wa-contact-status" }, isTyping ? "escribiendo..." : "online")
            ),
            React.createElement("div", { className: "wa-chat-actions" },
                React.createElement(Video, { size: 22 }),
                React.createElement(Phone, { size: 20 }),
                React.createElement(MoreVertical, { size: 20 })
            )
        ),
		chatId === 'nico' && !gameState.isFinished && React.createElement(ProgressBar, { step: gameState.step, total: script.length || 0 }),
		
        React.createElement("div", { className: "wa-chat-bg", ref: scrollRef },
            React.createElement("div", { className: "wa-encryption-msg" },
                chatId === 'nico' ? "Actividad: Ayudo a mi compa." : 
				chatId === 'eval' ? "Resultados de la actividad." : "Mensajes con Jefatura."
            ),
            messages.map(msg => 
                React.createElement(MessageBubble, {
					key: msg.id,
					msg: msg,
					chatId: chatId,
					renderContent: () => renderMessageContent(msg),
					onNavigateHelp: onNavigate
				})
            ),
			isTyping && React.createElement(TypingBubble, null),
			React.createElement("div", { ref: bottomRef, style: { float: "left", clear: "both", height: "20px", width: "100%" } })
        ),
        showControls && React.createElement("div", { className: "wa-chat-input-area wa-game-controls" },
			controlsContent
        )
    );
}

