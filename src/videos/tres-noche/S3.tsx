// Bloque 3: la ficha del primer sueño, la consulta «vuelvo o guardia», la regla cuatro (catorce horas de oscuridad)
// y la cinco (escucha la casa).
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { Bombilla, CasaFuera, Dormitorio, Nevera, Pasillo, Puerta, RelojDigital } from "../../estilos/archivo/piezas/Casa";
import { CabezaGrande, PersonaCama, PersonaDePie } from "../../estilos/archivo/piezas/Persona";
import { Cruz, Documento, Sello, TarjetaDato, TarjetaPregunta, TarjetaRegla, Texto, Tick } from "../../estilos/archivo/piezas/Interfaz";
import { Recorte } from "../../estilos/archivo/piezas/Archivo";
import { Pasos } from "../../estilos/archivo/piezas/Objetos";
import { Ondas } from "../../estilos/archivo/piezas/Perro";
import { CABEZA, E, Fuego, R } from "./comun";

/** Barra de un día de 24 h con tramos: [desde, hasta, tipo] en horas desde las 18:00. */
const Dia: React.FC<{ y: number; tramos: [number, number, "sueno" | "despierto" | "oscuro"][]; k: number }> = ({ y, tramos, k }) => {
  const x0 = 260, w = 1400;
  return (
    <g opacity={fade(k)}>
      <rect x={x0} y={y} width={w} height={70} rx={10} fill="none" stroke={C.gris} strokeWidth={6} />
      {tramos.map(([a, b, tipo], i) => (
        <rect key={i} x={x0 + (a / 24) * w} y={y + 8} width={((b - a) / 24) * w} height={54} rx={6} fill={tipo === "sueno" ? C.blanco : tipo === "oscuro" ? C.grisOscuro : "none"} stroke={tipo === "despierto" ? C.amarillo : "none"} strokeWidth={6} opacity={pop(k - 0.2 - i * 0.25)} />
      ))}
    </g>
  );
};

