// Bloque 1: gancho, apertura del archivo 019 y la primera consulta (la hora).
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { Dormitorio, Interruptor, Mesa, RelojDigital, Techo } from "../../estilos/archivo/piezas/Casa";
import { CabezaGrande, Empleado, PersonaCama } from "../../estilos/archivo/piezas/Persona";
import { Cruz, Documento, EtiquetaTu, FilaCasillas, LogoNegociado, TarjetaPregunta, TarjetaTitulo, Texto } from "../../estilos/archivo/piezas/Interfaz";
import { Ondas } from "../../estilos/archivo/piezas/Perro";
import { CABEZA, E, R } from "./comun";

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
    desde: E("Abres los ojos"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.6], [2.2, 1.7]])} cx={CABEZA.x - 140} cy={CABEZA.y + 130} suelo>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={kf(t, [[0.2, 0], [0.4, 1]])} />
        </Dormitorio>
        <S en={0.3} n="latido" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("No ha sonado nada"),
    pinta: (t) => (
      <Lienzo>
        <RelojDigital x={960} y={460} hora="03:04" escala={1.6} />
        <Texto x={960} y={680} texto="ALARMA: NINGUNA" tam={48} color={C.gris} k={t - 0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("La casa está en silencio"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={900} cy={560} suelo>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={1} />
        </Dormitorio>
      </Lienzo>
    ),
  },
  {
    desde: E("Y tú estás completamente despierto"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.05]])} cx={960} cy={500}>
        <CabezaGrande x={960} y={470} r={220} ojos={1} />
        <EtiquetaTu x={1230} y={300} k={t - R("Y tú estás", "despierto")} f={f} texto="DESPIERTO" />
        <S en={R("Y tú estás", "despierto")} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("Ayer también"),
    entra: "glitch",
    pinta: (t) => {
      const kA = R("Ayer también", "Y anteayer");
      const kM = R("Ayer también", "A la misma hora");
      return (
        <Lienzo>
          {["LUNES", "MARTES", "MIÉRCOLES"].map((d, i) => {
            const k = i === 0 ? t : i === 1 ? t - kA : t - kM;
            return (
              <g key={d} opacity={pop(k)}>
                <Texto x={420 + i * 540} y={300} texto={d} tam={44} color={C.gris} />
                <RelojDigital x={420 + i * 540} y={460} hora="03:04" escala={0.7} rojo={i === 2} />
              </g>
            );
          })}
          <S en={0} n="tecla" v={0.15} />
          <S en={kA} n="tecla" v={0.15} />
          <S en={kM} n="blip_grave" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Si esto te ha pasado"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo>
        <Documento x={960} y={470} w={480} h={560} titulo="ARCHIVO 019" k={t} lineas={7} />
        <EtiquetaTu x={960} y={150} k={t - R("Si esto te ha pasado", "para ti")} f={f} texto="PARA TI" />
        <S en={0.05} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("No mires el reloj"),
    pinta: (t) => (
      <Lienzo>
        <RelojDigital x={960} y={480} hora="03:04" escala={1.5} />
        <Cruz x={960} y={480} k={t - 0.55} tam={320} />
        <S en={0.55} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("No enciendas la luz"),
    pinta: (t) => (
      <Lienzo>
        <Interruptor x={960} y={500} escala={2.2} />
        <Cruz x={960} y={500} k={t - 0.55} tam={300} />
        <S en={0.55} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Y sobre todo"),
    pinta: (t, f) => {
      const kN = R("Y sobre todo", "no intentes");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.05]])} cx={900} cy={560} suelo>
          <Dormitorio>
            <PersonaCama {...CABEZA} ojos={t > kN + 0.4 ? 0 : 1} />
          </Dormitorio>
          <Cruz x={CABEZA.x} y={CABEZA.y - 10} k={t - kN - 0.9} tam={180} />
          <S en={kN + 0.9} n="blip_grave" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Te despierta a la misma hora"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 2.3], [4, 2.4]])} cx={800} cy={170}>
        <Techo />
        <g transform="rotate(90 960 120)">
          <Ondas x={960} y={120} k={t} />
        </g>
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
  // ── archivo 019 ──
  {
    desde: E("Archivo cero diecinueve"),
    entra: "glitch",
    pinta: (t) => <TarjetaTitulo grande="ARCHIVO 019" pequeno={t > R("Archivo cero diecinueve", "Vigilia") ? "VIGILIA DOMÉSTICA" : undefined} k={t} />,
  },
  {
    desde: E("Negociado de Asuntos"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 019" />
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
      <TarjetaPregunta pregunta="¿A QUÉ HORA TE DESPIERTAS TÚ?" k={t} escribeDesde={R("Antes de empezar", "A qué hora")} kOpciones={R("Antes de empezar", "comentarios")} />
    ),
  },
  {
    desde: E("Las estamos contando"),
    pinta: (t) => (
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
