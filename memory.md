# Resumen del Proyecto: V-Note

**Concepto General:**
* Aplicación web de transcripción de voz a texto diseñada para ser rápida, accesible y funcionar como una herramienta de productividad en segundo plano.

**Motores de Transcripción:**
* **Gemini API:** Integración con el modelo `gemini-3-flash-preview` para transcripciones de alta precisión (requiere conexión y API Key).
* **Local (Navegador):** Uso de la Web Speech API del navegador para transcripciones gratuitas, privadas y sin necesidad de API keys.

**Flujo de Trabajo y Productividad:**
* **Atajo de Teclado Global:** Uso de comandos personalizables (por defecto `Alt + R`) para iniciar y detener la grabación sin usar el ratón.
* **Auto-Copiado (Auto-Copy):** El texto transcrito se copia automáticamente al portapapeles al finalizar, permitiendo pegarlo directamente en cualquier otra aplicación o documento activo.

**Interfaz y Estética (Hardware Profesional):**
* Diseño oscuro y de alto contraste inspirado en equipos de audio profesionales (rejillas, indicadores LED, tipografía monoespaciada).
* Modal de confirmación personalizado y animado para acciones destructivas (como borrar el historial).
* Transiciones y micro-interacciones fluidas utilizando `motion`.

**Cápsula Dinámica (Indicador Flotante):**
* Píldora minimalista flotante en la parte inferior central de la pantalla, ideal para usar la app en una ventana reducida.
* **Ruleta de Idiomas:** Botón interactivo que alterna cíclicamente entre Inglés (EN), Español (ES), Francés (FR), Portugués (PT) y Automático (Globo terráqueo). El idioma seleccionado se envía directamente a la IA.
* **Onda Roja Animada:** Indicador visual que pasa de ser una línea estática a una onda fluida con gradiente rojo cuando el micrófono está grabando.

**Gestión de Datos:**
* **Historial Local:** Las transcripciones se guardan automáticamente en el `localStorage` del navegador.
* Opciones para copiar textos individuales, eliminar registros específicos o limpiar toda la base de datos.

**Adaptación a Ecosistema Apple (Paso previo a Capacitor):**
* **Refinamiento Estético ("Apple-Grade"):** La app incorporó el efecto "Glassmorphism" con `backdrop-blur` para paneles como el Sidbear y Stats Dashboard, logrando transparencia translúcida de estilo iOS/macOS.
* **Layout Nativo:** Soporte para "Safe Areas" previniendo colisiones con la Dynamic Island y notch (`env(safe-area-inset)`), junto con ocultamiento total y elegante del scrollbar nativo del navegador.
* **Tipografía del Sistema:** Sustitución de fuentes clásicas web por `-apple-system, BlinkMacSystemFont, "SF Pro Display"` para integración visual perfecta en dispositivos Apple.

**Capacidades Avanzadas de IA (Integración Multiprovedor):**
* **Ecosistema "Bring Your Own Key" (BYOK):** Soporte oficial para 5 proveedores líderes: **Groq (Whisper)**, **Gemini**, **Anthropic (Claude-3.5)**, **Qwen** y **OpenRouter**.
* **Magic Format (AI Enhancer):** Funcionalidad premium que permite transformar transcripciones en bruto en notas ejecutivas estructuradas utilizando modelos de razonamiento avanzado de Claude y Qwen.
* **Selección de Modelos:** Panel de configuración avanzado que permite al usuario especificar qué modelo desea usar (ej. Qwen-Max, Llama-3.1-405B).
* **Resiliencia y Fallback:** Sistema inteligente que detecta fallos en la nube o agotamiento de tokens y conmuta automáticamente al motor local, sugiriendo además enlaces a herramientas externas (Claude.ai, OpenCode) para asegurar la continuidad del trabajo.
* **Feedback Visual de Proveedor:** Cada nota grabada incluye un badge de color indicando específicamente qué IA realizó el procesamiento para total transparencia del usuario.
* **Notificaciones Premium (Toasts):** Sistema de avisos de alta fidelidad para informar sobre el estado de la conexión, copiado al portapapeles y alertas de cuota de API.
