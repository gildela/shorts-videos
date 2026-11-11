// Bloque 2: regla uno (no intentes gritar: la atonía), regla dos (el peso en el pecho) y la ficha de «La pesadilla».
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { Dormitorio, Puerta, RelojDigital } from "../../estilos/archivo/piezas/Casa";
import { CabezaGrande, PersonaCama, PersonaDePie } from "../../estilos/archivo/piezas/Persona";
import { Bocadillo, Cruz, EtiquetaTu, Sello, TarjetaDato, TarjetaRegla, Texto } from "../../estilos/archivo/piezas/Interfaz";
import { Ondas } from "../../estilos/archivo/piezas/Perro";
import { CABEZA, Cuadro, E, Encima, FilaMusculo, PUERTA, R } from "./comun";

const MUSCULOS = ["BRAZOS", "PIERNAS", "MANOS", "VOZ"];

export const PLANOS_S2: Plano[] = [
  // ── regla 1 ──
  {
    desde: E("Regla número uno"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={1} titulo="NO INTENTES GRITAR" k={t} escribeDesde={R("Regla número uno", "No intentes gritar")} />,
  },
  {
    desde: E("Mientras sueñas"),
    pinta: (t) => {
      const kT = R("Mientras sueñas", "Todos");
      return (
        <Lienzo>
          <Texto x={960} y={200} texto="SUEÑO REM" tam={44} color={C.gris} k={t - 0.2} />
          {MUSCULOS.map((m, i) => (
            <FilaMusculo key={m} x={620} y={330 + i * 100} texto={m} ok={false} k={t - 0.8 - i * 0.35} />
          ))}
          {t > kT ? <Texto x={960} y={780} texto="TODOS" tam={60} peso={900} color={C.rojo} k={t - kT} /> : null}
          {MUSCULOS.map((_, i) => (
            <S key={i} en={0.8 + i * 0.35} n="blip_grave" v={0.18} />
          ))}
        </Lienzo>
      );
    },
  },
  {
    desde: E("Así no haces lo que sueñas"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.04]])} cx={960} cy={560} suelo>
        <Dormitorio ventana={false}>
          <PersonaCama {...CABEZA} ojos={0} respira={Math.sin(f / 22) * 3} />
        </Dormitorio>
        {/* la nube del sueño: corre, pero el cuerpo no */}
        <g opacity={fade(t - 0.3)}>
          <circle cx={1150} cy={330} r={14} fill={C.gris} />
          <circle cx={1180} cy={280} r={22} fill={C.gris} />
          <ellipse cx={1000} cy={190} rx={240} ry={120} fill="none" stroke={C.gris} strokeWidth={10} />
          <PersonaDePie x={1000} y={280} escala={0.55} pose="anda" fase={(t * 1.4) % 1} />
        </g>
      </Lienzo>
    ),
  },
  {
    desde: E("Solo deja encendidos dos"),
    pinta: (t) => {
      const kO = R("Solo deja encendidos dos", "los ojos");
      const kR = R("Solo deja encendidos dos", "la respiración");
      return (
        <Lienzo>
          {MUSCULOS.map((m, i) => (
            <FilaMusculo key={m} x={620} y={210 + i * 90} texto={m} ok={false} k={9} />
          ))}
          <FilaMusculo x={620} y={600} texto="OJOS" ok k={t - kO} />
          <FilaMusculo x={620} y={700} texto="RESPIRACIÓN" ok k={t - kR} />
          <S en={kO} n="blip" v={0.2} />
          <S en={kR} n="blip" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Esta noche te has despertado"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={960} cy={560} suelo>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={1} />
        </Dormitorio>
        <Puerta {...PUERTA} hueco />
        <RelojDigital x={1450} y={430} hora="03:04" escala={0.8} rojo={t > 1.4} />
        <S en={1.4} n="blip_grave" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("Tu cabeza ya está aquí"),
    pinta: (t, f) => {
      const kC = R("Tu cabeza ya está aquí", "Tu cuerpo");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [5, 1.04]])} cx={960} cy={560} suelo>
          <Dormitorio ventana={false}>
            <PersonaCama {...CABEZA} ojos={1} />
          </Dormitorio>
          <EtiquetaTu x={CABEZA.x} y={CABEZA.y - 100} k={t - 0.3} f={f} texto="DESPIERTA" />
          {t > kC ? <Texto x={600} y={390} texto="DORMIDO" tam={48} color={C.gris} k={t - kC - 0.2} /> : null}
          <S en={0.3} n="blip" v={0.18} />
          <S en={kC + 0.2} n="blip_grave" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Abrirás la boca"),
    pinta: (t) => {
      const kN = R("Abrirás la boca", "No saldrá nada");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])}>
          <PersonaCama x={1100} y={470} escala={2.6} ojos={1} cuerpo={false} boca={kf(t, [[0.3, 0], [0.8, 1]])} />
          {t > kN ? <Bocadillo x={760} y={330} texto="…" k={t - kN} tam={70} ancho={220} /> : null}
          <S en={kN + 0.1} n="blip" v={0.12} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("No es que no te oigan"),
    pinta: (t) => {
      const kN = R("No es que no te oigan", "Es que no hay nada");
      return (
        <Lienzo>
          <Ondas x={760} y={470} k={t} tam={1.1} />
          <Cruz x={960} y={470} k={t - kN - 0.4} tam={260} />
          {t > kN ? <Texto x={960} y={760} texto="0 DECIBELIOS" tam={50} color={C.gris} k={t - kN - 0.8} /> : null}
          <S en={kN + 0.4} n="blip_grave" v={0.3} />
        </Lienzo>
      );
    },
  },
  // ── regla 2 ──
  {
    desde: E("Regla número dos"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={2} titulo="RESPIRA. PERO NO LO INTENTES" k={t} escribeDesde={R("Regla número dos", "Respira")} />,
  },
  {
    desde: E("Notarás un peso"),
    pinta: (t, f) => {
      const kS = R("Notarás un peso", "Como si alguien");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [6, 1.06]])} cx={900} cy={560} suelo>
          <Dormitorio ventana={false}>
            <PersonaCama {...CABEZA} ojos={1} />
          </Dormitorio>
          {/* la flecha del peso, que baja sobre el pecho */}
          <g opacity={fade(t - 0.3) * (t > kS ? 0 : 1)} transform={`translate(0 ${kf(t, [[0.3, -30], [1.3, 0]])})`}>
            <line x1={820} y1={160} x2={820} y2={330} stroke={C.gris} strokeWidth={22} strokeLinecap="round" />
            <path d="M 770 310 L 820 380 L 870 310 Z" fill={C.gris} />
            <Texto x={820} y={130} texto="KG" tam={44} color={C.gris} />
          </g>
          <Encima x={820} y={422} k={t - kS - 0.2} ojos={t > kS + 1 ? 1 : 0} />
          <S en={0.3} n="golpe" v={0.3} />
          <S en={kS + 1} n="latido" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Querrás respirar hondo"),
    pinta: (t) => {
      const kN = R("Querrás respirar hondo", "No podrás");
      return (
        <Lienzo>
          <CabezaGrande x={1160} y={460} r={190} ojos={1} />
          <Texto x={600} y={460} texto="INSPIRA" tam={90} peso={900} k={t - 0.2} />
          <Cruz x={600} y={430} k={t - kN - 0.3} tam={200} />
          <S en={0.2} n="aliento" v={0.3} />
          <S en={kN + 0.3} n="blip_grave" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Tu respiración va sola"),
    pinta: (t) => {
      const kT = R("Tu respiración va sola", "Tú no la controlas");
      // la línea de la respiración, que sigue sola, siempre igual
      const pts = Array.from({ length: 120 }, (_, i) => {
        const x = 260 + i * 12;
        const y = 470 - Math.sin(i / 7 - t * 3) * 90;
        return `${x},${y}`;
      }).join(" ");
      return (
        <Lienzo>
          <polyline points={pts} fill="none" stroke={C.blanco} strokeWidth={10} strokeLinecap="round" opacity={fade(t - 0.1)} />
          <Texto x={960} y={230} texto="AUTOMÁTICA" tam={48} color={C.gris} k={t - 0.4} />
          {t > kT ? (
            <g>
              <Texto x={960} y={720} texto="CONTROL MANUAL" tam={48} k={t - kT} />
              <Cruz x={960} y={706} k={t - kT - 0.6} tam={110} />
            </g>
          ) : null}
          <S en={kT + 0.6} n="blip_grave" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Y algo lo sabe"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.8], [5, 1.9]])} cx={860} cy={380}>
        <PersonaCama {...CABEZA} ojos={1} respira={Math.sin(f / 9) * 2} />
        <Encima x={820} y={422} />
        <S en={0.4} n="latido" v={0.3} />
        <S en={1.4} n="latido" v={0.3} />
      </Lienzo>
    ),
  },
  // ── ficha: el peso en el pecho (La pesadilla, 1781) ──
  {
    desde: E("En mil setecientos ochenta y uno"),
    entra: "glitch",
    pinta: (t) => {
      const kE = R("En mil setecientos ochenta y uno", "Encima de su pecho");
      const kC = R("En mil setecientos ochenta y uno", "El cuadro se llama");
      return (
        <Lienzo>
          <Cuadro x={960} y={430} w={1000} h={560} k={t - 0.2}>
            <rect x={560} y={500} width={760} height={60} rx={14} fill={C.grisOscuro} />
            <PersonaCama x={1180} y={420} escala={0.8} ojos={0} />
            <Encima x={980} y={418} escala={0.75} k={t - kE - 0.3} ojos={t > kE + 1 ? 1 : 0} />
          </Cuadro>
          {t > kC ? <Texto x={960} y={790} texto="«LA PESADILLA» · 1781" tam={44} k={t - kC} /> : <Texto x={960} y={790} texto="1781" tam={44} color={C.gris} k={t - 0.8} />}
          <Sello x={1440} y={210} texto="COMPROBADO" color={C.verde} k={t - kC - 0.6} />
          <S en={kE + 0.3} n="latido" v={0.3} />
          <S en={kC + 0.6} n="impacto" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("La palabra inglesa"),
    pinta: (t) => {
      const kM = R("La palabra inglesa", "mare");
      return (
        <Lienzo>
          <TarjetaDato x={960} y={420} w={1100} h={320} fuente="INGLÉS ANTIGUO · NIHT + MÆRE" k={t}>
            <Texto x={0} y={30} texto="NIGHT" tam={130} peso={900} esp={10} k={t - 0.2} ancla="end" />
            <Texto x={40} y={30} texto="MARE" tam={130} peso={900} esp={10} k={t - kM} ancla="start" />
          </TarjetaDato>
          <S en={kM} n="blip" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Era un espíritu"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={960} cy={560} suelo>
        <Dormitorio ventana={false}>
          <PersonaCama {...CABEZA} ojos={0} respira={Math.sin(f / 22) * 2} />
        </Dormitorio>
        <Encima x={820} y={422} k={t - 0.4} />
        <S en={0.6} n="aliento" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("En México"),
    pinta: (t) => (
      <Lienzo>
        <TarjetaDato x={960} y={440} w={1300} h={260} fuente="MÉXICO · EXPRESIÓN POPULAR" k={t}>
          <Texto x={0} y={24} texto="«SE TE SUBIÓ EL MUERTO»" tam={76} peso={900} k={t - 0.3} />
        </TarjetaDato>
        <S en={0.3} n="tecla" v={0.15} />
      </Lienzo>
    ),
  },
  {
    desde: E("Distintos países"),
    pinta: (t) => {
      const kM = R("Distintos países", "El mismo peso");
      return (
        <Lienzo>
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={pop(t - 0.1 - i * 0.25)}>
              <Cuadro x={420 + i * 540} y={430} w={440} h={320}>
                <PersonaCama x={500 + i * 540} y={460} escala={0.42} ojos={0} />
                <Encima x={390 + i * 540} y={458} escala={0.4} ojos={t > kM ? 1 : 0} />
              </Cuadro>
            </g>
          ))}
          {[0, 1, 2].map((i) => (
            <S key={i} en={0.1 + i * 0.25} n="blip" v={0.15} />
          ))}
          <S en={kM} n="latido" v={0.35} />
        </Lienzo>
      );
    },
  },
];
