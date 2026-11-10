// Bloque 2: reglas uno (el oído), dos (el bostezo) y tres (la cara de culpa).
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { Pasillo } from "../../estilos/archivo/piezas/Casa";
import { CaraPerro, Ondas, Oreja, OrejaPerro, PerroSentado, PerroTumbado } from "../../estilos/archivo/piezas/Perro";
import { CabezaGrande, PersonaDePie } from "../../estilos/archivo/piezas/Persona";
import { Bocadillo, Cruz, Sello, TarjetaDato, TarjetaRegla, Texto, Tick } from "../../estilos/archivo/piezas/Interfaz";
import { parpadeo } from "../../estilos/archivo/piezas/Gato";
import { E, Esquina, PERRO, R } from "./comun";

export const PLANOS_S2: Plano[] = [
  // ── regla 1 ──
  {
    desde: E("Regla número uno"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={1} titulo="NO LE MANDES CALLAR" k={t} escribeDesde={R("Regla número uno", "No le mandes")} />,
  },
  {
    desde: E("Tú oyes hasta"),
    pinta: (t) => {
      const kP = R("Tú oyes hasta", "Tu perro oye");
      return (
        <Lienzo>
          <Oreja x={520} y={400} escala={1.3} />
          <Texto x={520} y={680} texto="20.000 HZ" tam={64} k={t - 0.8} />
          <g opacity={pop(t - kP)}>
            <OrejaPerro x={1400} y={540} escala={1.2} />
          </g>
          <Texto x={1400} y={680} texto="45.000 HZ" tam={64} color={C.amarillo} k={t - kP - 1.2} />
          <S en={0.8} n="blip" v={0.15} />
          <S en={kP} n="blip" v={0.18} />
          <S en={kP + 1.2} n="blip_grave" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Hay sonidos en tu casa"),
    pinta: (t) => {
      const kW = R("Hay sonidos en tu casa", "Él los oye");
      return (
        <Lienzo>
          {/* la franja de lo que oyes tú y la que solo oye él */}
          <rect x={260} y={500} width={600} height={60} rx={10} fill="url(#blanco)" />
          <rect x={860} y={500} width={800} height={60} rx={10} fill="none" stroke={C.amarillo} strokeWidth={8} opacity={fade(t - kW)} />
          <Texto x={560} y={460} texto="TÚ" tam={44} k={t - 0.3} />
          <Texto x={1260} y={460} texto="SOLO ÉL" tam={44} color={C.amarillo} k={t - kW} />
          {t > kW ? <Ondas x={1260} y={680} k={t - kW} tam={0.6} color={C.amarillo} /> : null}
          <S en={kW} n="blip" v={0.18} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Oye las tuberías"),
    pinta: (t) => {
      const kC = R("Oye las tuberías", "Oye los cables");
      const kE = R("Oye las tuberías", "Oye algo");
      return (
        <Lienzo>
          {/* corte de la pared: tubería, cable y la esquina */}
          <path d="M 200 300 L 600 300 L 600 700" fill="none" stroke={C.gris} strokeWidth={40} strokeLinecap="round" />
          {t > 0.2 ? <Ondas x={620} y={500} k={t} tam={0.5} /> : null}
          <g opacity={fade(t - kC)}>
            <path d="M 800 260 C 900 400 760 520 880 720" fill="none" stroke={C.blanco} strokeWidth={10} strokeLinecap="round" />
            <path d="M 840 260 C 940 400 800 520 920 720" fill="none" stroke={C.gris} strokeWidth={10} strokeLinecap="round" />
          </g>
          <Esquina x={1500} techo={240} y={760} ancho={320} k={t - kE} />
          {t > kE ? <Ondas x={1300} y={500} k={t - kE} tam={0.6} izq /> : null}
          <S en={kE} n="latido" v={0.25} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Tú solo oyes el ladrido"),
    pinta: (t) => (
      <Lienzo>
        <CabezaGrande x={960} y={470} r={190} ojos={1} />
        <Ondas x={1260} y={420} k={t} tam={0.8} />
        <S en={0.2} n="golpe" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Cuando le mandas callar"),
    pinta: (t, f) => {
      const kS = R("Cuando le mandas callar", "se calla");
      return (
        <Lienzo suelo>
          <PersonaDePie x={480} y={800} pose="senala" />
          <Bocadillo x={600} y={430} texto="¡SHHH!" k={t - 0.2} tam={50} />
          <PerroSentado x={1240} y={800} f={f} cola={0} oreja={t > kS ? 0 : 1} cabeza={t > kS ? 18 : 0} halo={0.5} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Pero no deja de oírlo"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.3], [4, 1.4]])} cx={1100} cy={580} suelo>
        <Esquina />
        <PerroSentado {...PERRO} f={f} cola={0} oreja={1} halo={0.6} />
        <Ondas x={1200} y={500} k={t} tam={0.5} izq />
      </Lienzo>
    ),
  },
  {
    desde: E("Solo deja de avisarte"),
    pinta: (t, f) => (
      <Lienzo>
        <CaraPerro x={960} y={500} r={240} oreja={0} halo={0.7} abre={1 - parpadeo(f, 3)} mira={[0.5, 0]} />
        <S en={0.8} n="latido" v={0.3} />
      </Lienzo>
    ),
  },
  // ── regla 2 ──
  {
    desde: E("Regla número dos"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={2} titulo="SI BOSTEZA, BOSTEZA TÚ" k={t} escribeDesde={R("Regla número dos", "Si bosteza")} />,
  },
  {
    desde: E("En dos mil ocho"),
    pinta: (t) => {
      const kV = R("En dos mil ocho", "Veintiuno");
      const kN = R("En dos mil ocho", "Ninguno");
      return (
        <Lienzo>
          <TarjetaDato x={960} y={470} w={1300} h={560} fuente="BIOLOGY LETTERS · 2008" k={t}>
            {Array.from({ length: 29 }, (_, i) => {
              const on = t > kV + i * 0.05 && i < 21;
              return <circle key={i} cx={-560 + (i % 15) * 80} cy={-120 + Math.floor(i / 15) * 120} r={30} fill={on ? C.blanco : "none"} stroke={C.gris} strokeWidth={6} opacity={fade(t - 0.3 - i * 0.02)} />;
            })}
            <Texto x={0} y={180} texto={t > kV ? "21 DE 29 BOSTEZARON" : "29 PERROS"} tam={60} k={t - 0.3} />
          </TarjetaDato>
          <Sello x={1420} y={260} texto="COMPROBADO" color={C.verde} k={t - kN} />
          <S en={kV} n="blip" v={0.18} />
          <S en={kN} n="impacto" v={0.3} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Tu perro te mira a la cara"),
    pinta: (t, f) => {
      const kB = R("Tu perro te mira a la cara", "Bosteza");
      return (
        <Lienzo>
          <CaraPerro x={960} y={500} r={240} halo={0.6} boca={kf(t, [[kB, 0], [kB + 0.4, 1], [kB + 1.6, 1], [kB + 2.0, 0]])} abre={kf(t, [[kB, 1], [kB + 0.4, 0.3], [kB + 1.6, 0.3], [kB + 2, 1]])} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Espera"),
    pinta: (t, f) => (
      <Lienzo>
        <CaraPerro x={700} y={500} r={200} halo={0.7} abre={1 - parpadeo(f, 4)} mira={[0.6, 0]} />
        <CabezaGrande x={1380} y={480} r={170} ojos={1} cuello={false} />
        <Texto x={1380} y={760} texto="?" tam={60} color={C.gris} k={t - 0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Si tú bostezas"),
    pinta: (t) => {
      const kO = R("Si tú bostezas", "todo está");
      return (
        <Lienzo>
          <CabezaGrande x={960} y={480} r={200} ojos={kf(t, [[0.2, 1], [0.5, 0.2], [1.4, 0.2], [1.7, 1]])} />
          <ellipse cx={960} cy={600} rx={50} ry={kf(t, [[0.2, 0], [0.5, 50], [1.4, 50], [1.7, 0]])} fill={C.negro} />
          <Tick x={1340} y={300} k={t - kO} tam={110} />
          <S en={kO} n="blip" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Está comprobando algo"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.1]])} cx={960} cy={500}>
        <CaraPerro x={960} y={500} r={260} halo={0.9} />
        <S en={0.4} n="latido" v={0.35} />
      </Lienzo>
    ),
  },
  // ── regla 3 ──
  {
    desde: E("Regla número tres"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={3} titulo="NO LE PREGUNTES QUÉ HA HECHO" k={t} escribeDesde={R("Regla número tres", "No le preguntes")} />,
  },
  {
    desde: E("Conoces esa cara"),
    pinta: (t, f) => {
      const kO = R("Conoces esa cara", "Las orejas");
      const kC = R("Conoces esa cara", "La cabeza baja");
      const kJ = R("Conoces esa cara", "Los ojos");
      return (
        <Lienzo>
          <g transform={`translate(0 ${kf(t, [[kC, 0], [kC + 0.5, 40]])})`}>
            <CaraPerro x={960} y={500} r={240} halo={0.6} oreja={kf(t, [[kO, 0], [kO + 0.4, 0.8]])} mira={t > kJ ? [0, -0.8] : [0, 0]} abre={t > kJ ? 0.7 : 1} />
          </g>
        </Lienzo>
      );
    },
  },
  {
    desde: E("Tú lo llamas culpa"),
    pinta: (t) => (
      <Lienzo>
        <g transform="translate(0 40)">
          <CaraPerro x={760} y={500} r={200} halo={0.6} oreja={0.8} mira={[0, -0.8]} abre={0.7} />
        </g>
        <Texto x={1440} y={520} texto="CULPA" tam={110} peso={900} k={t - 0.4} />
        <S en={0.4} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("En dos mil nueve"),
    pinta: (t, f) => {
      const kG = R("En dos mil nueve", "Les dejó");
      const kE = R("En dos mil nueve", "Luego engañó");
      return (
        <Lienzo suelo>
          <TarjetaDato x={960} y={300} w={980} h={220} fuente="BEHAVIOURAL PROCESSES · 2009" k={t}>
            <Texto x={0} y={24} texto="14 PERROS" tam={80} peso={900} k={t - 0.3} />
          </TarjetaDato>
          <PerroSentado x={700} y={800} f={f} cola={1} halo={0.4} escala={0.8} />
          <g opacity={pop(t - kG)}>
            <circle cx={1000} cy={780} r={22} fill="url(#blanco)" />
            <Cruz x={1000} y={720} k={t - kG - 0.5} tam={60} />
          </g>
          {t > kE ? <PersonaDePie x={1400} y={800} pose="quieto" haciaIzquierda /> : null}
          <S en={kG} n="blip" v={0.15} />
          <S en={kE} n="blip" v={0.15} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("A algunos perros"),
    pinta: (t, f) => {
      const kN = R("A algunos perros", "sin haber");
      return (
        <Lienzo suelo>
          <PersonaDePie x={1300} y={800} pose="senala" haciaIzquierda />
          <Bocadillo x={1160} y={420} texto="¿QUÉ HAS HECHO?" k={t - 0.2} haciaIzquierda tam={40} />
          <PerroSentado x={700} y={800} f={f} cola={0} oreja={0.8} cabeza={14} halo={0.4} escala={0.8} />
          {/* la golosina sigue ahí: no se la comió */}
          <circle cx={1000} cy={780} r={22} fill="url(#blanco)" />
          <Tick x={1000} y={700} k={t - kN} tam={60} />
          <S en={kN} n="blip" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Esos pusieron la cara"),
    pinta: (t) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.06]])} cx={960} cy={500}>
        <g transform="translate(0 50)">
          <CaraPerro x={960} y={480} r={250} halo={0.6} oreja={1} mira={[0, -0.9]} abre={0.6} />
        </g>
        <Sello x={1500} y={260} texto="LA MÁS CULPABLE" k={t - 1.2} />
        <S en={1.2} n="impacto" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("La cara no dice"),
    pinta: (t) => {
      const kT = R("La cara no dice", "Dice lo que has hecho");
      return (
        <Lienzo>
          <g transform="translate(0 30)">
            <CaraPerro x={600} y={480} r={190} halo={0.6} oreja={0.8} mira={[0, -0.8]} abre={0.7} />
          </g>
          <g opacity={fade(t - kT)}>
            <CabezaGrande x={1360} y={460} r={170} ojos={1} cuello={false} />
            <Texto x={1360} y={300} texto="TÚ" tam={60} color={C.amarillo} />
          </g>
        </Lienzo>
      );
    },
  },
  {
    desde: E("Es tu cara, devuelta"),
    pinta: (t) => (
      <Lienzo>
        {/* la cara del perro, de frente, como un espejo */}
        <g transform="translate(0 30)">
          <CaraPerro x={960} y={480} r={250} halo={0.8} oreja={0.8} mira={[0, -0.6]} abre={0.8} />
        </g>
        <S en={0.6} n="latido" v={0.3} />
      </Lienzo>
    ),
  },
];
