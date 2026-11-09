// Ejemplo del estilo «Archivo»: «Si tu gato te mira mientras duermes» (archivo 017), formato corto: gancho + archivo +
// reglas 1 y 2 (1:38). Cada plano va anclado a una palabra de la voz (E("…")); dentro, t = segundos desde que empezó
// el plano y f = fotogramas. Las piezas están en src/estilos/archivo/piezas/ (ver estilos/archivo/LEEME.md).
import React from "react";
import ajustes from "../../ajustes.json";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { crearTiempos } from "../../estilos/archivo/tiempos";
import { Video as VideoArchivo } from "../../estilos/archivo/Video";
import { Bombilla, Cama, CasaFuera, Dormitorio, Interruptor, Linterna, Mesa, RelojDigital, Ventana } from "../../estilos/archivo/piezas/Casa";
import { CaraGato, GatoFrente, GatoSentado, OjosGato, parpadeo } from "../../estilos/archivo/piezas/Gato";
import { CabezaGrande, Empleado, PersonaCama } from "../../estilos/archivo/piezas/Persona";
import { Bocadillo, Cruz, Documento, EtiquetaTu, FilaCasillas, LogoNegociado, Rotulo, Sello, TarjetaDato, TarjetaRegla, TarjetaTitulo, Texto, Tick } from "../../estilos/archivo/piezas/Interfaz";
import voz from "../../../public/videos/ejemplo-gato/voz.tiempos.json";

export const ID = "ejemplo-gato";

export const T = crearTiempos(voz);
const E = T.en;

// Posiciones del dormitorio (Dormitorio en x = 330, suelo 800): la cabeza de TÚ y el sitio del gato a los pies
const CABEZA = { x: 1050, y: 424 };
const GATO = { x: 600, y: 500 };

