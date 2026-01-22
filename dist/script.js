
import React, { StrictMode, useEffect, useLayoutEffect, useRef, useState, useMemo } from "https://esm.sh/react";
import { motion, AnimatePresence } from "https://esm.sh/framer-motion";
import { createRoot } from "https://esm.sh/react-dom/client";
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

createRoot(document.getElementById("root")).render(
    React.createElement(StrictMode, null, 
        React.createElement(WhatsAppSimulator, null)
    )
);

/* --- ASSETS --- */
const SOUND_SENT = "dist/assets/sounds/sent.mp3";
const SOUND_RECV = "dist/assets/sounds/received.mp3";
const RING_URL = "dist/assets/sounds/call.mp3"; // Updated call sound
const SOUND_NOTIFY = "dist/assets/sounds/notification.wav";
const IMAGE_PLACEHOLDER = "dist/assets/blur.jpg";
const AUDIO_MSG_SRC = "dist/assets/sounds/nico_audio.ogg"; 
const STICKER_THUMB = "dist/assets/sticker.png"; 
const DOC_ICON_PATH = "dist/assets/doc_icon.png"; // Placeholder
const INJURY_IMG = "dist/assets/injury_blur.jpg"; // Placeholder for Node 1
const LICENCIA_DOC = "dist/assets/licencia_medica.pdf"; // Placeholder for Node 6

/* --- GAME DATA --- */
const stickers = {
    ok: "dist/assets/sticker_ok.webp", 
    gg: "dist/assets/sticker_gg.webp"
};

