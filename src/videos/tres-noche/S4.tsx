// Bloque 4: regla seis (alguien más despierto), la siete clasificada, el giro «El turno», la siete de verdad, el
// cierre, el CTA final y «Buenas noches».
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { CasaFuera, Dormitorio, Linterna, Mesa, Pasillo, Puerta, RelojDigital, Vaso } from "../../estilos/archivo/piezas/Casa";
import { CabezaGrande, Empleado, PersonaCama, PersonaDePie } from "../../estilos/archivo/piezas/Persona";
import { Bocadillo, Cruz, EtiquetaTu, FilaCasillas, LogoNegociado, PantallaCTA, TarjetaRegla, Texto, Tick } from "../../estilos/archivo/piezas/Interfaz";
import { FichaSujeto, PantallaFinal, Recorte } from "../../estilos/archivo/piezas/Archivo";
import { Ondas } from "../../estilos/archivo/piezas/Perro";
import { CABEZA, E, Fuego, R } from "./comun";

// la regla siete se dice dos veces: la clasificada y la de verdad
const SIETE = () => E("Regla número siete");
const GIRO = () => E("Este archivo no va");
const SIETE_VERDAD = () => E("Regla número siete", GIRO());
const CTA = () => E("Queda un trámite");

/** Puerta cerrada con la raya de luz por debajo (alguien despierto dentro). */
const PuertaLuz: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (
  <g>
    <Puerta x={x} y={y} w={300} h={540} />
    <rect x={x - 150} y={y - 14} width={300} height={14} fill={C.amarillo} opacity={fade(k, 0.4)} />
  </g>
);

