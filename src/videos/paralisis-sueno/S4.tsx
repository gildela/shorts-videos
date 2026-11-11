// Bloque 4: regla seis (cuenta), la siete clasificada, el sujeto (la presencia eres tú), la siete de verdad, el cierre y el CTA.
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { Dormitorio, Mesa, Puerta, RelojDigital } from "../../estilos/archivo/piezas/Casa";
import { CabezaGrande, Empleado, Mano, PersonaCama, PersonaDePie } from "../../estilos/archivo/piezas/Persona";
import { Cota } from "../../estilos/archivo/piezas/Objetos";
import { Cruz, Documento, EtiquetaTu, FilaCasillas, LogoNegociado, PantallaCTA, Sello, TarjetaDato, TarjetaRegla, Texto, Tick } from "../../estilos/archivo/piezas/Interfaz";
import { Cronometro, FichaSujeto, PantallaFinal } from "../../estilos/archivo/piezas/Archivo";
import { BocaArriba, BrazoRobot, CABEZA, E, Encima, PUERTA, Presencia, R } from "./comun";

// la regla siete se dice dos veces con «número»: la clasificada y la de verdad (después de «Este archivo no va»)
const SIETE = () => E("Regla número siete");
const SIETE_VERDAD = () => E("Regla número siete", E("Este archivo no va"));

