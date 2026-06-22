/* iching.js
   Oráculo simple para Feed Me.
   64 respuestas originales inspiradas en los hexagramas del I Ching.
   No copia ninguna traducción específica.
*/

const ICHING = [
  {
    numero: 1,
    simbolo: "䷀",
    nombre: "Lo Creativo",
    clave: "Fuerza activa",
    respuesta: "El impulso avanza con potencia. Conviene actuar, pero sin soberbia."
  },
  {
    numero: 2,
    simbolo: "䷁",
    nombre: "Lo Receptivo",
    clave: "Disponibilidad",
    respuesta: "La situación pide apertura, escucha y sostén. No fuerces: acompañá el proceso."
  },
  {
    numero: 3,
    simbolo: "䷂",
    nombre: "La Dificultad Inicial",
    clave: "Nacimiento confuso",
    respuesta: "Todo comienzo trae desorden. Avanzá despacio y ordená las señales."
  },
  {
    numero: 4,
    simbolo: "䷃",
    nombre: "La Necedad Juvenil",
    clave: "Aprendizaje",
    respuesta: "No hay claridad todavía. Preguntar es útil, repetir sin comprender no."
  },
  {
    numero: 5,
    simbolo: "䷄",
    nombre: "La Espera",
    clave: "Tiempo suspendido",
    respuesta: "No todo se resuelve por acción inmediata. La espera también produce forma."
  },
  {
    numero: 6,
    simbolo: "䷅",
    nombre: "El Conflicto",
    clave: "Tensión",
    respuesta: "Hay fuerzas opuestas. No busques vencer: buscá comprender dónde se produjo la fricción."
  },
  {
    numero: 7,
    simbolo: "䷆",
    nombre: "El Ejército",
    clave: "Organización",
    respuesta: "La energía dispersa necesita dirección. La disciplina evita el desgaste."
  },
  {
    numero: 8,
    simbolo: "䷇",
    nombre: "La Solidaridad",
    clave: "Vínculo",
    respuesta: "Algo busca reunirse. Elegí con quién construir pertenencia."
  },
  {
    numero: 9,
    simbolo: "䷈",
    nombre: "La Fuerza Domesticadora de lo Pequeño",
    clave: "Contención",
    respuesta: "Los cambios pequeños acumulan poder. No subestimes lo mínimo."
  },
  {
    numero: 10,
    simbolo: "䷉",
    nombre: "El Porte",
    clave: "Cuidado en el paso",
    respuesta: "Avanzá con atención. Una forma delicada puede atravesar una situación peligrosa."
  },
  {
    numero: 11,
    simbolo: "䷊",
    nombre: "La Paz",
    clave: "Comunicación",
    respuesta: "Las fuerzas se encuentran. Hay circulación, intercambio y posibilidad de acuerdo."
  },
  {
    numero: 12,
    simbolo: "䷋",
    nombre: "El Estancamiento",
    clave: "Cierre",
    respuesta: "La comunicación se corta. No insistas en una puerta que ahora no abre."
  },
  {
    numero: 13,
    simbolo: "䷌",
    nombre: "La Comunidad con los Hombres",
    clave: "Encuentro",
    respuesta: "La salida aparece al compartir una dirección común."
  },
  {
    numero: 14,
    simbolo: "䷍",
    nombre: "La Posesión de lo Grande",
    clave: "Abundancia",
    respuesta: "Hay recursos disponibles. La pregunta es cómo usarlos sin perder medida."
  },
  {
    numero: 15,
    simbolo: "䷎",
    nombre: "La Modestia",
    clave: "Equilibrio",
    respuesta: "La fuerza verdadera no necesita exhibirse. Reducir el exceso abre camino."
  },
  {
    numero: 16,
    simbolo: "䷏",
    nombre: "El Entusiasmo",
    clave: "Impulso colectivo",
    respuesta: "La energía crece cuando encuentra ritmo. Cuidá que el entusiasmo no se vuelva ceguera."
  },
  {
    numero: 17,
    simbolo: "䷐",
    nombre: "El Seguimiento",
    clave: "Adaptación",
    respuesta: "Seguir no siempre es obedecer. A veces es leer la corriente justa."
  },
  {
    numero: 18,
    simbolo: "䷑",
    nombre: "El Trabajo sobre lo Echado a Perder",
    clave: "Reparación",
    respuesta: "Algo heredado necesita revisión. No alcanza con continuar: hay que corregir."
  },
  {
    numero: 19,
    simbolo: "䷒",
    nombre: "El Acercamiento",
    clave: "Aproximación",
    respuesta: "Algo se aproxima con fuerza favorable. Recibilo sin precipitarte."
  },
  {
    numero: 20,
    simbolo: "䷓",
    nombre: "La Contemplación",
    clave: "Observación",
    respuesta: "Antes de actuar, mirá. La forma de observar modifica lo observado."
  },
  {
    numero: 21,
    simbolo: "䷔",
    nombre: "La Mordedura Tajante",
    clave: "Decisión",
    respuesta: "Hay un obstáculo que debe ser atravesado con claridad."
  },
  {
    numero: 22,
    simbolo: "䷕",
    nombre: "La Gracia",
    clave: "Apariencia",
    respuesta: "La forma importa, pero no debe tapar lo esencial."
  },
  {
    numero: 23,
    simbolo: "䷖",
    nombre: "La Desintegración",
    clave: "Desprendimiento",
    respuesta: "Algo se cae porque ya no sostiene. No confundas pérdida con fracaso."
  },
  {
    numero: 24,
    simbolo: "䷗",
    nombre: "El Retorno",
    clave: "Vuelta",
    respuesta: "Después del alejamiento aparece una señal de regreso."
  },
  {
    numero: 25,
    simbolo: "䷘",
    nombre: "La Inocencia",
    clave: "Espontaneidad",
    respuesta: "Actuá sin cálculo excesivo. Lo forzado rompe el equilibrio."
  },
  {
    numero: 26,
    simbolo: "䷙",
    nombre: "La Fuerza Domesticadora de lo Grande",
    clave: "Reserva",
    respuesta: "Hay potencia acumulada. No la gastes antes de tiempo."
  },
  {
    numero: 27,
    simbolo: "䷚",
    nombre: "Las Comisuras de la Boca",
    clave: "Alimento",
    respuesta: "Preguntá qué alimentás y qué te consume."
  },
  {
    numero: 28,
    simbolo: "䷛",
    nombre: "La Preponderancia de lo Grande",
    clave: "Exceso",
    respuesta: "La estructura soporta demasiado peso. Es necesario redistribuir la carga."
  },
  {
    numero: 29,
    simbolo: "䷜",
    nombre: "Lo Abismal",
    clave: "Riesgo repetido",
    respuesta: "La dificultad se repite. La salida está en aprender el patrón."
  },
  {
    numero: 30,
    simbolo: "䷝",
    nombre: "Lo Adherente",
    clave: "Claridad",
    respuesta: "La luz necesita un soporte. La claridad también depende del vínculo."
  },
  {
    numero: 31,
    simbolo: "䷞",
    nombre: "La Influencia",
    clave: "Atracción",
    respuesta: "Algo afecta sin imponerse. Prestá atención a lo que te mueve."
  },
  {
    numero: 32,
    simbolo: "䷟",
    nombre: "La Duración",
    clave: "Persistencia",
    respuesta: "No todo cambio es ruptura. Algunas fuerzas crecen por continuidad."
  },
  {
    numero: 33,
    simbolo: "䷠",
    nombre: "La Retirada",
    clave: "Distancia",
    respuesta: "Retirarse puede ser una forma inteligente de conservar energía."
  },
  {
    numero: 34,
    simbolo: "䷡",
    nombre: "El Poder de lo Grande",
    clave: "Fuerza",
    respuesta: "Hay potencia, pero debe ser orientada. La fuerza sin medida se vuelve daño."
  },
  {
    numero: 35,
    simbolo: "䷢",
    nombre: "El Progreso",
    clave: "Avance",
    respuesta: "La luz asciende. Aprovechá el impulso sin olvidar el suelo."
  },
  {
    numero: 36,
    simbolo: "䷣",
    nombre: "El Oscurecimiento de la Luz",
    clave: "Protección",
    respuesta: "Cuando el entorno no permite brillar, conviene cuidar la llama."
  },
  {
    numero: 37,
    simbolo: "䷤",
    nombre: "La Familia",
    clave: "Estructura íntima",
    respuesta: "Los vínculos cercanos ordenan o desordenan el mundo."
  },
  {
    numero: 38,
    simbolo: "䷥",
    nombre: "La Oposición",
    clave: "Diferencia",
    respuesta: "No toda diferencia exige separación. A veces muestra otra perspectiva."
  },
  {
    numero: 39,
    simbolo: "䷦",
    nombre: "El Impedimento",
    clave: "Obstáculo",
    respuesta: "El camino directo está bloqueado. Buscá rodear, pedir ayuda o esperar."
  },
  {
    numero: 40,
    simbolo: "䷧",
    nombre: "La Liberación",
    clave: "Alivio",
    respuesta: "La tensión empieza a soltarse. No vuelvas a cargar lo que acaba de caer."
  },
  {
    numero: 41,
    simbolo: "䷨",
    nombre: "La Merma",
    clave: "Reducción",
    respuesta: "Quitar puede ser una forma de cuidar. Menos también puede ser más verdadero."
  },
  {
    numero: 42,
    simbolo: "䷩",
    nombre: "El Aumento",
    clave: "Crecimiento",
    respuesta: "Algo se expande. Acompañá el crecimiento con responsabilidad."
  },
  {
    numero: 43,
    simbolo: "䷪",
    nombre: "El Desbordamiento",
    clave: "Declaración",
    respuesta: "Lo acumulado necesita expresarse. Decí lo necesario sin violencia."
  },
  {
    numero: 44,
    simbolo: "䷫",
    nombre: "El Ir al Encuentro",
    clave: "Aparición inesperada",
    respuesta: "Algo pequeño entra en escena y puede alterar el conjunto."
  },
  {
    numero: 45,
    simbolo: "䷬",
    nombre: "La Reunión",
    clave: "Convergencia",
    respuesta: "Las partes dispersas buscan un centro. Reunir también exige cuidado."
  },
  {
    numero: 46,
    simbolo: "䷭",
    nombre: "La Subida",
    clave: "Ascenso gradual",
    respuesta: "El avance es lento pero real. Lo importante es sostener la dirección."
  },
  {
    numero: 47,
    simbolo: "䷮",
    nombre: "La Opresión",
    clave: "Agotamiento",
    respuesta: "La presión reduce el margen de acción. Cuidá tu energía antes de decidir."
  },
  {
    numero: 48,
    simbolo: "䷯",
    nombre: "El Pozo",
    clave: "Fuente",
    respuesta: "Hay una fuente disponible, pero necesita ser cuidada para seguir dando."
  },
  {
    numero: 49,
    simbolo: "䷰",
    nombre: "La Revolución",
    clave: "Cambio de piel",
    respuesta: "Una forma vieja ya no alcanza. El cambio pide tiempo justo."
  },
  {
    numero: 50,
    simbolo: "䷱",
    nombre: "El Caldero",
    clave: "Transformación",
    respuesta: "Lo crudo se transforma mediante cuidado, tiempo y fuego."
  },
  {
    numero: 51,
    simbolo: "䷲",
    nombre: "Lo Suscitativo",
    clave: "Sacudida",
    respuesta: "Algo irrumpe y despierta. El sobresalto también puede ordenar."
  },
  {
    numero: 52,
    simbolo: "䷳",
    nombre: "El Aquietamiento",
    clave: "Detención",
    respuesta: "Detenerse no es fallar. A veces el cuerpo sabe antes que la mente."
  },
  {
    numero: 53,
    simbolo: "䷴",
    nombre: "El Desarrollo",
    clave: "Maduración",
    respuesta: "Lo importante crece por etapas. No apures lo que necesita raíz."
  },
  {
    numero: 54,
    simbolo: "䷵",
    nombre: "La Muchacha que se Casa",
    clave: "Posición incómoda",
    respuesta: "No estás en pleno control de la situación. Movete con prudencia."
  },
  {
    numero: 55,
    simbolo: "䷶",
    nombre: "La Abundancia",
    clave: "Plenitud intensa",
    respuesta: "Hay mucho en juego y mucha luz. La abundancia también puede enceguecer."
  },
  {
    numero: 56,
    simbolo: "䷷",
    nombre: "El Andariego",
    clave: "Tránsito",
    respuesta: "Estás de paso. No cargues más de lo necesario."
  },
  {
    numero: 57,
    simbolo: "䷸",
    nombre: "Lo Suave",
    clave: "Penetración lenta",
    respuesta: "Lo sutil entra donde la fuerza no puede. Persistí sin violencia."
  },
  {
    numero: 58,
    simbolo: "䷹",
    nombre: "Lo Sereno",
    clave: "Apertura",
    respuesta: "La alegría compartida abre comunicación. Cuidá que no se vuelva superficial."
  },
  {
    numero: 59,
    simbolo: "䷺",
    nombre: "La Disolución",
    clave: "Dispersión",
    respuesta: "Lo rígido se afloja. Algo puede circular de nuevo."
  },
  {
    numero: 60,
    simbolo: "䷻",
    nombre: "La Limitación",
    clave: "Medida",
    respuesta: "El límite no siempre oprime. A veces permite respirar."
  },
  {
    numero: 61,
    simbolo: "䷼",
    nombre: "La Verdad Interior",
    clave: "Confianza profunda",
    respuesta: "La respuesta depende de una sinceridad que no necesita demostración."
  },
  {
    numero: 62,
    simbolo: "䷽",
    nombre: "La Preponderancia de lo Pequeño",
    clave: "Precisión mínima",
    respuesta: "No es momento de grandes gestos. Lo pequeño exige exactitud."
  },
  {
    numero: 63,
    simbolo: "䷾",
    nombre: "Después de la Consumación",
    clave: "Equilibrio frágil",
    respuesta: "Algo llegó a completarse, pero debe sostenerse con atención."
  },
  {
    numero: 64,
    simbolo: "䷿",
    nombre: "Antes de la Consumación",
    clave: "Inacabado",
    respuesta: "Todavía no está cerrado. La posibilidad sigue abierta."
  }
];

function tirarDado(caras = 64) {
  return Math.floor(Math.random() * caras) + 1;
}

function consultarIChing() {
  const numero = tirarDado(64);
  const hexagrama = ICHING.find(h => h.numero === numero);

  return {
    ...hexagrama,
    tirada: numero,
    fecha: new Date().toISOString()
  };
}

function mostrarConsulta() {
  const resultado = consultarIChing();

  console.log("Hexagrama:", resultado.numero, resultado.simbolo);
  console.log("Nombre:", resultado.nombre);
  console.log("Clave:", resultado.clave);
  console.log("Respuesta:", resultado.respuesta);

  return resultado;
}

// Ejemplo para Feed Me:
// const oraculo = consultarIChing();
// document.getElementById("mainMessage").textContent = oraculo.respuesta;