export const PLANOS_S4: Plano[] = [
  // ── regla 6 ──
  {
    desde: E("Regla número seis"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={6} titulo="SI HAY ALGUIEN MÁS DESPIERTO, NO PREGUNTES" k={t} escribeDesde={R("Regla número seis", "Si hay alguien")} />,
  },
  {
    desde: E("Lo sabrás por la luz"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={960} cy={500} suelo>
        <PuertaLuz x={960} y={800} k={t - R("Lo sabrás por la luz", "bajo su puerta")} />
      </Lienzo>
    ),
  },
  {
    desde: E("O por el ruido de un vaso"),
    pinta: (t) => (
      <Lienzo>
        <Vaso x={960} y={540} escala={2.2} />
        <Ondas x={1160} y={480} k={t - 0.3} />
        <S en={R("O por el ruido de un vaso", "vaso")} n="cristal" v={0.15} />
      </Lienzo>
    ),
  },
  {
    desde: E("Está haciendo lo mismo que tú"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Pasillo />
        <PersonaDePie x={760} y={800} pose="quieto" />
        <PersonaDePie x={1160} y={800} pose="quieto" haciaIzquierda />
        <EtiquetaTu x={760} y={460} k={t - R("Está haciendo lo mismo", "que tú")} f={f} />
      </Lienzo>
    ),
  },
  {
    desde: E("Mañana, en el desayuno"),
    pinta: (t) => {
      const kT = R("Mañana, en el desayuno", "Tú también lo dirás");
      const kN = R("Mañana, en el desayuno", "Los dos sabéis");
      return (
        <Lienzo suelo>
          <PersonaDePie x={660} y={800} pose="sentado" />
          <PersonaDePie x={1260} y={800} pose="sentado" haciaIzquierda />
          <rect x={760} y={590} width={400} height={26} rx={8} fill="url(#blanco)" />
          <rect x={940} y={616} width={40} height={184} fill={C.gris} />
          <Bocadillo x={1220} y={430} texto="HE DORMIDO BIEN" k={t - 0.3} tam={44} ancho={460} />
          {t > kT ? <Bocadillo x={700} y={430} texto="YO TAMBIÉN" k={t - kT} haciaIzquierda={false} tam={44} ancho={360} /> : null}
          {t > kN ? <Cruz x={960} y={300} k={t - kN - 0.4} tam={120} /> : null}
          <S en={kN + 0.4} n="blip_grave" v={0.25} />
        </Lienzo>
      );
    },
  },
  // ── regla 7 clasificada ──
  {
    desde: SIETE(),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={7} titulo="" k={t} />,
  },
  {
    desde: E("La regla siete todavía"),
    pinta: (t) => (
      <Lienzo>
        <rect x={560} y={330} width={800} height={300} rx={10} fill="none" stroke={C.gris} strokeWidth={10} />
        <Texto x={960} y={420} texto="REGLA 7" tam={60} color={C.gris} />
        {["Z", "Z", "Z"].map((z, i) => (
          <Texto key={i} x={1130 + i * 60} y={600 - i * 36 - ((t * 20) % 20)} texto={z} tam={60 + i * 16} peso={900} color={C.gris} k={t - 0.4 - i * 0.4} />
        ))}
      </Lienzo>
    ),
  },
  {
    desde: E("Gracias"),
    pinta: () => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 019" />
        <Empleado x={960} y={560} />
      </Lienzo>
    ),
  },
  {
    desde: E("Seis reglas"),
    pinta: (t) => (
      <Lienzo>
        <FilaCasillas x={960} y={520} marcadas={6} k={1} kMarca={9} tam={104} ultimaInterrogante={t > R("Seis reglas", "Alguien sí")} />
        <S en={R("Seis reglas", "Alguien sí")} n="impacto" v={0.3} />
      </Lienzo>
    ),
  },
  // ── el turno ──
  {
    desde: GIRO(),
    entra: "glitch",
    pinta: (t) => (
      <Lienzo>
        <RelojDigital x={960} y={480} hora="03:04" escala={1.5} />
        <Cruz x={960} y={480} k={t - 1.3} tam={300} />
        <S en={1.3} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Sujeto"),
    pinta: (t) => {
      const k1 = R("Sujeto", "Duerme de un tirón");
      const k2 = R("Sujeto", "Con la luz del móvil");
      const k3 = R("Sujeto", "Nunca hace la ronda");
      const lineas = [
        ...(t > k1 ? [{ texto: "DUERME DE UN TIRÓN", ok: true }] : []),
        ...(t > k2 ? [{ texto: "CON LA LUZ DEL MÓVIL", ok: true }] : []),
        ...(t > k3 ? [{ texto: "HACE LA RONDA", ok: false }] : []),
      ];
      return (
        <Lienzo>
          <FichaSujeto x={960} y={480} archivo="019" valor="UN HUMANO ADULTO" letras={Math.floor(Math.max(0, t - 0.6) * 14)} lineas={lineas} foto={<CabezaGrande x={0} y={10} r={70} ojos={1} cuello={false} />} k={t} />
          <S en={k3} n="blip_grave" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Tu casa no está acostumbrada"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.05]])} cx={960} cy={520} suelo>
        <CasaFuera x={960} y={800} ventanas={[false, false]} ojos={t > 1} />
        <S en={1} n="latido" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Durante siglos, en cada casa"),
    entra: "glitch",
    pinta: (t, f) => {
      const kA = R("Durante siglos, en cada casa", "Avivaba el fuego");
      const kP = R("Durante siglos, en cada casa", "Miraba la puerta");
      const kE = R("Durante siglos, en cada casa", "Escuchaba");
      return (
        <Lienzo suelo>
          <Fuego x={560} y={800} f={f} vivo={t > kA ? 1.2 : 0.7} />
          <PersonaDePie x={960} y={800} pose="sentado" haciaIzquierda={t < kP} />
          <Puerta x={1460} y={800} />
          {t > kE ? <Ondas x={1200} y={420} k={t - kE} /> : null}
          <RelojDigital x={960} y={220} hora="03:04" escala={0.5} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Tu casa todavía lo espera"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.06]])} cx={960} cy={520} suelo>
        <CasaFuera x={960} y={800} ventanas={[false, t > 0.8]} />
        <S en={0.8} n="clic" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("Por eso te despierta a ti"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.06]])} cx={960} cy={480}>
        <CabezaGrande x={960} y={470} r={220} ojos={1} />
        <EtiquetaTu x={1230} y={290} k={t - R("Por eso te despierta", "a ti")} f={f} />
        <S en={R("Por eso te despierta", "a ti")} n="impacto" v={0.3} />
      </Lienzo>
    ),
  },
  // ── regla 7 de verdad ──
  {
    desde: SIETE_VERDAD(),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={7} titulo="LEVÁNTATE. ES TU TURNO" k={t} escribeDesde={R("Regla número siete", "Cuando te despiertes", GIRO())} />,
  },
  {
    desde: E("Levántate", SIETE_VERDAD()),
    pinta: (t) => (
      <Lienzo suelo>
        <Pasillo />
        <PersonaDePie x={kf(t, [[0, 400], [4, 1300]])} y={800} pose="anda" fase={(t * 1.4) % 1} />
      </Lienzo>
    ),
  },
  {
    desde: E("Comprueba la puerta"),
    pinta: (t) => (
      <Lienzo suelo>
        <Puerta x={960} y={800} w={300} h={540} />
        <Tick x={1240} y={420} k={t - 0.6} tam={110} />
        <S en={0.6} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("Vuelve a la cama"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.05]])} cx={900} cy={560} suelo>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={1} />
        </Dormitorio>
        <EtiquetaTu x={CABEZA.x} y={CABEZA.y - 90} k={t - R("Vuelve a la cama", "Es tu turno")} f={f} texto="TU TURNO" />
        <S en={R("Vuelve a la cama", "Es tu turno")} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("La regla ocho"),
    entra: "glitch",
    pinta: (t) => {
      const kH = R("La regla ocho", "ya esté hecha");
      return (
        <Lienzo>
          <Texto x={960} y={260} texto="REGLA 8" tam={70} peso={900} color={C.rojo} k={t} />
          <Recorte x={960} y={500} etiqueta="TURNO:" texto="RONDA DE LAS 03:04" k={t - 0.3} />
          <Tick x={1610} y={500} k={t - kH} tam={90} />
          <S en={kH} n="impacto" v={0.3} />
        </Lienzo>
      );
    },
  },
  // ── cierre ──
  {
    desde: E("El empleado que escribió"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 019" />
        <Empleado x={960} y={560} cabeza={Math.sin(f / 30) * 1.5} />
        <RelojDigital x={1520} y={300} hora="03:04" escala={0.6} />
      </Lienzo>
    ),
  },
  {
    desde: E("Hacía la ronda"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Pasillo>
          <PersonaDePie x={kf(t, [[0, 600], [2.5, 900]])} y={800} pose="linterna" />
          <Linterna x={kf(t, [[0, 680], [2.5, 980]])} y={620} haz={0.5} escala={0.8} giro={-12} />
        </Pasillo>
      </Lienzo>
    ),
  },
  {
    desde: E("Una noche de marzo"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.05]])} cx={900} cy={560} suelo>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={0} respira={Math.sin(f / 22) * 3} />
        </Dormitorio>
        <Texto x={1450} y={300} texto="MARZO" tam={56} color={C.gris} k={t - 0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("A la mañana siguiente"),
    pinta: (t) => {
      const kD = R("A la mañana siguiente", "Por dentro");
      return (
        <Lienzo suelo>
          <Puerta x={960} y={800} w={300} h={540} />
          {t > kD ? <Texto x={960} y={190} texto="CERRADA POR DENTRO" tam={52} peso={800} k={t - kD} /> : null}
          <S en={R("A la mañana siguiente", "cerrada con llave")} n="clic" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Y la ronda estaba hecha"),
    pinta: (t) => (
      <Lienzo>
        <Recorte x={960} y={460} etiqueta="TURNO:" texto="RONDA DE LAS 03:04" k={t} />
        <Tick x={1610} y={460} k={t - 0.8} tam={90} />
        <S en={0.8} n="impacto" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Nosotros no escribimos"),
    entra: "glitch",
    pinta: (t) => (
      <Lienzo>
        <LogoNegociado x={960} y={480} r={140} texto k={t} />
      </Lienzo>
    ),
  },
  {
    desde: E("Gracias por su cooperación"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 019" />
        <Empleado x={960} y={560} cabeza={Math.sin(f / 30) * 1.5} />
      </Lienzo>
    ),
  },
  // ── CTA ──
  {
    desde: CTA(),
    entra: "glitch",
    pinta: (t) => (
      <PantallaCTA
        k={t}
        kTick={R("Queda un trámite", "suscríbete al canal")}
        comenta="¿QUÉ HACES TÚ A LAS TRES?"
        kComenta={R("Queda un trámite", "cuéntanos en los comentarios")}
        siguiente="SIGUIENTE ARCHIVO: 020"
        kSiguiente={R("Queda un trámite", "El próximo archivo")}
      />
    ),
  },
  { desde: E("Buenas noches", CTA()), pinta: (t) => <PantallaFinal texto="BUENAS NOCHES." k={t} /> },
];
