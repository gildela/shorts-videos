// Bloque 1: gancho, apertura del archivo 020, el dato de cuánta gente lo vive y la primera consulta (cuántas veces).
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { Dormitorio, Mesa, Puerta, RelojDigital } from "../../estilos/archivo/piezas/Casa";
import { CabezaGrande, Empleado, Mano, PersonaCama, PersonaDePie } from "../../estilos/archivo/piezas/Persona";
import { Bocadillo, Cruz, Documento, EtiquetaTu, FilaCasillas, LogoNegociado, Sello, TarjetaDato, TarjetaPregunta, TarjetaTitulo, Texto } from "../../estilos/archivo/piezas/Interfaz";
import { Cronometro } from "../../estilos/archivo/piezas/Archivo";
import { CABEZA, E, PUERTA, Presencia, R } from "./comun";

export const PLANOS_S1: Plano[] = [
  {
    desde: 0,
    entra: "negro",
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3.2, 1.05]])} cx={960} cy={560} suelo>
        <Dormitorio ventana>
          <PersonaCama {...CABEZA} ojos={0} respira={Math.sin(f / 22) * 3} />
        </Dormitorio>
        <Puerta {...PUERTA} hueco />
        {t > E("tres") - 0.1 ? <RelojDigital x={1450} y={430} hora="03:04" escala={0.8 * pop(t - E("tres") + 0.1)} /> : null}
        <S en={E("tres")} n="blip_grave" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("Abres los ojos"),
    pinta: (t) => (
      <Lienzo>
        <CabezaGrande x={960} y={470} r={210} ojos={kf(t, [[0.2, 0], [0.45, 1]])} />
        <S en={0.3} n="aliento" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("La habitación está igual"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.04]])} cx={960} cy={560} suelo>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={1} respira={Math.sin(f / 22) * 3} />
        </Dormitorio>
        <Puerta {...PUERTA} hueco />
        <RelojDigital x={1450} y={430} hora="03:04" escala={0.8} />
      </Lienzo>
    ),
  },
  {
    desde: E("Intentas mover la mano"),
    pinta: (t, f) => {
      const kN = R("Intentas mover la mano", "La mano no se mueve");
      // la mano tiembla un pelín mientras lo intenta; luego queda quieta y cae la cruz
      const tiembla = t < kN ? Math.sin(f * 2.3) * 2 : 0;
      return (
        <Lienzo>
          <g transform={`translate(${tiembla} 0)`}>
            <Mano x={960} y={540} escala={1.1} />
          </g>
          <Cruz x={960} y={420} k={t - kN - 0.6} tam={260} />
          <S en={kN + 0.6} n="blip_grave" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Y en la puerta"),
    entra: "glitch",
    pinta: (t) => {
      const kA = R("Y en la puerta", "hay alguien");
      return (
        <Lienzo zoom={kf(t, [[0, 1.3], [4, 1.42]])} cx={PUERTA.x - 160} cy={600} suelo>
          <Puerta {...PUERTA} hueco />
          <Presencia x={PUERTA.x} y={PUERTA.y} escala={1.05} k={t - kA + 0.3} ojos={t > kA + 0.4 ? 1 : 0} />
          <S en={kA + 0.4} n="impacto" v={0.4} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Si esto te ha pasado"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo>
        <Documento x={960} y={470} w={480} h={560} titulo="ARCHIVO 020" k={t} lineas={7} />
        <EtiquetaTu x={960} y={150} k={t - R("Si esto te ha pasado", "para ti")} f={f} texto="PARA TI" />
        <S en={0.05} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("No grites"),
    pinta: (t) => (
      <Lienzo>
        <CabezaGrande x={1160} y={480} r={200} ojos={1} />
        <Bocadillo x={880} y={360} texto="¡AYUDA!" k={t - 0.05} tam={60} ancho={360} />
        <Cruz x={700} y={260} k={t - 0.45} tam={170} />
        <S en={0.45} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("No luches"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <PersonaDePie x={960} y={800} pose="brazosAbiertos" frente />
        <Cruz x={960} y={480} k={t - 0.4} tam={280} />
        <S en={0.4} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Y sobre todo"),
    pinta: (t) => {
      const kM = R("Y sobre todo", "no mires");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.05]])} cx={1100} cy={560} suelo>
          <Puerta x={1300} y={800} hueco />
          <g opacity={t > kM ? 1 : 0}>
            <CabezaGrande x={560} y={470} r={150} ojos={1} cuello={false} />
            <Cruz x={560} y={470} k={t - kM - 0.5} tam={200} />
          </g>
          <S en={kM + 0.5} n="blip_grave" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Dura menos de lo que parece"),
    pinta: (t) => (
      <Lienzo>
        <Cronometro x={960} y={470} r={200} aguja={kf(t, [[0, 0], [2.4, 0.16]])} k={t} />
        <S en={0.1} n="tecla" v={0.15} />
      </Lienzo>
    ),
  },
  {
    desde: E("Hay siete reglas"),
    pinta: (t) => {
      const kMarca = R("Hay siete reglas", "cumplen seis");
      return (
        <Lienzo>
          <FilaCasillas x={960} y={520} marcadas={6} k={t} kMarca={t - kMarca} tam={104} ultimaInterrogante={t > R("Hay siete reglas", "Nadie os")} />
          {Array.from({ length: 7 }, (_, i) => (
            <S key={i} en={0.12 * i} n="blip" v={0.12} />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <S key={`m${i}`} en={kMarca + 0.28 * i} n="blip" v={0.15} />
          ))}
        </Lienzo>
      );
    },
  },
  // ── archivo 020 ──
  {
    desde: E("Archivo cero veinte"),
    entra: "glitch",
    pinta: (t) => <TarjetaTitulo grande="ARCHIVO 020" pequeno={t > R("Archivo cero veinte", "Parálisis") ? "PARÁLISIS DEL SUEÑO" : undefined} k={t} />,
  },
  {
    desde: E("Negociado de Asuntos"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 020" />
        <Empleado x={960} y={560} cabeza={Math.sin(f / 30) * 1.5} escribe={t > R("Negociado de Asuntos", "Por favor") ? 1 : 0} />
        <LogoNegociado x={1560} y={300} r={70} texto k={t - 0.3} />
        <S en={0.3} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  // ── el dato: cuánta gente ──
  {
    desde: E("Unos investigadores revisaron"),
    pinta: (t) => {
      return (
        <Lienzo>
          {Array.from({ length: 35 }, (_, i) => (
            <g key={i} opacity={pop(t - 0.3 - i * 0.05)}>
              <Documento x={360 + (i % 7) * 200} y={250 + Math.floor(i / 7) * 110} w={120} h={90} lineas={2} giro={((i * 37) % 9) - 4} k={9} />
            </g>
          ))}
          <Texto x={960} y={790} texto="35 ESTUDIOS · 2011" tam={50} color={C.gris} k={t - 1.2} />
          <S en={0.3} n="tecla" v={0.12} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Más de treinta y seis mil"),
    pinta: (t) => (
      <Lienzo>
        <Texto x={960} y={520} texto="36.533" tam={260} peso={900} k={t - 0.1} />
        <Texto x={960} y={630} texto="PERSONAS" tam={60} color={C.gris} k={t - 0.5} />
        <S en={0.1} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("Una de cada trece"),
    pinta: (t, f) => {
      const kE = R("Una de cada trece", "Si estudias");
      const est = t >= kE;
      return (
        <Lienzo>
          <TarjetaDato x={960} y={450} w={1500} h={520} fuente="SLEEP MEDICINE REVIEWS · 2011 · 35 ESTUDIOS" k={t}>
            <Texto x={0} y={-130} texto={est ? "ESTUDIANTES · 28,3 %" : "POBLACIÓN GENERAL · 7,6 %"} tam={64} peso={900} k={est ? t - kE : t - 0.3} />
            {!est
              ? Array.from({ length: 13 }, (_, i) => (
                  <g key={i} opacity={pop(t - 0.4 - i * 0.04)}>
                    <PersonaDePie x={-600 + i * 100} y={210} escala={0.5} frente />
                  </g>
                ))
              : Array.from({ length: 3 }, (_, i) => (
                  <g key={`e${i}`} opacity={pop(t - kE - i * 0.1)}>
                    <PersonaDePie x={-300 + i * 300} y={210} escala={0.62} frente />
                  </g>
                ))}
          </TarjetaDato>
          {!est ? <EtiquetaTu x={960} y={470} k={t - 0.9} f={f} texto="1 DE 13" /> : <EtiquetaTu x={1260} y={440} k={t - kE - 0.6} f={f} texto="1 DE 3" />}
          <Sello x={1560} y={210} texto="COMPROBADO" k={t - 1.6} color={C.verde} />
          <S en={0.9} n="blip" v={0.18} />
          <S en={1.6} n="impacto" v={0.3} />
          <S en={kE + 0.6} n="blip_grave" v={0.25} />
        </Lienzo>
      );
    },
  },
  // ── consulta 1: cuántas veces ──
  {
    desde: E("Antes de empezar"),
    entra: "glitch",
    pinta: (t) => (
      <TarjetaPregunta pregunta="¿CUÁNTAS VECES TE HA PASADO?" k={t} escribeDesde={R("Antes de empezar", "Cuántas veces")} kOpciones={R("Antes de empezar", "comentarios")} pie="ESCRIBE EL NÚMERO EN LOS COMENTARIOS" />
    ),
  },
  {
    desde: E("Los estamos contando"),
    pinta: (t) => (
      <Lienzo>
        {["1", "3", "1", "12", "2", "1", "7", "1"].map((n, i) => (
          <Texto key={i} x={300 + (i % 4) * 440} y={380 + Math.floor(i / 4) * 260} texto={n} tam={150} peso={900} color={n === "12" ? C.amarillo : C.blanco} k={t - 0.1 - i * 0.16} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <S key={i} en={0.1 + i * 0.16} n="tecla" v={0.15} />
        ))}
      </Lienzo>
    ),
  },
];