export const PLANOS_S3: Plano[] = [
  // ── ficha: el primer sueño ──
  {
    desde: E("Un historiador buscó"),
    entra: "glitch",
    pinta: (t) => {
      const kC = R("Un historiador buscó", "cartas");
      const kJ = R("Un historiador buscó", "juicios");
      return (
        <Lienzo>
          <Documento x={500} y={470} w={360} h={460} titulo="DIARIO" lineas={6} giro={-4} k={t - 0.2} />
          <Documento x={960} y={470} w={360} h={460} titulo="CARTA" lineas={6} giro={2} k={t - kC} />
          <Documento x={1420} y={470} w={360} h={460} titulo="JUICIO" lineas={6} giro={-1} k={t - kJ} />
          <S en={0.2} n="blip" v={0.15} />
          <S en={kC} n="blip" v={0.15} />
          <S en={kJ} n="blip" v={0.15} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Encontró más de quinientas"),
    pinta: (t) => {
      const kS = R("Encontró más de quinientas", "a lo mismo");
      return (
        <Lienzo>
          <TarjetaDato x={960} y={440} w={1100} h={420} fuente="A. R. EKIRCH · AT DAY'S CLOSE · 2005" k={t}>
            <Texto x={0} y={20} texto="+500" tam={200} peso={900} k={t - 0.3} />
            <Texto x={0} y={120} texto="MENCIONES" tam={56} color={C.gris} k={t - 0.5} />
          </TarjetaDato>
          <Sello x={1400} y={220} texto="COMPROBADO" color={C.verde} k={t - kS} />
          <S en={kS} n="impacto" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("El primer sueño"),
    pinta: (t) => {
      const kS = R("El primer sueño", "Y el segundo sueño");
      return (
        <Lienzo>
          <Dia y={420} tramos={[[1, 7, "sueno"], ...(t > kS ? ([[7, 9.5, "despierto"], [9.5, 15.5, "sueno"]] as [number, number, "sueno" | "despierto"][]) : [])]} k={t} />
          <Texto x={260 + (4 / 24) * 1400} y={390} texto="PRIMER SUEÑO" tam={40} k={t - 0.2} />
          {t > kS ? <Texto x={260 + (12.5 / 24) * 1400} y={390} texto="SEGUNDO SUEÑO" tam={40} k={t - kS} /> : null}
          <Texto x={260} y={570} texto="18:00" tam={34} color={C.gris} ancla="start" />
          <Texto x={1660} y={570} texto="18:00" tam={34} color={C.gris} ancla="end" />
          <S en={kS} n="blip" v={0.18} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Durante siglos, la gente"),
    pinta: (t) => {
      const kP = R("Durante siglos, la gente", "Pasada la medianoche");
      const kH = R("Durante siglos, la gente", "Una hora");
      const luz = t > kP + 0.6;
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [7, 1.06]])} cx={960} cy={520} suelo>
          {[0, 1, 2].map((i) => (
            <CasaFuera key={i} x={420 + i * 540} y={800} escala={0.75} ventanas={[luz && i !== 1, luz]} luna={i === 0} />
          ))}
          {t > kH ? <RelojDigital x={1560} y={260} hora={t > kH + 1.2 ? "01:40" : "00:40"} escala={0.5} /> : null}
          <S en={kP + 0.6} n="clic" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Rezaban"),
    pinta: (t, f) => {
      const kF = R("Rezaban", "Avivaban el fuego");
      const kV = R("Rezaban", "Visitaban a los vecinos");
      const kC = R("Rezaban", "Luego volvían");
      return (
        <Lienzo suelo>
          {t < kV ? (
            <>
              <PersonaDePie x={700} y={800} pose={t < kF ? "manosCara" : "agachado"} />
              {t > kF ? <Fuego x={1100} y={800} f={f} escala={1.1} /> : null}
            </>
          ) : t < kC ? (
            <>
              <Puerta x={1200} y={800} abierta={0.6} luz />
              <PersonaDePie x={kf(t - kV, [[0, 500], [2, 960]])} y={800} pose="anda" fase={((t - kV) * 1.4) % 1} />
            </>
          ) : (
            <Dormitorio>
              <PersonaCama {...CABEZA} ojos={0} />
            </Dormitorio>
          )}
          <S en={kF} n="blip" v={0.15} />
          <S en={kV} n="golpes" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Nadie lo llamaba insomnio"),
    entra: "glitch",
    pinta: (t) => {
      const kT = R("Nadie lo llamaba insomnio", "Era un turno");
      return (
        <Lienzo>
          <Texto x={960} y={420} texto="INSOMNIO" tam={150} peso={900} color={t > kT ? C.gris : C.blanco} />
          {t > kT ? <line x1={560} x2={1360} y1={370} y2={370} stroke={C.rojo} strokeWidth={14} opacity={fade(t - kT)} /> : null}
          {t > kT ? <Texto x={960} y={640} texto="TURNO" tam={150} peso={900} k={t - kT - 0.3} /> : null}
          <S en={kT} n="blip_grave" v={0.25} />
          <S en={kT + 0.3} n="impacto" v={0.3} />
        </Lienzo>
      );
    },
  },
  // ── consulta 2: vuelvo o guardia ──
  {
    desde: E("El Negociado necesita confirmarlo"),
    entra: "glitch",
    pinta: (t) => (
      <TarjetaPregunta
        pregunta="¿TE VUELVES A DORMIR ENSEGUIDA?"
        k={t}
        escribeDesde={R("El Negociado necesita confirmarlo", "Te vuelves")}
        opciones={["VUELVO", "GUARDIA"]}
        kOpciones={R("El Negociado necesita confirmarlo", "comentarios")}
      />
    ),
  },
  {
    desde: E("Lo revisaremos uno a uno"),
    pinta: (t) => (
      <Lienzo>
        {["GUARDIA", "VUELVO", "GUARDIA", "GUARDIA", "GUARDIA", "VUELVO"].map((w, i) => (
          <g key={i} opacity={pop(t - 0.1 - i * 0.2)}>
            <Texto x={480 + (i % 3) * 480} y={360 + Math.floor(i / 3) * 220} texto={w} tam={60} peso={900} color={w === "GUARDIA" ? C.blanco : C.gris} />
          </g>
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <S key={i} en={0.1 + i * 0.2} n="tecla" v={0.15} />
        ))}
      </Lienzo>
    ),
  },
  // ── regla 4 ──
  {
    desde: E("Regla número cuatro"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={4} titulo="NO ENCIENDAS LA LUZ DEL PASILLO" k={t} escribeDesde={R("Regla número cuatro", "No enciendas")} />,
  },
  {
    desde: E("En mil novecientos noventa y dos"),
    pinta: (t) => {
      const kC = R("En mil novecientos noventa y dos", "catorce horas");
      const kM = R("En mil novecientos noventa y dos", "Durante un mes");
      return (
        <Lienzo>
          <TarjetaDato x={960} y={420} w={1400} h={460} fuente="J. SLEEP RESEARCH · WEHR · 1992" k={t}>
            <Texto x={0} y={-130} texto={t > kC ? "14 H DE OSCURIDAD AL DÍA" : "VOLUNTARIOS"} tam={64} peso={900} k={t - 0.3} />
            {t > kM ? <Texto x={0} y={170} texto="× 1 MES" tam={64} color={C.gris} k={t - kM} /> : null}
          </TarjetaDato>
          {t > kC ? <Dia y={385} tramos={[[0, 14, "oscuro"]]} k={t - kC} /> : null}
          <S en={kC} n="blip" v={0.18} />
          <S en={kM} n="blip" v={0.18} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Al cabo de unas semanas"),
    pinta: (t) => {
      const kD = R("Al cabo de unas semanas", "se partió en dos");
      const k4 = R("Al cabo de unas semanas", "Cuatro horas dormidos");
      const kU = R("Al cabo de unas semanas", "Una, dos o tres");
      const kO = R("Al cabo de unas semanas", "Otras cuatro");
      const tramos: [number, number, "sueno" | "despierto" | "oscuro"][] = [];
      if (t > k4) tramos.push([2, 6, "sueno"]);
      if (t > kU) tramos.push([6, 8, "despierto"]);
      if (t > kO) tramos.push([8, 12, "sueno"]);
      return (
        <Lienzo>
          <Dia y={420} tramos={[[0, 14, "oscuro"]]} k={1} />
          <Dia y={420} tramos={tramos} k={t > k4 ? 1 : 0} />
          {t > kU ? <Texto x={260 + (7 / 24) * 1400} y={390} texto="1-3 H DESPIERTOS" tam={40} color={C.amarillo} k={t - kU} /> : null}
          <Sello x={1350} y={290} texto="COMPROBADO" color={C.verde} k={t - kD} />
          <S en={kD} n="impacto" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Nadie se lo pidió"),
    pinta: (t) => {
      const kA = R("Nadie se lo pidió", "El cuerpo se acordó");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.05]])} cx={960} cy={480}>
          <CabezaGrande x={960} y={470} r={220} ojos={t > kA + 0.4 ? 1 : 0} />
          <S en={kA + 0.4} n="latido" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("La luz es lo único"),
    pinta: (t, f) => {
      const kO = R("La luz es lo único", "olvidar");
      return (
        <Lienzo suelo>
          <Pasillo>
            <Bombilla x={960} y={230} encendida={t < kO} escala={1.1} />
          </Pasillo>
          <S en={kO} n="clic" v={0.3} />
        </Lienzo>
      );
    },
  },
  // ── regla 5 ──
  {
    desde: E("Regla número cinco"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={5} titulo="A LAS 3:04, ESCUCHA LA CASA" k={t} escribeDesde={R("Regla número cinco", "A las tres")} />,
  },
  {
    desde: E("Primero cruje la madera"),
    pinta: (t) => {
      const kN = R("Primero cruje la madera", "Luego la nevera");
      return (
        <Lienzo suelo>
          {t < kN ? (
            <>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect key={i} x={360 + i * 200} y={700} width={180} height={60} rx={6} fill="none" stroke={C.blanco} strokeWidth={10} />
              ))}
              <g transform="rotate(-90 960 680)">
                <Ondas x={960} y={680} k={t} />
              </g>
              <S en={0.2} n="golpe" v={0.2} />
            </>
          ) : (
            <>
              <Nevera x={960} y={800} />
              <Ondas x={1180} y={480} k={t - kN} />
              <S en={kN} n="estatica" v={0.12} />
            </>
          )}
        </Lienzo>
      );
    },
  },
  {
    desde: E("Luego algo en el pasillo"),
    pinta: (t) => {
      const kD = R("Luego algo en el pasillo", "Despacio");
      return (
        <Lienzo suelo>
          <Pasillo />
          <Pasos x={300} y={770} n={9} sep={110} cada={0.6} escala={2.2} k={t - kD + 0.4} />
          {Array.from({ length: 9 }, (_, i) => (
            <S key={i} en={kD - 0.4 + i * 0.6} n="golpe" v={0.15} />
          ))}
        </Lienzo>
      );
    },
  },
  {
    desde: E("Se para delante"),
    entra: "glitch",
    pinta: (t, f) => {
      const kT = R("Se para delante", "Tú tampoco");
      return t < kT ? (
        <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.06]])} cx={960} cy={500} suelo>
          <Puerta x={960} y={800} w={300} h={540} />
          <Pasos x={880} y={775} n={2} sep={160} escala={2.2} k={99} />
          <S en={0.2} n="latido" v={0.3} />
        </Lienzo>
      ) : (
        <Lienzo zoom={kf(t - kT, [[0, 1.0], [3, 1.05]])} cx={900} cy={560} suelo>
          <Dormitorio>
            <PersonaCama {...CABEZA} ojos={1} />
          </Dormitorio>
        </Lienzo>
      );
    },
  },
  {
    desde: E("Alguien hacía esa ronda"),
    pinta: (t) => (
      <Lienzo>
        <Recorte x={960} y={460} etiqueta="TURNO:" texto="RONDA DE LAS 03:04" k={t} />
        <Tick x={1610} y={460} k={t - 1.2} tam={90} />
        <S en={1.2} n="blip" v={0.18} />
      </Lienzo>
    ),
  },
];