const gameScript = [
	{
		id: 1,
		time: "08:12",
		text: "Te cuento po, me corté la mano con una lámina en el taller. ¿Qué hago? 😰",
		media: { type: 'image', content: INJURY_IMG }, // Added Injury Image
		options: [
			{ 
				text: "Avísale de inmediato a tu jefatura para que emita la DIAT y te acompaño al centro de la mutual/ISL.", 
				score: 2, 
				reaction: "¡Gracias, no sabía eso! Voy a buscar ayuda altiro.",
				bossMessage: "✅ Bien hecho activando el protocolo DIAT, así evitamos multas y Nico recibe atención inmediata.",
				feedback: "✅ +2 pts. Activaste el proceso de denuncia y atención por el seguro laboral." 
			},
			{ 
				text: "Lávate, ponte una venda y veamos si se pasa.", 
				score: 0, 
				reaction: "¿Seguro? Es que sangra caleta…",
				bossMessage: "❌ ¡Ojo! Ignorar un accidente grave puede traer sanciones y agravar la lesión.",
				feedback: "❌ 0 pts. Minimizas el accidente y retrasas cobertura." 
			},
			{ 
				text: "Anda a tu ISAPRE/FONASA, después vemos lo de la DIAT.", 
				score: 1, 
				reaction: "¿Y no tengo que hacer algo más?",
				bossMessage: "⚠️ Ojo, si va a Isapre perdemos la trazabilidad laboral. Mejor directo a Mutual.",
				feedback: "🟡 +1 pt. Urgencia puede atender, pero sin DIAT no hay cobertura completa." 
			}
		]
	},
	{
		id: 2,
		time: "08:15",
		text: "Mi jefa hoy no está. ¿Sin ella no se puede denunciar?",
		options: [
			{ 
				text: "Solo la empresa puede.", 
				score: 0, 
				reaction: "Pucha… entonces espero.",
				bossMessage: "❌ ¡Error! Cualquier testigo o el mismo accidentado puede denunciar, no esperen por mí.",
				feedback: "❌ 0 pts. La ley permite que otras personas denuncien también." 
			},
			{ 
				text: "Tú puedes hacer la DIAT y yo te ayudo; igual avisamos a la empresa.", 
				score: 2, 
				reaction: "¡Ya! Gracias por apoyarme.",
				bossMessage: "✅ Excelente iniciativa. La autodenuncia asegura la atención oportuna.",
				feedback: "✅ +2 pts. Empoderas al trabajador y das continuidad al proceso." 
			},
			{ 
				text: "Esperemos a mañana.", 
				score: 0, 
				reaction: "¿Y si se me infecta?",
				bossMessage: "❌ ¡Jamás postergar! La denuncia debe ser dentro de las 24 horas ideales.",
				feedback: "❌ 0 pts. Posponer es riesgoso y puede afectar cobertura." 
			}
		]
	},
	{
		id: 3,
		time: "08:22",
		text: "Me duele harto. ¿Voy en micro o pido ambulancia?",
		options: [
			{ 
				text: "Si hay sangrado importante o mareo, pide traslado; si no, te llevo directo a la mutual/ISL.", 
				score: 2, 
				reaction: "¡Perfecto! Mejor no me la juego.",
				bossMessage: "✅ Muy bien priorizando el traslado seguro. Es parte de la cobertura.",
				feedback: "✅ +2 pts. El traslado forma parte de las prestaciones médicas." 
			},
			{ 
				text: "Pasa por tu casa a cambiarte y después vamos.", 
				score: 0, 
				reaction: "¿No será perder tiempo…?",
				bossMessage: "❌ No pierdan tiempo valioso. La ropa da igual, la salud es primero.",
				feedback: "❌ 0 pts. Desvías la urgencia y dilatas la atención." 
			},
			{ 
				text: "Anda a la clínica más cercana porque es más rápida.", 
				score: 1, 
				reaction: "No sabía que podía…",
				bossMessage: "⚠️ Sirve por Ley de Urgencia, pero idealmente va directo al convenio para no pagar extra.",
				feedback: "🟡 +1 pt. Es válido en urgencia, pero debe derivarse y calificar." 
			}
		]
	},
	{
		id: 4,
		time: "10:05",
		text: "Me suturaron y me dieron indicaciones. ¿Esto lo pago yo? 💸",
		options: [
			{ 
				text: "Están cubiertos procedimientos, medicamentos, curaciones y controles hasta tu alta.", 
				score: 2, 
				reaction: "¡Menos mal! Pensé que iba a salir caro.",
				bossMessage: "✅ Correcto, el seguro cubre el 100% de las prestaciones médicas.",
				feedback: "✅ +2 pts. Cubre todo hasta recuperación o secuelas." 
			},
			{ 
				text: "Solo la consulta; los medicamentos corren por tu cuenta.", 
				score: 0, 
				reaction: "Uff, me dejaron medio quebrado.",
				bossMessage: "❌ ¡No! Nico no debe pagar nada. Infórmate bien sobre la Ley 16.744.",
				feedback: "❌ 0 pts. ¡No! Nico no debe pagar nada. Infórmate bien sobre la Ley 16.744." 
			},
			{ 
				text: "Solo si faltas al trabajo te cubren.", 
				score: 0, 
				reaction: "¿Entonces no era accidente laboral?",
				bossMessage: "❌ Falso. La cobertura aplica con o sin licencia médica.",
				feedback: "❌ 0 pts. Falso. La cobertura aplica con o sin licencia médica." 
			}
		]
	},
	{
		id: 5,
		time: "10:15",
		text: "El doc dice que quizá no necesito reposo. ¿Pierdo beneficios?",
		options: [
			{ 
				text: "Aunque no tengas reposo, igual tienes prestaciones médicas.", 
				score: 2, 
				reaction: "¡Ah buena! Pensé que perdía todo.",
				bossMessage: "✅ Exacto. Nico vuelve a trabajar pero sigue con tratamiento cubierto.",
				feedback: "✅ +2 pts. La cobertura médica se mantiene aunque no haya reposo." 
			},
			{ 
				text: "Sin licencia, pagas todo tú.", 
				score: 0, 
				reaction: "Pucha, no tenía idea…",
				bossMessage: "❌ Error grave. No asustes a Nico, el seguro sigue operando.",
				feedback: "❌ 0 pts. Error grave. No asustes a Nico, el seguro sigue operando." 
			}
		]
	},
	{
		id: 6,
		time: "11:40",
		text: "La secretaria dice que la empresa debe tramitar la licencia 5/6. Si no la reciben, ¿qué hago?",
		media: { type: 'document', content: LICENCIA_DOC, fileName: 'Licencia_Medica_Nico.pdf', pages: '1 pág • PDF', thumbnail: IMAGE_PLACEHOLDER },
		options: [
			{ 
				text: "La presentas directamente en el organismo administrador; si falta la DIAT, la hacemos.", 
				score: 2, 
				reaction: "¡Buena! No sabía que podía hacerlo directo.",
				bossMessage: "✅ Bien resuelto. Si RRHH falla, el trabajador puede gestionar su licencia directo.",
				feedback: "✅ +2 pts. Bien resuelto. Si RRHH falla, el trabajador puede gestionar su licencia directo." 
			},
			{ 
				text: "Llévala a la ISAPRE.", 
				score: 0, 
				reaction: "Pero si es laboral…",
				bossMessage: "❌ Si la llevas a Isapre la van a rechazar por origen laboral. Pérdida de tiempo.",
				feedback: "❌ 0 pts. Si la llevas a Isapre la van a rechazar por origen laboral. Pérdida de tiempo." 
			},
			{ 
				text: "Espera a que la empresa vuelva.", 
				score: 0, 
				reaction: "¿Y si se pasa el plazo?",
				bossMessage: "❌ Los plazos de licencia son fatales. No hay que esperar.",
				feedback: "❌ 0 pts. Los plazos de licencia son fatales. No hay que esperar." 
			}
		]
	},
	{
		id: 7,
		time: "Martes, 08:55",
		text: "Voy camino a control. ¿Sirve que guarde fotos y el parte con las circunstancias?",
		options: [
			{ 
				text: "Sí, guarda fotos, testigos y documentos; te ayudan a acreditar circunstancias y trayecto si aplica.", 
				score: 2, 
				reaction: "¡Perfecto! Tomé fotos de todo.",
				sticker: STICKER_THUMB,
				media: { type: 'image', content: IMAGE_PLACEHOLDER }, 
				bossMessage: "✅ Super bien. Esos respaldos son claves si la mutual cuestiona el origen.",
				feedback: "✅ +2 pts. Super bien. Esos respaldos son claves si la mutual cuestiona el origen." 
			},
			{ 
				text: "No hace falta, con la DIAT basta.", 
				score: 0, 
				reaction: "Chuta, ya las borré…",
				bossMessage: "❌ Mal consejo. Sin pruebas es más difícil defender el caso si lo rechazan.",
				feedback: "❌ 0 pts. Mal consejo. Sin pruebas es más difícil defender el caso si lo rechazan." 
			}
		]
	},
	{
    id: 8,
    time: "12:00",
    text: "Oye wn, estuve leyendo el manual que me pasaron y caché unos datos que en volá tú no sabíai. ¿Te pongo a prueba? 😎",
    options: [
        { text: "¡Dale! Tira los datos a ver si sabís tanto. Jajaja", score: 0, reaction: "Ya, prepárate que aquí te pillo fijo. ¡Vamos!" }
    ]
},
	{
    id: 9,
    time: "12:01",
    text: "1️⃣ ¿Sabíai que si vai de la pega a la casa y te desviai a comprar pan, te sigue cubriendo el seguro de trayecto?",
    options: [
        { 
            text: "¡Ooh que buen dato wn! No tenía idea. 👍", 
            score: 0, 
            style: 'truth',
            reaction: "❌ ¡Puta el weón! Te cuentié pesao' JKSADKA. El trayecto tiene que ser directo, si te desviai a comprar pan cagaste con el seguro.", 
            feedback: "❌ 0 pts. El desvío por motivos personales interrumpe la cobertura de trayecto."
        },
        { 
            text: "Chamullento ql, aonde la viste. Esa es mula. 👎", 
            score: 2, 
            style: 'myth',
            reaction: "✅ ¡Buena! Estái vivo. Es chamullo: si hay un desvío que no sea por fuerza mayor, el seguro no te pesca.",
            feedback: "✅ +2 pts. El trayecto debe ser directo y no interrumpido por fines personales."
        }
    ]
},
{
    id: 10,
    time: "12:02",
    text: "2️⃣ ¿Y esta? En la Mutual tengo que pagar la atención de urgencia y después pedir el reembolso con la boleta.",
    options: [
        { 
            text: "Claro, como en la farmacia. Verdad. 👍", 
            score: 0, 
            style: 'truth',
            reaction: "❌ ¡Te volví a pillar! JSDKFJS. El seguro es gratuito, no tení que sacar ni una gamba del bolsillo.", 
            feedback: "❌ 0 pts. La Ley 16.744 no contempla copagos ni reembolsos; es gratuita."
        },
        { 
            text: "¡La mansa mentira hno! No se paga ni un peso. 👎", 
            score: 2, 
            style: 'myth',
            reaction: "✅ ¡Eso! La tení clarita. Todo el tratamiento, hasta los remedios, son gratis.",
            feedback: "✅ +2 pts. Cobertura total sin costo para el trabajador."
        }
    ]
}
];

