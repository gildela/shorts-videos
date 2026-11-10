// Bloque 1: gancho, apertura del archivo 018 y la primera consulta (la hora).
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { Dormitorio, Interruptor, Mesa, Puerta, RelojDigital } from "../../estilos/archivo/piezas/Casa";
import { CaraPerro, Ondas, OjosPerro, PerroSentado } from "../../estilos/archivo/piezas/Perro";
import { CabezaGrande, Empleado, PersonaCama } from "../../estilos/archivo/piezas/Persona";
import { Bocadillo, Cruz, Documento, EtiquetaTu, FilaCasillas, LogoNegociado, TarjetaPregunta, TarjetaTitulo } from "../../estilos/archivo/piezas/Interfaz";
import { CABEZA, E, ESQUINA_X, Esquina, PERRO, R } from "./comun";

export const PLANOS_S1: Plano[] = [
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
    desde: E("Te despierta"),
    pinta: (t) => {
      const kL = R("Te despierta", "ladrido");
      return (
        <Lienzo zoom={kf(t, [[0, 1.6], [2.2, 1.72]])} cx={CABEZA.x - 140} cy={CABEZA.y + 130} suelo>
          <Dormitorio>
            <PersonaCama {...CABEZA} ojos={kf(t, [[kL, 0], [kL + 0.2, 1]])} />
          </Dormitorio>
          {t > kL ? <Ondas x={CABEZA.x - 420} y={CABEZA.y - 40} k={t - kL} izq /> : null}
          <S en={kL} n="golpe" v={0.35} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Solo uno"),
    pinta: (t) => (
      <Lienzo>
        <CabezaGrande x={960} y={470} r={200} ojos={1} />
        <text x={1400} y={420} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={900} fontSize={200} fill={C.blanco} opacity={pop(t - 0.2)}>
          1
        </text>
      </Lienzo>
    ),
  },
  {
    desde: E("Tu perro está en el pasillo"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={960} cy={560} suelo>
        <Puerta x={340} y={800} />
        <Esquina k={t - R("Tu perro está en el pasillo", "Mirando")} />
        <PerroSentado {...PERRO} f={f} cola={0} oreja={1} halo={0.6} />
      </Lienzo>
    ),
  },
  {
    desde: E("La esquina está vacía"),
    entra: "glitch",
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.5], [3, 1.62]])} cx={ESQUINA_X - 100} cy={520}>
        <Esquina />
        <S en={0.6} n="latido" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Si esto te ha pasado"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo>
        <Documento x={960} y={470} w={480} h={560} titulo="ARCHIVO 018" k={t} lineas={7} />
        <EtiquetaTu x={960} y={150} k={t - R("Si esto te ha pasado", "para ti")} f={f} texto="PARA TI" />
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
    desde: E("No le mandes callar"),
    pinta: (t) => (
      <Lienzo>
        <CaraPerro x={1200} y={500} r={200} oreja={0.6} halo={0.6} />
        <Bocadillo x={760} y={330} texto="¡CALLA!" k={t - 0.1} haciaIzquierda={false} tam={60} ancho={340} />
        <Cruz x={580} y={240} k={t - 0.7} tam={170} />
        <S en={0.7} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Y sobre todo"),
    pinta: (t, f) => {
      const kM = R("Y sobre todo", "no mires");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.06]])} cx={1100} cy={520}>
          <Esquina />
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
    desde: E("Lleva ahí desde que te dormiste"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={960} cy={560} suelo>
        <Puerta x={340} y={800} />
        <Esquina />
        <PerroSentado {...PERRO} f={f} cola={0} oreja={1} halo={0.6} oscuro={false} />
        <RelojDigital x={960} y={250} hora={t > 2 ? "03:04" : "00:12"} escala={0.7} />
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
  // ── archivo 018 ──
  {
    desde: E("Archivo cero dieciocho"),
    entra: "glitch",
    pinta: (t) => <TarjetaTitulo grande="ARCHIVO 018" pequeno={t > R("Archivo cero dieciocho", "Canino") ? "CANINO DOMÉSTICO" : undefined} k={t} />,
  },
  {
    desde: E("Negociado de Asuntos"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 018" />
        <Empleado x={960} y={560} cabeza={Math.sin(f / 30) * 1.5} escribe={t > R("Negociado de Asuntos", "Por favor") ? 1 : 0} />
        <LogoNegociado x={1560} y={300} r={70} texto k={t - 0.3} />
        <S en={0.3} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  // ── consulta 1: la hora ──
  {
    desde: E("Antes de empezar"),
    entra: "glitch",
    pinta: (t) => (
      <TarjetaPregunta pregunta="¿A QUÉ HORA LADRÓ EL TUYO?" k={t} escribeDesde={R("Antes de empezar", "A qué hora")} kOpciones={R("Antes de empezar", "comentarios")} />
    ),
  },
  {
    desde: E("Las estamos contando"),
    pinta: (t, f) => (
      <Lienzo>
        {["03:04", "03:04", "02:51", "03:04", "04:10", "03:04"].map((h, i) => (
          <g key={i} opacity={pop(t - 0.1 - i * 0.18)}>
            <RelojDigital x={420 + (i % 3) * 540} y={340 + Math.floor(i / 3) * 260} hora={h} escala={0.6} />
          </g>
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <S key={i} en={0.1 + i * 0.18} n="tecla" v={0.15} />
        ))}
      </Lienzo>
    ),
  },
];
