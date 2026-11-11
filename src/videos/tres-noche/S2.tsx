// Bloque 2: reglas uno (el reloj y las vueltas del sueño), dos (más de un tercio) y tres (el punto más frío).
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { CasaFuera, Dormitorio, RelojDigital } from "../../estilos/archivo/piezas/Casa";
import { CabezaGrande, PersonaCama } from "../../estilos/archivo/piezas/Persona";
import { Cruz, Documento, EtiquetaTu, LogoNegociado, Marcador, Sello, TarjetaDato, TarjetaRegla, Texto } from "../../estilos/archivo/piezas/Interfaz";
import { CABEZA, E, Interrogante, R, Termometro, Vueltas } from "./comun";

const UNO = () => E("Regla número uno");

export const PLANOS_S2: Plano[] = [
  // ── regla 1 ──
  {
    desde: UNO(),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={1} titulo="NO MIRES EL RELOJ" k={t} escribeDesde={E("No mires el reloj", UNO()) - UNO()} />,
  },
  {
    desde: E("Tu sueño va por vueltas"),
    pinta: (t) => {
      const kN = R("Tu sueño va por vueltas", "noventa minutos");
      return (
        <Lienzo>
          <Texto x={260} y={250} texto="DESPIERTO" tam={34} color={C.gris} ancla="start" />
          <Texto x={260} y={620} texto="PROFUNDO" tam={34} color={C.gris} ancla="start" />
          <Vueltas x={260} y={300} w={1400} h={280} n={5} k={kf(t, [[0.2, 0], [kN + 1, 1]], false)} />
          {t > kN ? <Texto x={540} y={700} texto="≈ 90 MIN" tam={56} peso={900} k={t - kN} /> : null}
          {t > kN ? <line x1={260} x2={540} y1={660} y2={660} stroke={C.gris} strokeWidth={6} opacity={fade(t - kN)} /> : null}
          <S en={kN} n="blip" v={0.18} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Al final de cada una"),
    pinta: (t) => {
      const kC = R("Al final de cada una", "Casi transparente");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={960} cy={440}>
          <Texto x={260} y={250} texto="DESPIERTO" tam={34} color={C.gris} ancla="start" />
          <Vueltas x={260} y={300} w={1400} h={280} n={5} marca={t > kC ? 1 : -1} />
          {[1, 2, 3, 4].map((i) => (
            <circle key={i} cx={260 + (i / 5) * 1400} cy={300} r={46} fill="none" stroke={C.blanco} strokeWidth={5} opacity={fade(t - 0.3 - i * 0.2) * 0.6} />
          ))}
          <S en={kC} n="blip" v={0.18} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Te despiertas varias veces"),
    pinta: (t, f) => {
      const k1 = R("Te despiertas varias veces", "Nunca te acuerdas");
      // abre y cierra los ojos tres veces seguidas, sin enterarse
      const ojos = t < k1 ? (Math.floor(t * 2.2) % 2 === 1 ? 1 : 0) : 0;
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={900} cy={560} suelo>
          <Dormitorio ventana>
            <PersonaCama {...CABEZA} ojos={ojos} respira={Math.sin(f / 22) * 3} />
          </Dormitorio>
          <Texto x={1450} y={300} texto={t < k1 ? `× ${Math.min(4, 1 + Math.floor(t * 1.1))}` : "× 4"} tam={90} peso={900} color={C.gris} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Esta vez sí"),
    pinta: (t, f) => {
      const kR = R("Esta vez sí", "has mirado el reloj");
      return (
        <Lienzo zoom={kf(t, [[0, 1.3], [3, 1.36]])} cx={1250} cy={590} suelo>
          <Dormitorio ventana={false} reloj="03:04">
            <PersonaCama {...CABEZA} ojos={1} />
          </Dormitorio>
          <EtiquetaTu x={1450} y={560} k={t - kR} f={f} texto="03:04" />
          <S en={kR} n="blip_grave" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Ahora la hora sabe"),
    entra: "glitch",
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [6, 1.1]])} cx={960} cy={480}>
        <RelojDigital x={960} y={480} hora="03:04" escala={1.8} rojo={t > R("Ahora la hora sabe", "Mañana")} />
        <S en={R("Ahora la hora sabe", "Mañana")} n="latido" v={0.3} />
      </Lienzo>
    ),
  },
  // ── regla 2 ──
  {
    desde: E("Regla número dos"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={2} titulo="NO PIENSES QUE ERES EL ÚNICO" k={t} escribeDesde={R("Regla número dos", "No pienses")} />,
  },
  {
    desde: E("Unos investigadores preguntaron"),
    pinta: (t) => {
      const kT = R("Unos investigadores preguntaron", "Más de un tercio");
      const kS = R("Unos investigadores preguntaron", "tres noches por semana");
      const n = 45; // cada punto, unas doscientas personas
      return (
        <Lienzo>
          <TarjetaDato x={960} y={440} w={1300} h={560} fuente="SLEEP MEDICINE · 2010" k={t}>
            {Array.from({ length: n }, (_, i) => {
              const on = t > kT + i * 0.03 && i < 16;
              return <circle key={i} cx={-560 + (i % 15) * 80} cy={-170 + Math.floor(i / 15) * 100} r={30} fill={on ? C.blanco : "none"} stroke={C.gris} strokeWidth={6} opacity={fade(t - 0.3 - i * 0.015)} />;
            })}
            <Texto x={0} y={190} texto={t > kT ? "35,5 % · 3 NOCHES POR SEMANA" : "8.937 PERSONAS"} tam={58} k={t - 0.3} />
          </TarjetaDato>
          <Sello x={1420} y={200} texto="COMPROBADO" color={C.verde} k={t - kS} />
          <S en={kT} n="blip" v={0.18} />
          <S en={kS} n="impacto" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Ahora mismo hay muchas casas"),
    pinta: (t, f) => {
      const kM = R("Ahora mismo hay muchas casas", "Mirando al techo");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [8, 1.06]])} cx={960} cy={500} suelo>
          {[0, 1, 2, 3].map((i) => (
            <CasaFuera key={i} x={300 + i * 440} y={800} escala={0.62} ventanas={[false, false]} luna={i === 3} ojos={false} />
          ))}
          {t > kM ? [1, 3].map((i) => (
            <g key={i}>
              <ellipse cx={300 + i * 440 - 108} cy={800 - 96} rx={9} ry={9} fill={C.amarillo} />
              <ellipse cx={300 + i * 440 - 84} cy={800 - 96} rx={9} ry={9} fill={C.amarillo} />
            </g>
          )) : null}
          <S en={kM} n="latido" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Solo nosotros"),
    pinta: (t) => {
      const kL = R("Solo nosotros", "Tenemos una lista");
      return (
        <Lienzo>
          {t < kL ? <LogoNegociado x={960} y={470} r={130} texto k={t} /> : null}
          <Documento x={620} y={470} w={460} h={560} titulo="LISTA" k={t - kL} lineas={8} />
          <Marcador x={1350} y={470} rotulo="CONTADAS" valor={String(3000 + Math.floor(Math.max(0, t - kL) * 371))} k={t - kL} />
          <S en={kL} n="blip" v={0.2} />
        </Lienzo>
      );
    },
  },
  // ── regla 3 ──
  {
    desde: E("Regla número tres"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={3} titulo="SI TIENES FRÍO, NO SUBAS LA MANTA" k={t} escribeDesde={R("Regla número tres", "Si tienes frío")} />,
  },
  {
    desde: E("A esta hora tu cuerpo"),
    pinta: (t) => {
      const kB = R("A esta hora tu cuerpo", "Baja casi un grado");
      const kH = R("A esta hora tu cuerpo", "unas horas antes");
      return (
        <Lienzo>
          <Termometro x={620} y={700} nivel={kf(t, [[kB, 0.62], [kB + 2.5, 0.38]])} />
          {t > kB ? <Texto x={880} y={420} texto="≈ −1 °C" tam={64} peso={900} k={t - kB} /> : null}
          {t > kH ? (
            <g opacity={pop(t - kH)}>
              <RelojDigital x={1300} y={420} hora="04:00" escala={0.9} />
              <Texto x={1300} y={600} texto="EL PUNTO MÁS FRÍO" tam={44} color={C.gris} />
            </g>
          ) : null}
          <S en={kB} n="blip_grave" v={0.25} />
          <S en={kH} n="blip" v={0.18} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("No es la casa"),
    pinta: (t, f) => {
      const kV = R("No es la casa", "No es la ventana");
      const kT = R("No es la casa", "Eres tú");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={900} cy={560} suelo>
          <Dormitorio>
            <PersonaCama {...CABEZA} ojos={1} />
          </Dormitorio>
          <Cruz x={380} y={230} k={t - kV - 0.3} tam={150} />
          <EtiquetaTu x={CABEZA.x} y={CABEZA.y - 90} k={t - kT} f={f} />
          <S en={kV + 0.3} n="blip_grave" v={0.25} />
          <S en={kT} n="blip" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Tu cuerpo se está preparando"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.06]])} cx={960} cy={480}>
        <CabezaGrande x={820} y={470} r={200} ojos={1} />
        <Interrogante x={1300} y={560} tam={300} k={t - R("Tu cuerpo se está preparando", "para algo")} />
        <S en={R("Tu cuerpo se está preparando", "para algo")} n="latido" v={0.3} />
      </Lienzo>
    ),
  },
];
