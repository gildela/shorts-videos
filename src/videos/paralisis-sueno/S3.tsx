// Bloque 3: regla tres (la presencia), la segunda consulta (quieto o todavía), regla cuatro (boca arriba) y regla cinco (no luches).
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { Dormitorio, Puerta, Ventana } from "../../estilos/archivo/piezas/Casa";
import { CabezaGrande, Mano, PersonaCama, PersonaDePie } from "../../estilos/archivo/piezas/Persona";
import { Cruz, Documento, EtiquetaTu, Sello, TarjetaDato, TarjetaPregunta, TarjetaRegla, Texto, Tick } from "../../estilos/archivo/piezas/Interfaz";
import { BocaArriba, CABEZA, E, Encima, FilaMusculo, PUERTA, Presencia, R } from "./comun";

const PASOS_MR = ["ES LA PARÁLISIS DEL SUEÑO", "NO ES PELIGROSA", "RELAJA LOS MÚSCULOS", "NO CONTROLES LA RESPIRACIÓN", "NO INTENTES MOVERTE"];

export const PLANOS_S3: Plano[] = [
  // ── regla 3 ──
  {
    desde: E("Regla número tres"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={3} titulo="NO MIRES HACIA LA PUERTA" k={t} escribeDesde={R("Regla número tres", "No mires")} />,
  },
  {
    desde: E("Sabrás que hay alguien"),
    pinta: (t) => {
      const kL = R("Sabrás que hay alguien", "Lo sabrás");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [5, 1.05]])} cx={960} cy={540} suelo>
          <Puerta x={1500} y={800} hueco />
          <CabezaGrande x={620} y={470} r={170} ojos={1} />
          <S en={kL} n="latido" v={0.3} />
          <S en={kL + 0.8} n="latido" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Más de la mitad"),
    pinta: (t) => {
      const kP = R("Más de la mitad", "una presencia");
      return (
        <Lienzo>
          <TarjetaDato x={960} y={440} w={1400} h={520} fuente="CONSCIOUSNESS AND COGNITION · 1999 · Y OTROS ESTUDIOS" k={t}>
            <Texto x={0} y={-160} texto="NOTAN UNA PRESENCIA" tam={56} peso={900} k={t - 0.3} />
            {Array.from({ length: 10 }, (_, i) => {
              const x = -540 + i * 120;
              const si = i < 6 && t > kP + i * 0.12;
              return (
                <g key={i} opacity={fade(t - 0.4 - i * 0.05)}>
                  {si ? <Presencia x={x} y={190} escala={0.6} /> : <circle cx={x} cy={40} r={40} fill="none" stroke={C.gris} strokeWidth={6} />}
                </g>
              );
            })}
          </TarjetaDato>
          <Sello x={1500} y={220} texto="COMPROBADO" color={C.verde} k={t - kP - 1.2} />
          <S en={kP} n="blip" v={0.18} />
          <S en={kP + 1.2} n="impacto" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Casi nunca es una persona"),
    pinta: (t) => (
      <Lienzo suelo>
        <PersonaDePie x={620} y={800} frente />
        <Cruz x={620} y={600} k={t - 0.8} tam={180} />
        <Presencia x={1300} y={800} escala={1.1} k={t - 1.2} />
        <S en={0.8} n="blip_grave" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("Estará en la puerta"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.03]])} cx={960} cy={560} suelo>
        <Dormitorio>
          <PersonaCama {...CABEZA} ojos={1} />
        </Dormitorio>
        <Puerta {...PUERTA} hueco />
        <Presencia x={PUERTA.x} y={PUERTA.y} escala={0.98} />
      </Lienzo>
    ),
  },
  {
    desde: E("O a los pies de la cama"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.03]])} cx={960} cy={560} suelo>
        <Presencia x={220} y={800} escala={0.95} />
        <Dormitorio ventana={false}>
          <PersonaCama {...CABEZA} ojos={1} />
        </Dormitorio>
        <Puerta {...PUERTA} hueco />
      </Lienzo>
    ),
  },
  {
    desde: E("O justo detrás de tu cabeza"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [5, 1.06]])} cx={1050} cy={560} suelo>
        <Presencia x={1330} y={800} escala={1.05} k={t - 0.2} />
        <Dormitorio ventana={false}>
          <PersonaCama {...CABEZA} ojos={1} />
        </Dormitorio>
        <S en={0.6} n="aliento" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Tus ojos son lo único"),
    pinta: (t) => {
      const kU = R("Tus ojos son lo único", "Úsalos");
      return t < kU ? (
        <Lienzo>
          <FilaMusculo x={620} y={420} texto="OJOS" ok k={t - 0.3} />
          {["BRAZOS", "PIERNAS", "VOZ"].map((m, i) => (
            <FilaMusculo key={m} x={620} y={540 + i * 90} texto={m} ok={false} k={t - 0.6 - i * 0.15} />
          ))}
          <S en={0.3} n="blip" v={0.18} />
        </Lienzo>
      ) : (
        <Lienzo>
          <Ventana x={960} y={430} tam={320} />
          <S en={0.2} n="blip" v={0.12} />
        </Lienzo>
      );
    },
  },
  // ── consulta 2: quieto o todavía ──
  {
    desde: E("El Negociado necesita confirmarlo"),
    entra: "glitch",
    pinta: (t) => (
      <TarjetaPregunta
        pregunta="¿TE HA PASADO ALGUNA VEZ?"
        opciones={["QUIETO", "TODAVÍA"]}
        k={t}
        escribeDesde={R("El Negociado necesita confirmarlo", "Te ha pasado")}
        kOpciones={R("El Negociado necesita confirmarlo", "comentarios")}
      />
    ),
  },
  {
    desde: E("Lo revisaremos uno a uno"),
    pinta: (t) => (
      <Lienzo>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <Documento x={390 + i * 380} y={450} w={340} h={330} titulo={i % 2 ? "TODAVÍA" : "QUIETO"} lineas={4} giro={(i % 2 ? 2 : -2)} k={t - i * 0.2} />
            <Tick x={390 + i * 380} y={560} k={t - 0.6 - i * 0.2} tam={50} />
          </g>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <S key={i} en={0.6 + i * 0.2} n="tecla" v={0.15} />
        ))}
      </Lienzo>
    ),
  },
  // ── regla 4 ──
  {
    desde: E("Regla número cuatro"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={4} titulo="DUERME DE LADO" k={t} escribeDesde={R("Regla número cuatro", "Duerme de lado")} />,
  },
  {
    desde: E("En dos mil dos"),
    pinta: (t) => {
      const kP = R("En dos mil dos", "seis mil setecientas");
      return (
        <Lienzo>
          <TarjetaDato x={960} y={420} w={1200} h={360} fuente="JOURNAL OF SLEEP RESEARCH · 2002 · CANADÁ" k={t}>
            <Texto x={0} y={-60} texto="ENCUESTA" tam={44} color={C.gris} k={t - 0.3} />
            <Texto x={0} y={70} texto="6.730 PERSONAS" tam={110} peso={900} k={t - kP} />
          </TarjetaDato>
          <S en={kP} n="blip" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Cómo dormían"),
    pinta: (t, f) => {
      const kM = R("Cómo dormían", "La mayoría");
      const barras = [
        { t: "DE LADO", v: 0.35 },
        { t: "BOCA ABAJO", v: 0.18 },
        { t: "BOCA ARRIBA", v: 0.8 },
      ];
      return (
        <Lienzo>
          {barras.map((b, i) => {
            const w = 900 * b.v * kf(t, [[kM, 0], [kM + 0.9, 1]]);
            return (
              <g key={b.t} opacity={fade(t - 0.2 - i * 0.2)}>
                <Texto x={720} y={330 + i * 160} texto={b.t} tam={44} ancla="end" />
                <rect x={760} y={292 + i * 160} width={Math.max(4, w)} height={52} rx={10} fill={i === 2 ? "url(#blanco)" : C.gris} />
              </g>
            );
          })}
          {t > kM + 0.9 ? <EtiquetaTu x={760 + 720 + 40} y={600} k={t - kM - 0.9} f={f} texto="LA MAYORÍA" /> : null}
          <S en={kM} n="blip" v={0.18} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Boca arriba era"),
    pinta: (t) => (
      <Lienzo>
        <Texto x={960} y={500} texto="× 3-4" tam={240} peso={900} k={t - 0.4} />
        <Texto x={960} y={640} texto="BOCA ARRIBA DURANTE LA PARÁLISIS" tam={44} color={C.gris} k={t - 0.8} />
        <Sello x={1580} y={220} texto="COMPROBADO" color={C.verde} k={t - 2.2} />
        <S en={0.4} n="impacto" v={0.3} />
        <S en={2.2} n="impacto" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Boca arriba, la cara"),
    pinta: (t, f) => {
      const kP = R("Boca arriba, la cara", "El pecho queda libre");
      const kS = R("Boca arriba, la cara", "Hay sitio para sentarse");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [7, 1.06]])} cx={900} cy={560} suelo>
          <Dormitorio ventana={false}>
            <BocaArriba />
          </Dormitorio>
          {t > kP && t < kS ? <circle cx={800} cy={360} r={90} fill="none" stroke={C.gris} strokeWidth={8} strokeDasharray="20 16" opacity={fade(t - kP)} /> : null}
          <Encima x={820} y={422} k={t - kS - 0.6} ojos={t > kS + 1.4 ? 1 : 0} />
          <S en={kS + 1.4} n="latido" v={0.35} />
        </Lienzo>
      );
    },
  },
  // ── regla 5 ──
  {
    desde: E("Regla número cinco"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={5} titulo="NO LUCHES" k={t} escribeDesde={R("Regla número cinco", "No luches")} />,
  },
  {
    desde: E("Querrás mover un dedo"),
    pinta: (t, f) => {
      const kB = R("Querrás mover un dedo", "Luego el brazo");
      const amp = t > kB ? 5 : 2;
      return (
        <Lienzo>
          <g transform={`translate(${Math.sin(f * 2.3) * amp} ${Math.cos(f * 3.1) * amp * 0.5})`}>
            <Mano x={960} y={540} escala={1.1} />
          </g>
          <Texto x={1420} y={460} texto={t > kB ? "BRAZO" : "DEDO"} tam={64} peso={900} color={C.gris} k={t > kB ? t - kB : t - 0.4} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Cuanto más empujas"),
    pinta: (t) => {
      const kM = R("Cuanto más empujas", "más miedo");
      return (
        <Lienzo>
          {[
            { t: "EMPUJAS", k: 0.2 },
            { t: "MIEDO", k: kM },
          ].map((b, i) => (
            <g key={b.t}>
              <rect x={640 + i * 460} y={720 - 460 * kf(t, [[b.k, 0.1], [b.k + 1.6, 1]])} width={180} height={460 * kf(t, [[b.k, 0.1], [b.k + 1.6, 1]])} rx={12} fill={i ? "url(#blanco)" : C.gris} />
              <Texto x={730 + i * 460} y={790} texto={b.t} tam={44} k={t - b.k} />
            </g>
          ))}
          <S en={kM} n="latido" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Cuanto más miedo, más cerca"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.05]])} cx={1100} cy={560} suelo>
        <Presencia x={kf(t, [[0.2, 1700], [2.6, 1360]])} y={800} escala={kf(t, [[0.2, 0.95], [2.6, 1.05]])} />
        <Dormitorio ventana={false}>
          <PersonaCama {...CABEZA} ojos={1} sudor />
        </Dormitorio>
        <Puerta {...PUERTA} hueco />
        <S en={1.0} n="latido" v={0.3} />
        <S en={1.6} n="latido" v={0.35} />
      </Lienzo>
    ),
  },
  {
    desde: E("En dos mil dieciséis"),
    pinta: (t) => (
      <Lienzo>
        <TarjetaDato x={960} y={420} w={1200} h={340} fuente="FRONTIERS IN PSYCHOLOGY · 2016" k={t}>
          <Texto x={0} y={-40} texto="UNIVERSIDAD DE CAMBRIDGE" tam={50} peso={900} k={t - 0.4} />
          <Texto x={0} y={60} texto="TERAPIA DE MEDITACIÓN Y RELAJACIÓN" tam={36} color={C.gris} k={t - 1.2} />
        </TarjetaDato>
        <S en={0.4} n="blip" v={0.18} />
      </Lienzo>
    ),
  },
  {
    desde: E("Repetirte que es"),
    pinta: (t) => {
      const ks = [0, R("Repetirte que es", "Que no es peligrosa"), R("Repetirte que es", "Relajar los músculos"), R("Repetirte que es", "No controlar"), R("Repetirte que es", "Y no intentar moverse")];
      return (
        <Lienzo>
          <Documento x={960} y={460} w={1300} h={660} titulo="PROCEDIMIENTO" lineas={0} giro={-1} k={t}>
            {PASOS_MR.map((p, i) => (
              <g key={p} opacity={fade(t - ks[i] - 0.1)}>
                <text x={-560} y={-150 + i * 100} fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={44} fill={C.negro}>
                  {`${i + 1}. ${p}`}
                </text>
              </g>
            ))}
          </Documento>
          {ks.map((k, i) => (
            <S key={i} en={k + 0.1} n="tecla" v={0.15} />
          ))}
        </Lienzo>
      );
    },
  },
  {
    desde: E("Él no hace nada"),
    pinta: (t) => {
      const kC = R("Él no hace nada", "Lo hemos comprobado");
      return (
        <Lienzo zoom={kf(t, [[0, 1.0], [5, 1.04]])} cx={960} cy={560} suelo>
          <Dormitorio>
            <PersonaCama {...CABEZA} ojos={1} />
          </Dormitorio>
          <Puerta {...PUERTA} hueco />
          <Presencia x={PUERTA.x} y={PUERTA.y} escala={0.98} ojos={0.6} />
          <Sello x={960} y={250} texto="COMPROBADO" color={C.verde} k={t - kC - 0.5} />
          <S en={kC + 0.5} n="impacto" v={0.3} />
        </Lienzo>
      );
    },
  },
];