const PASSING_SCORE = 14; 

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

const ChatText = {
	p({ node, ...rest }) {
		return React.createElement("p", Object.assign({ className: "msg-text" }, rest));
	},
	ul({ node, ...rest }) {
		return React.createElement("ul", Object.assign({ className: "msg-list" }, rest));
	}
};

/* --- COMPONENTS --- */

function SplashScreen({ isLoading }) {
	const [fadeOut, setFadeOut] = useState(false);

	useEffect(() => {
		if (!isLoading) {
			setFadeOut(true);
		}
	}, [isLoading]);

	if (!isLoading && !fadeOut) return null;

	return React.createElement("div", { className: `splash-screen ${isLoading ? '' : 'hidden'}` },
		React.createElement("div", { className: "splash-content" },
			React.createElement("img", { src: "dist/assets/logo.png", className: "splash-logo", alt: "IST Educa" }),
			React.createElement(Loader2, { className: "splash-spinner", size: 48 }),
			React.createElement("p", { className: "splash-text" }, "Abriendo ISTeduca APP...")
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
		case 'nico': return React.createElement("img", { src: "dist/assets/nico.jpg", style: { width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' } });
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
        React.createElement("img", { src: "dist/assets/nico.jpg", className: "audio-internal-avatar" }),
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

const NOTIFY_URL = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_2c4d36a3fc.mp3?filename=ui-notification-234729.mp3";

function useAudio(url) {
  const ref = useRef(null);
  useEffect(() => {
    const a = new Audio(url);
    a.preload = "auto";
    ref.current = a;
    return () => { a.pause(); ref.current = null; };
  }, [url]);
  return {
    play: () => ref.current?.play?.(),
    stop: () => { if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; } },
  };
}

function IncomingCallModal({ open, callerName = "La Jefa", subtitle = "Llamada entrante", avatar = "👩🏻‍💼", onAnswer, onDecline }) {
  return React.createElement(AnimatePresence, null,
    open && React.createElement(motion.div, {
      className: "fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm",
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



function AyudaLeyPopover() {
  const [open, setOpen] = useState(false);
  return React.createElement("div", { className: "relative" },
    React.createElement("button", {
      "aria-label": "Ayuda Ley 16.744",
      onClick: () => setOpen((v) => !v),
      className: "flex items-center gap-2 rounded-xl border bg-white/80 px-3 py-2 text-sm shadow hover:bg-white dark:border-slate-600 dark:bg-slate-800"
    }, React.createElement(Book, { size: 16 }), " Ayuda 16.744"),
    React.createElement(AnimatePresence, null,
      open && React.createElement(motion.div, {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 6 },
        className: "absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-900",
		style: { width: '320px' }
      },
        React.createElement("div", { className: "mb-2 flex items-center gap-2 font-semibold" },
          React.createElement(Info, { size: 16 }), " Mini‑manual"
        ),
        React.createElement("ul", { className: "space-y-2 text-[13px] leading-snug", style: { listStyle: 'none', padding: 0 } },
          React.createElement("li", null, React.createElement("span", { className: "font-semibold" }, "DIAT/DIEP:"), " Denuncia en 24h desde que se conoce el accidente..."),
          React.createElement("li", null, React.createElement("span", { className: "font-semibold" }, "Prestaciones médicas:"), " urgencia, hospitalización, diagnósticos..."),
          React.createElement("li", null, React.createElement("span", { className: "font-semibold" }, "Trayecto:"), " cubre trayecto directo casa↔trabajo..."),
          React.createElement("li", null, React.createElement("span", { className: "font-semibold" }, "Ingresos:"), " continuidad mediante subsidio/pensión.")
        ),
        React.createElement("div", { className: "mt-3 text-right" },
          React.createElement("button", {
            onClick: () => setOpen(false),
            className: "rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-slate-700"
          }, "Listo")
        )
      )
    )
  );
}

function WhatsAppSimulator() {
    const [view, setView] = useState("list"); 
	const [activeChat, setActiveChat] = useState("nico");
	const [gameState, setGameState] = useState({ step: 0, score: 0, isFinished: false, isTerminated: false });
    const [isVibrating, setIsVibrating] = useState(false);
	const [isTyping, setIsTyping] = useState(false); // New Typing State
	const [confetti, setConfetti] = useState([]);
	const [notification, setNotification] = useState({ show: false, message: "", title: "LA JEFA", icon: "👩‍💼" });
	const [loading, setLoading] = useState(true);
	const [introPlayed, setIntroPlayed] = useState(false);

	const [callOpen, setCallOpen] = useState(false);
    const [nicoStarted, setNicoStarted] = useState(false); // Start Flow flag
	const ring = useAudio(RING_URL);
	const notify = useAudio(NOTIFY_URL);

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 3000); 
		return () => clearTimeout(timer);
	}, []);

    // Start Flow: Trigger Nico's audio after 3s in Boss Chat
    useEffect(() => {
        if (!nicoStarted && activeChat === 'jefe') {
            setNicoStarted(true);
            setTimeout(() => {
                receiveNicoAudio();
            }, 3000);
        }
    }, [activeChat, nicoStarted]);

    const receiveNicoAudio = () => {
        playAudio(SOUND_NOTIFY);
        triggerVibration();
        const audioMsg = { id: "audio-1", type: "audio", content: AUDIO_MSG_SRC, timestamp: "08:10", duration: "0:12" };
        addMessage("nico", audioMsg);
        setNotification({ show: true, message: "🎤 Audio (0:12)", title: "Nico compita IST", icon: "👷" });
        setTimeout(() => setNotification(s => ({...s, show: false})), 4000);
    };

	const openCall = () => {
		setCallOpen(true);
		ring.play();
	};

	const handleAnswer = () => {
		setCallOpen(false);
		ring.stop();
		addMessage("jefe", {
			id: Date.now().toString(), // No crypto.randomUUID yet just to be safe in all envs
			type: "ai",
			content: "No puedo hablar más, pero confío en que estén gestionando la DIAT y derivando al organismo administrador. Avísenme el cualquier cosa.",
			timestamp: "Ahora"
		});
		setGameState(prev => ({ ...prev, score: prev.score + 1 }));
        navigateToChat("jefe"); // Explicitly go to boss chat on answer
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
        // Do NOT navigate. Stay on current screen.
	};

	const triggerTiaNotification = (msg = "¿Qué le pasó a mi niño? ¿Es grave?") => {
		setNotification({ show: true, message: msg, title: "Tía del Nico", icon: "👵" });
		notify.play();
		setTimeout(() => setNotification(s => ({ ...s, show: false })), 5000);
	};

	// Persistent Chat History
	const initialHistory = {
		nico: [], // Initially empty
		jefe: [{ id: "init-j", type: "ai", content: "Habla con el Nico y recuerda enviar el informe de incidentes.", timestamp: "Ayer" }],
		eval: [] 
	};
	const [chatHistory, setChatHistory] = useState(initialHistory);
	
	const initialChatList = [
		// Nico missing initially
		{ id: "jefe", name: "Jefatura", lastMsg: "Habla con el Nico y recuerda enviar el...", time: "Ayer", avatar: "jefe", unread: 1 }
	];
	const [chatList, setChatList] = useState(initialChatList);

	const playAudio = (path) => {
		try {
			const audio = new Audio(path);
			audio.volume = 0.5;
			audio.play().catch(e => console.log("Audio play prevented:", e));
		} catch (e) { console.error("Audio error", e); }
	};

	const triggerVibration = () => {
		setIsVibrating(true);
		if (navigator.vibrate) navigator.vibrate(200);
		setTimeout(() => setIsVibrating(false), 300);
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
		setTimeout(() => setConfetti([]), 2000);
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
		setNotification({ show: false, message: "" });
        if (notification.title === "Tía del Nico") return; // Just close for Tía
		setActiveChat(notification.title === "Evaluación" ? "eval" : (notification.title === "Nico compita IST" ? "nico" : "jefe"));
		setView("chat");
        // Clear unread count for the chat we just opened via notification
        const targetId = notification.title === "Evaluación" ? "eval" : (notification.title === "Nico compita IST" ? "nico" : "jefe");
        setChatList(prev => prev.map(c => c.id === targetId ? { ...c, unread: 0 } : c));
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
		setGameState({ step: 0, score: 0, isFinished: false, isTerminated: false });
		setIntroPlayed(false);
        setNicoStarted(false);
		setChatHistory(initialHistory);
		setChatList(initialChatList);
		setLoading(true); 
		setTimeout(() => setLoading(false), 1500); 
		setActiveChat("nico");
	};

	const terminateGame = () => {
		setGameState(prev => ({ ...prev, isTerminated: true }));
		addMessage("eval", {
			id: "term",
			type: "system",
			content: "Gracias por participar. Puedes cerrar esta ventana.",
			timestamp: "Fin"
		});
	};

	const handleGameChoice = (option) => {
		if (gameState.isFinished) return;
        
        // User acted! Cancel the inactivity call
        if (callTimerRef.current) {
            clearTimeout(callTimerRef.current);
            callTimerRef.current = null;
        }

		// 1. User Choice (SEND)
		playAudio(SOUND_SENT);
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
			playAudio(SOUND_RECV);
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
					playAudio(SOUND_RECV);
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
					playAudio(SOUND_RECV);
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
					playAudio(SOUND_NOTIFY);

					// 3.1 Context Message (The Question)
					const contextMsg = {
						id: (Date.now() + 5).toString(),
						type: "system",
						content: `❓ Contexto: "${gameScript[gameState.step].text}"`,
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
					setTimeout(() => setNotification({ show: false, message: "" }), 5000);
				}, 1500);
			}

			// 4. System Feedback
			setTimeout(() => {
				const feedbackMsg = {
					id: (Date.now() + 2).toString(),
					type: "system",
					content: option.feedback,
					timestamp: "System"
				};
				addMessage("nico", feedbackMsg);

				const earnedScore = (option.score || 0);
				const newScore = gameState.score + earnedScore;
				setGameState(prev => ({ ...prev, score: newScore }));

				if (earnedScore === 2) {
					triggerConfetti();
					// Auto Sticker for correct answer
					setTimeout(() => {
						playAudio(SOUND_RECV);
						addMessage("nico", {
							id: (Date.now() + 8).toString(),
							type: "sticker",
							content: stickers.ok,
							timestamp: "Ahora"
						});
					}, 300);
				} else if (earnedScore === 0) {
					// Auto Sticker for wrong answer
					setTimeout(() => {
						playAudio(SOUND_RECV);
						addMessage("nico", {
							id: (Date.now() + 8).toString(),
							type: "sticker",
							content: stickers.gg,
							timestamp: "Ahora"
						});
						// Auto Tia Notification
						triggerTiaNotification("Mijito, me dijeron que el Nico se equivocó ¿ya lo vieron?");
					}, 300);
				}
								// 5. Next Step Check
				const nextStepIndex = gameState.step + 1;
				if (nextStepIndex < gameScript.length) {
					setGameState(prev => ({ ...prev, step: nextStepIndex }));
					
					setTimeout(() => {
						setIsTyping(true); // Start typing for next question
						setTimeout(() => {
							setIsTyping(false);
							const nextNode = gameScript[nextStepIndex];
							
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
							playAudio(SOUND_RECV);
							triggerVibration();
						}, 2000); // Typing delay
					}, 2000); // Pre-delay
				} else {
					setTimeout(() => {
						// REMOVED HARDCODED IMAGE
						
						setGameState(prev => ({ ...prev, isFinished: true }));
						
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

								playAudio(SOUND_NOTIFY);
								setNotification({ show: true, message: "Tus resultados están listos.", title: "Evaluación", icon: "✅" });
								setTimeout(() => setNotification({ show: false, message: "" }), 5000);
								
								if (newScore >= PASSING_SCORE && window.parent) {
									window.parent.postMessage({ type: 'complete'}, '*');
								}
							}, 1000);

						}, 1500); // Reduced delay for better feel
					}, 1000);
				}
			}, 2500);
		}, 1500);
	};

    const callTimerRef = useRef(null); // Ref to store call timer

	const handleIntroPlay = () => {
		if (introPlayed) return;
		setIntroPlayed(true);
        // Removed immediate timer from here. Call triggers after OPTIONS appear (12s later + 18s).
 
		// 5s -> Image
		setTimeout(() => {
			playAudio(SOUND_RECV);
			triggerVibration();
			const imgMsg = { 
				id: "img-1", 
				type: "image", 
				content: INJURY_IMG, 
				timestamp: "08:11" 
			};
			addMessage("nico", imgMsg);
		}, 5000);

		// 12s -> Text (AND Start Inactivity Timer)
		setTimeout(() => {
			playAudio(SOUND_RECV);
			triggerVibration();
			const textMsg = { 
				id: "init-1", 
				type: "ai", 
				content: gameScript[0].text, 
				timestamp: "08:12" // Fixed timestamp to match script
			};
			addMessage("nico", textMsg);

            // Start Inactivity Timer for Call (18s AFTER options appear)
            // Options appear effectively when this message arrives.
            if (callTimerRef.current) clearTimeout(callTimerRef.current);
            callTimerRef.current = setTimeout(() => openCall(), 10000);

		}, 12000);
	};

	const navigateToChat = (chatId) => {
		setActiveChat(chatId);
		setView("chat");
	};

    return React.createElement("main", { className: "phone-wrapper" },
		// Helper Components inside the main wrapper (Overlay)
		React.createElement(IncomingCallModal, {
			open: callOpen,
			callerName: "La Jefa",
			subtitle: "Llamada entrante",
            avatar: "👩‍💼",
			onAnswer: handleAnswer,
			onDecline: handleDecline
		}),
		// TopToast removed, using NotificationBanner unified system
		// Dev Controls & Help (Fixed Overlay)
		React.createElement("div", { 
			style: { 
				position: 'fixed', 
				bottom: '20px', 
				right: '20px', 
				zIndex: 900, 
				display: 'flex', 
				gap: '10px',
				alignItems: 'center',
				background: 'rgba(255,255,255,0.9)',
				padding: '12px',
				borderRadius: '16px',
				boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
				backdropFilter: 'blur(8px)',
				border: '1px solid rgba(0,0,0,0.05)'
			} 
		},
			React.createElement("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginRight: '4px' } }, "🎮 SST:"),
			React.createElement("button", { 
				onClick: openCall,
				style: { padding: '8px 16px', background: '#10b981', color: 'white', border:'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize:'13px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }
			}, "📞 Llamar"),
			React.createElement("button", { 
				onClick: () => triggerTiaNotification(),
				style: { padding: '8px 16px', background: '#6366f1', color: 'white', border:'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize:'13px', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)' }
			}, "👵 Tía"),
			React.createElement(AyudaLeyPopover)
		),

        React.createElement("div", { className: `phone-frame ${isVibrating ? 'vibrate' : ''}` },
			React.createElement(SplashScreen, { isLoading: loading }),
			React.createElement(NotificationBanner, { 
				message: notification.message, 
				show: notification.show,
				title: notification.title,
				icon: notification.icon,
				onClick: handleNotificationClick
			}),
			confetti.map(c => 
				React.createElement("div", { 
					key: c.id, 
					className: "floating-emoji", 
					style: { left: `${c.x}%` } 
				}, c.emoji)
			),
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
					onNavigate: navigateToChat
                }),
            React.createElement("div", { className: "home-indicator" })
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

function ChatInterface({ chatId, chatName, avatarType, onBack, messages, gameState, isVibrating, isTyping, onOptionSelect, onReset, onTerminate, onIntroPlay, onNavigate }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, gameState, isTyping]); // Scroll on typing too

	let showControls = false;
	let controlsContent = null;

	if (chatId === 'nico') {
		const lastMsg = messages[messages.length - 1];
		const showOptions = !gameState.isFinished && lastMsg && lastMsg.type === 'ai' && !lastMsg.isReaction;
		const currentOptions = showOptions ? gameScript[gameState.step].options : [];
		
		showControls = true;
		if (currentOptions.length > 0) {
			controlsContent = React.createElement("div", { className: "wa-options-grid" },
				currentOptions.map((opt, i) => 
					React.createElement("button", { 
						key: i, 
						className: `wa-option-btn ${opt.style === 'truth' ? 'wa-btn-truth' : opt.style === 'myth' ? 'wa-btn-myth' : ''}`,
						onClick: () => onOptionSelect(opt)
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
					onClick: onReset,
					style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }
				}, React.createElement(RotateCcw, { size: 18 }), "Reintentar"),
				React.createElement("button", { 
					className: "wa-option-btn",
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
		if (msg.type === 'image') return React.createElement("img", { src: msg.content, className: "wa-msg-image", alt: "Adjunto" });
		if (msg.type === 'sticker') return React.createElement("img", { src: msg.content, className: "wa-sticker", alt: "Sticker" });
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
		return React.createElement(Markdown, { components: ChatText }, msg.content);
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
		chatId === 'nico' && !gameState.isFinished && React.createElement(ProgressBar, { step: gameState.step, total: gameScript.length }),
		
        React.createElement("div", { className: "wa-chat-bg", ref: scrollRef },
            React.createElement("div", { className: "wa-encryption-msg" },
                chatId === 'nico' ? "Actividad: Ayudo a mi compa." : 
				chatId === 'eval' ? "Resultados de la actividad." : "Mensajes con Jefatura."
            ),
            messages.map(msg => 
                React.createElement("div", { key: msg.id, className: `wa-bubble wa-bubble-${msg.type} ${msg.type === 'audio' ? 'wa-bubble-audio-custom' : ''} ${msg.type === 'contact_link' ? 'wa-bubble-ai' : ''}`, 
					style: msg.type === 'contact_link' ? { padding: 0, background: 'transparent', maxWidth: '300px' } : {} },
                    React.createElement("div", { className: "wa-bubble-content" },
						renderMessageContent(msg),
                        msg.type !== 'contact_link' && React.createElement("span", { className: "wa-msg-time" },
                            msg.timestamp,
                            msg.type === 'user' && React.createElement(Check, { size: 14, className: "wa-double-check" })
                        )
                    )
                )
            ),
			isTyping && React.createElement(TypingBubble, null)
        ),
        showControls && React.createElement("div", { className: "wa-chat-input-area wa-game-controls" },
			controlsContent
        )
    );
}