const planos: Plano[] = [
  // ── gancho ──
  {
    desde: 0,
    entra: "negro",
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3.2, 1.06]])} cx={900} cy={560} suelo>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={0} respira={Math.sin(f / 22) * 3} />
        </Dormitorio>
        {t > E("tres") - 0.1 ? <RelojDigital x={1450} y={430} hora="03:04" escala={0.8 * pop(t - E("tres") + 0.1)} /> : null}
        <S en={E("tres")} n="blip_grave" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("Te despiertas"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.6], [2.2, 1.75]])} cx={CABEZA.x - 140} cy={CABEZA.y + 130} suelo>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={kf(t, [[0.25, 0], [0.5, 1]])} />
        </Dormitorio>
        <S en={0.25} n="blip" v={0.18} />
      </Lienzo>
    ),
  },
  {
    desde: E("La casa está"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [2.2, 1.04]])} suelo>
        <CasaFuera x={960} y={800} ventanas={[false, false]} />
      </Lienzo>
    ),
  },
  {
    desde: E("Y a los pies"),
    pinta: (t, f) => {
      const k = t - (E("dos puntos") - E("Y a los pies"));
      return (
        <Lienzo zoom={kf(t, [[0, 1.3], [3.4, 1.55]])} cx={kf(t, [[0, 820], [3.4, 640]])} cy={520} suelo>
          <Dormitorio>
            <PersonaCama {...CABEZA} ojos={1} />
            {/* el gato a oscuras: solo se ven los ojos cuando la voz los nombra */}
            <GatoSentado {...GATO} f={f} oscuro halo={k > 0 ? 1 : 0} abre={k > 0 ? Math.min(1, k / 0.25) : 0} pupila={0.2} cola={0} />
          </Dormitorio>
          <S en={E("dos puntos") - E("Y a los pies")} n="impacto" v={0.4} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Es tu gato"),
    pinta: (t, f) => (
      <Lienzo zoom={1.55} cx={640} cy={520} suelo>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={1} />
          <GatoSentado {...GATO} f={f} oscuro halo={1} pupila={0.2} cola={0} />
          <g opacity={fade(t, 0.7)}>
            <GatoSentado {...GATO} f={f} halo={0.6} pupila={0.2} cola={0} />
          </g>
        </Dormitorio>
      </Lienzo>
    ),
  },
  {
    desde: E("Está sentado"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 2.2], [2.8, 2.4]])} cx={600} cy={330}>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={1} />
          <GatoSentado {...GATO} f={f} halo={0.6} pupila={0.2} cola={kf(t, [[0, 1], [E("Muy quieto") - E("Está sentado") + 0.6, 0]])} />
        </Dormitorio>
      </Lienzo>
    ),
  },
  {
    desde: E("Mirándote"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 4.6], [1.6, 5.4]])} cx={650} cy={285}>
        {/* sin la ventana detrás: solo el gato y la cama, para que el ojo mande */}
        <Cama x={330} y={800} w={900} />
        <GatoSentado {...GATO} f={f} halo={0.8} pupila={kf(t, [[0, 0.5], [1.2, 0.12]])} cola={0} />
      </Lienzo>
    ),
  },
  {
    desde: E("Si esto te ha pasado"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo>
        <Documento x={960} y={560} titulo="ARCHIVO 017" k={t} lineas={8}>
          <g transform="translate(0 120)" fill={C.negro} opacity={0.9}>
            <ellipse rx={34} ry={28} />
            <circle cx={-40} cy={-34} r={14} />
            <circle cx={-14} cy={-52} r={14} />
            <circle cx={14} cy={-52} r={14} />
            <circle cx={40} cy={-34} r={14} />
          </g>
        </Documento>
        <EtiquetaTu x={960} y={150} k={t - (E("para ti") - E("Si esto te ha pasado"))} f={f} texto="PARA TI" />
        <S en={0.05} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("No enciendas la luz"),
    pinta: (t) => (
      <Lienzo>
        <Interruptor x={960} y={520} escala={2.2} />
        <Cruz x={960} y={520} k={t - 0.55} tam={300} />
        <S en={0.55} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("No digas nada"),
    pinta: (t) => (
      <Lienzo>
        <CabezaGrande x={1200} y={470} r={190} ojos={1} />
        <Bocadillo x={950} y={330} texto="…" k={t - 0.1} haciaIzquierda tam={80} ancho={320} />
        <Cruz x={780} y={230} k={t - 0.6} tam={190} />
        <S en={0.6} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Y sobre todo"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [1.4, 1.08]])} cx={960} cy={520}>
        <CaraGato x={960} y={520} pupila={0.3} halo={0.7} abre={1 - parpadeo(f, 2)} />
      </Lienzo>
    ),
  },
  {
    desde: E("no le preguntes"),
    pinta: (t, f) => (
      <Lienzo zoom={1.08} cx={960} cy={520}>
        <CaraGato x={960} y={520} pupila={0.3} halo={0.7} abre={1 - parpadeo(f, 2)} />
        <Bocadillo x={560} y={330} texto="¿QUÉ QUIERES?" k={t - 0.2} haciaIzquierda tam={38} />
        <Cruz x={300} y={200} k={t - 0.9} tam={130} />
        <S en={0.9} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  // ── archivo 017 ──
  {
    desde: E("Archivo cero"),
    entra: "glitch",
    pinta: (t) => <TarjetaTitulo grande="ARCHIVO 017" pequeno={t > E("Felino") - E("Archivo cero") ? "FELINO DOMÉSTICO" : undefined} k={t} />,
  },
  {
    desde: E("Negociado"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 017" />
        <Empleado x={960} y={560} cabeza={Math.sin(f / 30) * 1.5} />
        <LogoNegociado x={1560} y={300} r={70} texto k={t - 0.3} />
        <S en={0.3} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("Hay siete reglas"),
    pinta: (t) => {
      const kMarca = t - (E("cumplen seis") - E("Hay siete reglas"));
      return (
        <Lienzo>
          <FilaCasillas x={960} y={520} marcadas={6} k={t} kMarca={kMarca} tam={104} ultimaInterrogante={t > E("sin saberlo") - E("Hay siete reglas")} />
          {Array.from({ length: 7 }, (_, i) => (
            <S key={i} en={0.12 * i} n="blip" v={0.12} />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <S key={`m${i}`} en={E("cumplen seis") - E("Hay siete reglas") + 0.28 * i} n="blip" v={0.15} />
          ))}
        </Lienzo>
      );
    },
  },
  // ── regla 1 ──
  {
    desde: E("Regla número uno"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={1} titulo="NO ENCIENDAS LA LUZ" k={t} escribeDesde={E("No enciendas", 42) - E("Regla número uno")} />,
  },
  {
    desde: E("Tu gato ve"),
    pinta: (t, f) => (
      <Lienzo>
        <CabezaGrande x={380} y={360} r={120} ojos={1} cuello={false} />
        <EtiquetaTu x={380} y={200} k={t} f={f} />
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i} opacity={pop(t - 0.9 - i * 0.14)}>
            <Bombilla x={700 + i * 150} y={340} encendida escala={0.8} />
          </g>
        ))}
        <CaraGato x={380} y={680} r={110} halo={0.4} />
        <g opacity={pop(t - 2.1)}>
          <Bombilla x={700} y={660} encendida escala={0.8} />
        </g>
        <Texto x={1700} y={380} texto="× 6" tam={80} k={t - 1.8} />
        <Texto x={1000} y={700} texto="× 1" tam={80} k={t - 2.2} />
        {Array.from({ length: 7 }, (_, i) => (
          <S key={i} en={0.9 + i * 0.14} n="blip" v={0.1} />
        ))}
      </Lienzo>
    ),
  },
  {
    desde: E("A oscuras"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [2.5, 1.05]])} cx={960} cy={540}>
        <CabezaGrande x={960} y={470} r={190} ojos={0.12} />
        <Rotulo x={300} y={240} grande="VISTA DEL GATO" pequeno="03:04 · DORMITORIO" k={t - 0.3} />
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
          <polyline key={i} points={`${960 + sx * 520},${500 + sy * 280 - sy * 40} ${960 + sx * 520},${500 + sy * 280} ${960 + sx * 520 - sx * 40},${500 + sy * 280}`} fill="none" stroke={C.gris} strokeWidth={6} opacity={fade(t - 0.3)} />
        ))}
        <circle cx={1440} cy={240} r={9} fill={C.rojo} opacity={Math.floor(t * 2) % 2 ? 1 : 0.2} />
        <Texto x={1470} y={250} texto="REC" tam={24} color={C.gris} ancla="start" />
      </Lienzo>
    ),
  },
  {
    desde: E("Tú solo ves"),
    pinta: (t, f) => (
      <Lienzo>
        <OjosGato x={960} y={520} r={72} abre={1 - parpadeo(f, 5)} pupila={0.22} mira={[Math.sin(t) * 0.3, 0]} halo={1} />
      </Lienzo>
    ),
  },
  {
    desde: E("Si enciendes"),
    pinta: (t, f) => {
      const on = t > 0.45;
      return (
        <Lienzo zoom={1.25} cx={900} cy={560} suelo={on}>
          <g opacity={on ? 1 : 0}>
            <Dormitorio>
              <PersonaCama {...CABEZA} ojos={1} />
              <GatoSentado {...GATO} f={f} halo={0.2} pupila={0.1} cola={0.4} />
            </Dormitorio>
            <Bombilla x={900} y={240} encendida escala={0.7} />
          </g>
          <Interruptor x={on ? 1560 : 960} y={on ? 470 : 520} encendido={on} escala={on ? 0.9 : 2.2} />
          <S en={0.45} n="blip" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Y a él no le gusta"),
    pinta: (t, f) => (
      <Lienzo>
        <CaraGato x={820} y={540} r={230} orejas={-1} pupila={0.08} halo={0.5} abre={1 - parpadeo(f, 1)} mira={[0.6, -0.2]} />
        <Bombilla x={1520} y={330} encendida escala={0.9} />
        <Cruz x={1520} y={330} k={t - 0.9} tam={200} />
        <S en={0.9} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Sus ojos brillan"),
    pinta: (t) => {
      const kLuz = t - (E("Devuelve") - E("Sus ojos brillan"));
      const ida = kf(kLuz, [[0, 0], [0.45, 1]]);
      const vuelta = kf(kLuz, [[0.5, 0], [1.0, 1]]);
      return (
        <Lienzo>
          {/* el ojo en corte: el globo y, detrás, la capa espejo */}
          <path d="M 1180 240 A 300 300 0 0 1 1180 840" fill="none" stroke={C.blanco} strokeWidth={34} strokeLinecap="round" opacity={fade(t - 0.6)} />
          <circle cx={960} cy={540} r={260} fill="none" stroke={C.blanco} strokeWidth={14} />
          <ellipse cx={720} cy={540} rx={40} ry={150} fill={C.amarillo} />
          <ellipse cx={720} cy={540} rx={12} ry={120} fill="#151006" />
          <Texto x={1420} y={200} texto="CAPA ESPEJO" tam={34} color={C.gris} k={t - 0.6} />
          {kLuz > 0 ? (
            <g>
              <line x1={200} y1={540} x2={200 + 940 * ida} y2={540} stroke={C.amarillo} strokeWidth={10} strokeLinecap="round" />
              {vuelta > 0 ? <line x1={1140} y1={540} x2={1140 - 940 * vuelta} y2={600} stroke={C.amarillo} strokeWidth={10} strokeLinecap="round" /> : null}
            </g>
          ) : null}
          <S en={E("Devuelve") - E("Sus ojos brillan") + 0.45} n="blip" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Por eso parecen"),
    pinta: (t) => {
      const kNo = t - (E("No son linternas") - E("Por eso parecen"));
      return (
        <Lienzo>
          <Linterna x={520} y={440} haz={kf(t, [[0.2, 0], [0.7, 1]])} escala={1.1} />
          <Linterna x={520} y={660} haz={kf(t, [[0.4, 0], [0.9, 1]])} escala={1.1} />
          <Cruz x={960} y={550} k={kNo} tam={360} />
          <S en={0.2} n="blip" v={0.15} />
          <S en={0.4} n="blip" v={0.15} />
          <S en={E("No son linternas") - E("Por eso parecen")} n="blip_grave" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Son ventanas"),
    pinta: (t, f) => {
      const kDetras = t - (E("Y él está detrás") - E("Son ventanas"));
      return (
        <Lienzo>
          <g opacity={fade(t, 0.3)}>
            <Ventana x={640} y={470} tam={440} luna={false} encendida />
            <Ventana x={1280} y={470} tam={440} luna={false} encendida />
          </g>
          {kDetras > 0 ? (
            <g opacity={fade(kDetras, 0.5)}>
              <g clipPath="url(#v1)">
                <GatoFrente x={640} y={700} escala={0.8} f={f} oscuro halo={0} abre={1} pupila={0.15} />
              </g>
              <g clipPath="url(#v2)">
                <GatoFrente x={1280} y={700} escala={0.8} f={f} oscuro halo={0} abre={1} pupila={0.15} />
              </g>
            </g>
          ) : null}
          <defs>
            <clipPath id="v1">
              <rect x={420} y={250} width={440} height={440} />
            </clipPath>
            <clipPath id="v2">
              <rect x={1060} y={250} width={440} height={440} />
            </clipPath>
          </defs>
          <S en={E("Y él está detrás") - E("Son ventanas")} n="impacto" v={0.45} />
        </Lienzo>
      );
    },
  },
  // ── regla 2 ──
  {
    desde: E("Regla número dos"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={2} titulo="SI TE MIRA FIJAMENTE… PARPADEA DESPACIO" k={t} escribeDesde={E("Si te mira") - E("Regla número dos")} />,
  },
  {
    desde: E("Cierra los ojos"),
    pinta: (t) => (
      <Lienzo>
        <CabezaGrande x={960} y={480} r={200} ojos={kf(t, [[0.2, 1], [0.9, 0]])} />
      </Lienzo>
    ),
  },
  {
    desde: E("Cuenta hasta dos"),
    pinta: (t) => (
      <Lienzo>
        <CabezaGrande x={760} y={480} r={200} ojos={0} />
        <Texto x={1300} y={560} texto="1" tam={260} peso={900} k={t - 0.35} />
        <Texto x={1560} y={560} texto="2" tam={260} peso={900} k={t - 0.95} />
        <S en={0.35} n="blip" v={0.2} />
        <S en={0.95} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("Ábrelos"),
    pinta: (t) => (
      <Lienzo>
        <CabezaGrande x={960} y={480} r={200} ojos={kf(t, [[0.15, 0], [0.55, 1]])} />
      </Lienzo>
    ),
  },
  {
    desde: E("Esto no es un truco"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 017" />
        <Empleado x={960} y={560} cabeza={t > 0.5 && t < 1.7 ? Math.sin((t - 0.5) * 16) * 7 : 0} />
        <LogoNegociado x={1560} y={300} r={70} texto />
      </Lienzo>
    ),
  },
  {
    desde: E("Un estudio"),
    pinta: (t) => {
      const kSello = t - (E("lo comprobó") - E("Un estudio"));
      return (
        <Lienzo>
          <TarjetaDato x={960} y={500} w={1040} h={520} fuente="ESTUDIO SOBRE EL PARPADEO LENTO · SCIENTIFIC REPORTS · 2020" k={t}>
            <Documento x={-250} y={0} w={360} h={420} lineas={7} giro={-3} k={t - 0.2} />
            <g transform="translate(140 -40)" opacity={fade(t - 0.5)}>
              <CaraGato x={0} y={0} r={90} halo={0.3} abre={kf(t, [[1.2, 1], [1.8, 0.05], [2.4, 0.05], [2.9, 1]])} />
            </g>
          </TarjetaDato>
          <Sello x={1240} y={640} texto="COMPROBADO" color={C.verde} k={kSello} giro={-10} />
          <S en={E("lo comprobó") - E("Un estudio")} n="impacto" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Para un gato"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3.4, 1.06]])} cx={960} cy={520}>
        <CaraGato x={960} y={520} pupila={0.35} halo={0.6} abre={kf(t, [[0.8, 1], [1.7, 0.03], [2.3, 0.03], [3.1, 1]])} />
        <Tick x={1420} y={260} k={t - 3.3} tam={110} />
        <S en={3.3} n="blip" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("Si tu gato te devuelve"),
    pinta: (t, f) => {
      const kOk = t - (E("has pasado") - E("Si tu gato te devuelve"));
      return (
        <Lienzo zoom={1.35} cx={760} cy={500} suelo>
          <Dormitorio>
            <PersonaCama {...CABEZA} ojos={1} />
            <GatoSentado {...GATO} f={f} halo={0.5} pupila={0.25} cola={0.3} abre={kf(t, [[0.6, 1], [1.4, 0.03], [1.9, 0.03], [2.6, 1]])} />
          </Dormitorio>
          <Tick x={620} y={120} k={kOk} tam={100} />
          <S en={E("has pasado") - E("Si tu gato te devuelve")} n="blip" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Si no lo hace"),
    entra: "glitch",
    pinta: () => (
      <Lienzo zoom={1.1} cx={960} cy={520}>
        <CaraGato x={960} y={520} pupila={0.06} halo={0.9} abre={1} orejas={0.6} />
      </Lienzo>
    ),
  },
  {
    desde: E("vuelve a intentarlo"),
    pinta: (t) => (
      <Lienzo>
        <CabezaGrande x={960} y={480} r={200} ojos={kf(t, [[0.1, 1], [0.6, 0], [1.1, 0], [1.4, 1]])} sudor />
      </Lienzo>
    ),
  },
  {
    desde: E("Y no apartes"),
    pinta: (t, f) => (
      <Lienzo>
        <OjosGato x={960} y={520} r={80} abre={1} pupila={kf(t, [[0, 0.3], [2.5, 0.08]])} mira={[kf(t, [[0, -0.5], [1.6, 0]]), 0]} halo={1} />
        <S en={0.05} n="latido" v={0.3} />
        <S en={1.2} n="latido" v={0.3} />
      </Lienzo>
    ),
  },
];

/** Duración total: la voz más la cola del apagón. */
export const DURACION = T.duracion + 1.6;

export const Video: React.FC = () => (
  <VideoArchivo
    canal={ajustes.canal}
    planos={planos}
    frases={T.frases}
    duracion={DURACION}
    archivo="017"
    reglas={[E("Regla número uno"), E("Regla número dos")]}
    voz="videos/ejemplo-gato/voz.mp3"
    musica={[{ archivo: "dark-tension-eerie-drone--shadowlands-1-horizon.mp3", volumen: 0.05 }]}
    apagon={T.duracion + 0.7}
  />
);