export const PLANOS_S4: Plano[] = [
  // ── regla 6 ──
  {
    desde: E("Regla número seis"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={6} titulo="CUENTA" k={t} escribeDesde={R("Regla número seis", "Cuenta")} />,
  },
  {
    desde: E("Esto dura unos segundos"),
    pinta: (t) => {
      const kM = R("Esto dura unos segundos", "Como mucho");
      return (
        <Lienzo>
          <Cronometro x={760} y={470} r={200} aguja={kf(t, [[0, 0], [kM + 2, 2]])} k={t} />
          <Texto x={1300} y={470} texto={t > kM ? "≤ 2 MIN" : "SEGUNDOS"} tam={70} peso={900} k={t > kM ? t - kM : t - 0.4} ancla="start" />
          <S en={0.1} n="tecla" v={0.15} />
          <S en={kM} n="blip" v={0.18} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("A ti te parecerá una hora"),
    pinta: (t) => (
      <Lienzo>
        <CabezaGrande x={620} y={470} r={170} ojos={1} />
        <RelojDigital x={1260} y={470} hora={t > 1.6 ? "04:04" : "03:04"} escala={1.1} rojo={t > 1.6} />
        <S en={1.6} n="blip_grave" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("Cuenta despacio"),
    pinta: (t) => {
      const ks = [R("Cuenta despacio", "Uno"), R("Cuenta despacio", "Dos"), R("Cuenta despacio", "Tres")];
      const n = ks.filter((k) => t > k).length;
      return (
        <Lienzo>
          {n > 0 ? <Texto x={960} y={560} texto={String(n)} tam={300} peso={900} k={t - ks[n - 1]} /> : null}
          {ks.map((k, i) => (
            <S key={i} en={k} n="tecla" v={0.2} />
          ))}
        </Lienzo>
      );
    },
  },
  {
    desde: E("Casi nadie llega a sesenta"),
    pinta: (t) => (
      <Lienzo>
        <Texto x={960} y={560} texto="60" tam={300} peso={900} color={C.grisOscuro} k={t - 0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("En algún número"),
    pinta: (t) => {
      const kM = R("En algún número", "vuelve a moverse");
      return (
        <Lienzo>
          <g transform={`rotate(${t > kM ? kf(t, [[kM, 0], [kM + 0.5, -14]]) : 0} 960 780)`}>
            <Mano x={960} y={540} escala={1.1} />
          </g>
          <Tick x={1340} y={360} k={t - kM - 0.4} tam={110} />
          <S en={kM + 0.4} n="blip" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("La puerta vuelve a estar vacía"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.3], [4, 1.4]])} cx={PUERTA.x - 160} cy={600} suelo>
        <Puerta {...PUERTA} hueco />
        <Presencia x={PUERTA.x} y={PUERTA.y} escala={1.05} k={1 - t * 1.4} ojos={Math.max(0, 1 - t * 2)} />
        <S en={0.6} n="suspiro" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("No preguntes en qué número"),
    pinta: (t) => {
      const kS = R("No preguntes en qué número", "Siempre es el mismo");
      return (
        <Lienzo>
          {t < kS ? <Texto x={960} y={560} texto="?" tam={300} peso={900} color={C.gris} k={t - 0.3} /> : <Texto x={960} y={560} texto="4" tam={300} peso={900} k={t - kS - 0.6} />}
          <S en={kS + 0.6} n="latido" v={0.35} />
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
    desde: E("Está sentado encima de la regla siete"),
    pinta: (t) => (
      <Lienzo>
        <rect x={560} y={400} width={800} height={260} rx={10} fill="none" stroke={C.gris} strokeWidth={10} />
        <Texto x={960} y={560} texto="REGLA 7" tam={64} color={C.gris} />
        <Encima x={1000} y={402} escala={1.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Gracias", SIETE()),
    pinta: () => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 020" />
        <Empleado x={960} y={560} />
      </Lienzo>
    ),
  },
  {
    desde: E("Seis reglas"),
    pinta: (t) => (
      <Lienzo>
        <FilaCasillas x={960} y={520} marcadas={6} k={1} kMarca={10} tam={104} ultimaInterrogante={t > R("Seis reglas", "Alguien sí")} />
        <S en={R("Seis reglas", "Alguien sí")} n="impacto" v={0.3} />
      </Lienzo>
    ),
  },
  // ── el sujeto ──
  {
    desde: E("Este archivo no va"),
    entra: "glitch",
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.3], [3, 1.36]])} cx={PUERTA.x - 160} cy={600} suelo>
        <Puerta {...PUERTA} hueco />
        <Presencia x={PUERTA.x} y={PUERTA.y} escala={1.05} />
        <Cruz x={PUERTA.x} y={560} k={t - 1.6} tam={240} />
        <S en={1.6} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("En dos mil catorce"),
    pinta: (t) => {
      const kR = R("En dos mil catorce", "un robot");
      return (
        <Lienzo suelo>
          <Texto x={960} y={200} texto="SUIZA · 2014" tam={44} color={C.gris} k={t - 0.3} />
          <PersonaDePie x={760} y={800} haciaIzquierda />
          {t > kR ? <BrazoRobot x={830} y={560} avance={kf(t, [[kR, 0], [kR + 1, 1]])} /> : null}
          <S en={kR + 1} n="clic" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Lo hacía con medio segundo"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <PersonaDePie x={760} y={800} haciaIzquierda />
        <BrazoRobot x={830} y={560} avance={0.5 + 0.5 * Math.sin(f / 8)} />
        <Cota x={960} y={300} largo={400} texto="0,5 S" horizontal k={t - 0.8} />
        <S en={0.8} n="blip" v={0.18} />
      </Lienzo>
    ),
  },
  {
    desde: E("Uno de cada tres notó"),
    pinta: (t) => {
      const kD = R("Uno de cada tres notó", "Dos pidieron parar");
      return (
        <Lienzo>
          <TarjetaDato x={960} y={420} w={1300} h={420} fuente="CURRENT BIOLOGY · 2014 · EPFL" k={t}>
            <Texto x={0} y={-90} texto="NOTARON A ALGUIEN DETRÁS" tam={52} peso={900} k={t - 0.3} />
            {[0, 1, 2].map((i) => (
              <g key={i} opacity={fade(t - 0.5 - i * 0.15)}>{i === 1 ? <Presencia x={-300 + i * 300} y={170} escala={0.55} /> : <PersonaDePie x={-300 + i * 300} y={170} escala={0.6} frente />}</g>
            ))}
            {t > kD ? <Texto x={420} y={60} texto="2: «PARAD»" tam={44} color={C.rojo} k={t - kD} ancla="start" /> : null}
          </TarjetaDato>
          <Sello x={1500} y={230} texto="COMPROBADO" color={C.verde} k={t - 1.6} />
          <S en={1.6} n="impacto" v={0.3} />
          <S en={kD} n="blip_grave" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("No había nadie detrás"),
    pinta: (t) => {
      const kP = R("No había nadie detrás", "Era su propio cuerpo");
      const kL = R("No había nadie detrás", "Llegando tarde");
      return (
        <Lienzo suelo>
          {/* la copia gris del cuerpo, que va medio segundo tarde */}
          {t > kP ? (
            <g opacity={0.45 * fade(t - kP, 0.6)}>
              <PersonaDePie x={760 + kf(t, [[kL, 140], [kL + 1.2, 30]])} y={800} haciaIzquierda />
            </g>
          ) : (
            <Presencia x={1020} y={800} escala={1} k={1 - t * 1.5} ojos={Math.max(0, 1 - t * 2)} />
          )}
          <PersonaDePie x={760} y={800} haciaIzquierda />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Sujeto"),
    entra: "glitch",
    pinta: (t) => {
      const kD = R("Sujeto", "Medio despierto");
      const kM = R("Sujeto", "Medio dormido");
      return (
        <Lienzo>
          <FichaSujeto
            x={960}
            y={470}
            archivo="020"
            valor="UN HUMANO ADULTO"
            k={t}
            lineas={[
              { texto: t > kD ? "MEDIO DESPIERTO" : "", ok: true },
              { texto: t > kM ? "MEDIO DORMIDO" : "", ok: false },
            ]}
          />
          <S en={0.3} n="tecla" v={0.2} />
          <S en={kD} n="blip" v={0.15} />
          <S en={kM} n="blip" v={0.15} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Su cerebro ve un cuerpo quieto"),
    pinta: (t, f) => {
      const kN = R("Su cerebro ve un cuerpo quieto", "y no lo reconoce");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [5, 1.05]])} cx={960} cy={560} suelo>
          <Dormitorio ventana={false}>
            <PersonaCama {...CABEZA} ojos={1} />
          </Dormitorio>
          <Texto x={780} y={360} texto="¿?" tam={80} peso={900} color={C.gris} k={t - kN} />
          <S en={kN} n="blip_grave" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("La presencia eres tú"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [5, 1.06]])} cx={960} cy={540} suelo>
        <Presencia x={960} y={800} escala={1.2} />
        <EtiquetaTu x={960} y={300} k={t - R("La presencia eres tú", "eres tú")} f={f} />
        <S en={R("La presencia eres tú", "eres tú")} n="impacto" v={0.35} />
      </Lienzo>
    ),
  },
  // ── la regla siete de verdad ──
  {
    desde: SIETE_VERDAD(),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={7} titulo="NO LE TENGAS MIEDO" k={t} escribeDesde={E("no le tengas miedo", SIETE_VERDAD()) - SIETE_VERDAD()} />,
  },
  {
    desde: E("Es la parte de ti"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [5, 1.05]])} cx={1000} cy={560} suelo>
        <Presencia x={1330} y={800} escala={1.0} />
        <Dormitorio ventana={false}>
          <PersonaCama {...CABEZA} ojos={0} respira={Math.sin(f / 22) * 3} />
        </Dormitorio>
      </Lienzo>
    ),
  },
  {
    desde: E("Vigilando que respiras"),
    pinta: (t) => {
      const pts = Array.from({ length: 120 }, (_, i) => `${260 + i * 12},${560 - Math.sin(i / 7 - t * 2) * 60}`).join(" ");
      return (
        <Lienzo>
          <polyline points={pts} fill="none" stroke={C.blanco} strokeWidth={10} strokeLinecap="round" opacity={fade(t - 0.1)} />
          <Presencia x={960} y={420} escala={0.55} ojos={1} />
          <S en={0.4} n="suspiro" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("La regla ocho"),
    pinta: (t) => {
      const kS = R("La regla ocho", "Sigue sentada");
      return (
        <Lienzo>
          <FilaCasillas x={960} y={520} marcadas={7} n={8} k={1} kMarca={10} tam={96} ultimaInterrogante />
          {t > kS ? <Encima x={1310} y={472} escala={0.55} k={t - kS - 0.3} /> : null}
          <S en={0.4} n="blip_grave" v={0.3} />
          <S en={kS + 0.6} n="latido" v={0.3} />
        </Lienzo>
      );
    },
  },
  // ── cierre ──
  {
    desde: E("El empleado que escribió"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [5, 1.05]])} cx={900} cy={560} suelo>
        <Dormitorio>
          <BocaArriba ojos={0} />
        </Dormitorio>
      </Lienzo>
    ),
  },
  {
    desde: E("Una noche de marzo"),
    pinta: (t) => {
      const kD = R("Una noche de marzo", "Duró cuarenta segundos");
      return t < kD ? (
        <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.04]])} cx={900} cy={560} suelo>
          <Dormitorio>
            <BocaArriba ojos={1} />
          </Dormitorio>
          <Puerta {...PUERTA} hueco />
        </Lienzo>
      ) : (
        <Lienzo>
          <Cronometro x={960} y={470} r={200} aguja={kf(t, [[kD, 0], [kD + 1.5, 40 / 60]])} k={t - kD} />
          <Texto x={960} y={780} texto="40 S" tam={50} color={C.gris} k={t - kD - 0.5} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("A la mañana siguiente"),
    pinta: (t) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 020" />
        <Documento x={1400} y={380} w={560} h={320} titulo="TURNO DE NOCHE" lineas={4} k={t - 1.0} />
        <Tick x={1400} y={470} k={t - 2.0} tam={60} />
        <S en={2.0} n="tecla" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("Desde entonces no duerme"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 020" />
        <Empleado x={960} y={560} cabeza={Math.sin(f / 30) * 1.5} escribe={t > R("Desde entonces no duerme", "Escribe") ? 1 : 0} />
      </Lienzo>
    ),
  },
  {
    desde: E("A las tres y cuatro minutos, mira"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [5, 1.05]])} cx={960} cy={560} suelo>
        <Mesa x={700} y={800} w={800} carpeta="ARCHIVO 020" />
        <Empleado x={760} y={560} cabeza={kf(t, [[0.8, 0], [1.6, 12]])} />
        <Puerta x={1560} y={800} hueco />
        <RelojDigital x={1560} y={250} hora="03:04" escala={0.6} />
      </Lienzo>
    ),
  },
  {
    desde: E("Dice que todavía no ha vuelto nadie"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.3], [4, 1.4]])} cx={1400} cy={600} suelo>
        <Puerta x={1560} y={800} hueco />
        <S en={1.4} n="latido" v={0.3} />
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
        <Mesa x={880} y={800} carpeta="ARCHIVO 020" />
        <Empleado x={960} y={560} cabeza={Math.sin(f / 30) * 1.5} />
      </Lienzo>
    ),
  },
  // ── CTA ──
  {
    desde: E("Queda un trámite"),
    entra: "glitch",
    pinta: (t) => (
      <PantallaCTA
        k={t}
        kTick={R("Queda un trámite", "suscríbete al canal")}
        comenta="¿QUÉ VISTE CUANDO NO PODÍAS MOVERTE?"
        kComenta={R("Queda un trámite", "cuéntanos en los comentarios")}
        siguiente="SIGUIENTE ARCHIVO: 021"
        kSiguiente={R("Queda un trámite", "El próximo archivo")}
      />
    ),
  },
  { desde: E("Respira", E("Queda un trámite")), pinta: (t) => <PantallaFinal texto="RESPIRA." k={t} /> },
];
