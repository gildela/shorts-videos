// Bloque 3: la ficha de la nariz, la consulta «puerta o esquina», regla cuatro (el norte) y regla cinco (el tono).
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { CasaFuera, Puerta } from "../../estilos/archivo/piezas/Casa";
import { CaraPerro, HuellasPerro, NarizPerro, PerroAnda, PerroSentado, PerroTumbado } from "../../estilos/archivo/piezas/Perro";
import { CabezaGrande, PersonaDePie } from "../../estilos/archivo/piezas/Persona";
import { Bocadillo, Cruz, Documento, Sello, TarjetaDato, TarjetaPregunta, TarjetaRegla, Texto, Tick } from "../../estilos/archivo/piezas/Interfaz";
import { parpadeo } from "../../estilos/archivo/piezas/Gato";
import { Brujula, Correa, E, Escaner, Esquina, Interrogante, R } from "./comun";

export const PLANOS_S3: Plano[] = [
  // ── ficha: la nariz ──
  {
    desde: E("Tú tienes unos seis millones"),
    entra: "glitch",
    pinta: (t) => {
      const kP = R("Tú tienes unos seis millones", "Tu perro tiene");
      const kC = R("Tú tienes unos seis millones", "La parte de su cerebro");
      return (
        <Lienzo>
          <TarjetaDato x={960} y={460} w={1400} h={560} fuente="PBS NOVA · OLFATO CANINO" k={t}>
            <Texto x={-360} y={-60} texto="TÚ" tam={44} color={C.gris} k={t - 0.3} />
            <Texto x={-360} y={40} texto="6 MILLONES" tam={70} peso={900} k={t - 0.6} />
            <Texto x={340} y={-60} texto="ÉL" tam={44} color={C.gris} k={t - kP} />
            <Texto x={340} y={40} texto="300 MILLONES" tam={70} peso={900} k={t - kP - 0.6} />
            <Texto x={0} y={180} texto="CEREBRO DEL OLFATO × 40" tam={50} k={t - kC - 0.4} />
          </TarjetaDato>
          <Sello x={1500} y={230} texto="COMPROBADO" color={C.verde} k={t - kC - 1.4} />
          <S en={0.6} n="blip" v={0.15} />
          <S en={kP + 0.6} n="blip" v={0.2} />
          <S en={kC + 1.4} n="impacto" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Sabe quién ha entrado"),
    pinta: (t) => {
      const kA = R("Sabe quién ha entrado", "Sabe quién entró");
      return (
        <Lienzo>
          <NarizPerro x={960} y={480} escala={1.6} calor={1} k={t} />
          <Texto x={300} y={300} texto="HOY" tam={60} k={t - 0.5} />
          <Texto x={1620} y={300} texto="AYER" tam={60} k={t - kA} />
          <S en={0.5} n="aliento" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Sabe quién no ha salido"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <CasaFuera x={960} y={800} ventanas={[false, true]} />
        <S en={0.8} n="impacto" v={0.35} />
      </Lienzo>
    ),
  },
  // ── consulta 2: puerta o esquina ──
  {
    desde: E("El Negociado necesita confirmarlo"),
    entra: "glitch",
    pinta: (t) => (
      <TarjetaPregunta
        pregunta="¿ADÓNDE LADRA TU PERRO DE NOCHE?"
        opciones={["PUERTA", "ESQUINA"]}
        k={t}
        escribeDesde={R("El Negociado necesita confirmarlo", "Adónde ladra")}
        kOpciones={R("El Negociado necesita confirmarlo", "comentarios")}
      />
    ),
  },
  {
    desde: E("Lo revisaremos uno a uno"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Puerta x={560} y={800} />
        <Esquina x={1440} techo={200} ancho={380} />
        <Texto x={560} y={250} texto="PUERTA" tam={50} k={t - 0.2} />
        <Texto x={1440} y={140} texto="ESQUINA" tam={50} color={C.amarillo} k={t - 0.5} />
      </Lienzo>
    ),
  },
  // ── regla 4 ──
  {
    desde: E("Regla número cuatro"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={4} titulo="CUANDO SALGA, NO LE METAS PRISA" k={t} escribeDesde={R("Regla número cuatro", "Cuando salga")} />,
  },
  {
    desde: E("Da vueltas"),
    pinta: (t, f) => (
      <Lienzo suelo>
        {(() => {
          // da vueltas: va y viene oliendo el suelo
          const ciclo = (t / 2.4) % 1;
          const vuelve = ciclo > 0.5;
          const x = vuelve ? 1300 - (ciclo - 0.5) * 2 * 640 : 660 + ciclo * 2 * 640;
          return <PerroAnda x={x} y={800} f={f} fase={(t * 1.4) % 1} escala={0.75} cola={1} cabeza={20} haciaIzquierda={vuelve} />;
        })()}
        <HuellasPerro x={600} y={780} n={8} sep={100} k={t} />
      </Lienzo>
    ),
  },
  {
    desde: E("Tú esperas con la correa"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <PersonaDePie x={500} y={800} pose="quieto" />
        <Correa x0={560} y0={600} x1={1240} y1={600} />
        <PerroSentado x={1300} y={800} f={f} cola={0} oreja={1} cabeza={-8} halo={0.4} escala={0.85} />
        <Texto x={1300} y={300} texto={`${Math.min(9, Math.floor(t * 2))}:${String(Math.floor((t * 23) % 60)).padStart(2, "0")}`} tam={70} color={C.gris} />
      </Lienzo>
    ),
  },
  {
    desde: E("Unos científicos observaron"),
    pinta: (t) => {
      const kA = R("Unos científicos observaron", "Apuntaron");
      return (
        <Lienzo>
          <TarjetaDato x={960} y={470} w={1300} h={540} fuente="FRONTIERS IN ZOOLOGY · 2013" k={t}>
            <Texto x={-300} y={-40} texto="70 PERROS" tam={76} peso={900} k={t - 0.4} />
            <Texto x={300} y={-40} texto="2 AÑOS" tam={76} peso={900} k={t - 1.4} />
            <Texto x={0} y={110} texto="1.893 VECES" tam={76} peso={900} color={C.blanco} k={t - kA - 0.4} />
          </TarjetaDato>
          <S en={0.4} n="blip" v={0.15} />
          <S en={1.4} n="blip" v={0.15} />
          <S en={kA + 0.4} n="blip" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Cuando el campo magnético"),
    pinta: (t, f) => {
      const kL = R("Cuando el campo magnético", "se ponían en línea");
      const kN = R("Cuando el campo magnético", "De norte a sur");
      const giro = kf(t, [[0, 60], [kL, 60], [kL + 0.8, 0]]);
      return (
        <Lienzo>
          <Brujula x={460} y={480} r={170} giro={giro + Math.sin(t * 3) * (t < kL ? 15 : 1)} />
          {/* el perro visto desde arriba: un óvalo que se gira hasta quedar norte-sur */}
          <g transform={`translate(1300 480) rotate(${giro})`}>
            <ellipse rx={70} ry={190} fill="url(#blanco)" />
            <circle cx={0} cy={-210} r={60} fill="url(#blanco)" />
          </g>
          <Sello x={1500} y={820 - 100} texto="NORTE-SUR" color={C.verde} k={t - kN - 0.4} />
          <S en={kL + 0.8} n="blip" v={0.2} />
          <S en={kN + 0.4} n="impacto" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Tu perro se está orientando"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.05]])} suelo>
        <PerroSentado x={900} y={800} f={f} cola={0} oreja={1} cabeza={-14} halo={0.5} />
        <Interrogante x={1300} y={420} tam={240} k={t - R("Tu perro se está orientando", "Nadie sabe")} />
      </Lienzo>
    ),
  },
  {
    desde: E("Por si acaso"),
    pinta: (t) => (
      <Lienzo>
        <Esquina x={1200} techo={200} ancho={400} />
        <Brujula x={460} y={480} r={150} giro={kf(t, [[0, 0], [1.4, 45]])} />
        <Texto x={1200} y={140} texto="NORTE" tam={56} color={C.amarillo} k={t - R("Por si acaso", "queda al norte")} />
        <S en={R("Por si acaso", "queda al norte")} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  // ── regla 5 ──
  {
    desde: E("Regla número cinco"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={5} titulo="NO LE DIGAS «BUEN CHICO» SIN GANAS" k={t} escribeDesde={R("Regla número cinco", "No le digas")} />,
  },
  {
    desde: E("En dos mil dieciséis"),
    pinta: (t, f) => {
      const kH = R("En dos mil dieciséis", "Les hablaron");
      return (
        <Lienzo suelo>
          <Escaner x={1100} y={460} />
          <g transform="translate(-60 0)">
            <PerroTumbado x={760} y={540} escala={0.7} f={f} oreja={1} halo={0.4} />
          </g>
          <Texto x={1100} y={160} texto="13 PERROS · SCIENCE · 2016" tam={44} k={t - 0.6} />
          {t > kH ? <Bocadillo x={500} y={300} texto="BUEN CHICO" k={t - kH} tam={40} /> : null}
          <S en={0.6} n="blip" v={0.15} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Su cerebro separaba"),
    pinta: (t) => {
      const kC = R("Su cerebro separaba", "de cómo lo decías");
      return (
        <Lienzo>
          {/* el cerebro en dos mitades: la izquierda, las palabras; la derecha, el tono */}
          <path d="M 950 260 C 760 240 600 330 600 500 C 600 660 760 760 950 740 Z" fill="url(#blanco)" />
          <path d="M 970 260 C 1160 240 1320 330 1320 500 C 1320 660 1160 760 970 740 Z" fill="url(#blanco)" opacity={fade(t - kC)} />
          <Texto x={400} y={520} texto="LO QUE DICES" tam={40} k={t - 0.4} />
          <Texto x={1540} y={520} texto="CÓMO LO DICES" tam={40} k={t - kC} />
          <S en={0.4} n="blip" v={0.15} />
          <S en={kC} n="blip" v={0.15} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Solo se alegraba"),
    pinta: (t, f) => {
      const kV = R("Solo se alegraba", "Si lo dices con voz plana");
      const kS = R("Solo se alegraba", "lo sabe");
      return (
        <Lienzo>
          <CaraPerro x={960} y={480} r={230} halo={0.6} oreja={t > kV ? 0 : 0.5} boca={t > kV ? 0 : 0.6} />
          {t > kV ? <line x1={300} y1={300} x2={620} y2={300} stroke={C.blanco} strokeWidth={10} strokeLinecap="round" /> : <path d={`M 300 300 ${Array.from({ length: 8 }, (_, i) => `Q ${320 + i * 40} ${i % 2 ? 250 : 350} ${340 + i * 40} 300`).join(" ")}`} fill="none" stroke={C.blanco} strokeWidth={10} strokeLinecap="round" />}
          <Cruz x={1500} y={300} k={t - kS} tam={120} />
          <S en={kS} n="blip_grave" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Este archivo se lee"),
    pinta: (t, f) => {
      const kN = R("Este archivo se lee", "Él lo ha notado");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.06]])} cx={960} cy={500}>
          <Documento x={700} y={470} w={480} h={560} titulo="ARCHIVO 018" k={t} lineas={7} />
          {t > kN ? <CaraPerro x={1360} y={520} r={180} halo={0.8} mira={[-0.7, 0]} /> : null}
          <S en={kN} n="latido" v={0.3} />
        </Lienzo>
      );
    },
  },
];
