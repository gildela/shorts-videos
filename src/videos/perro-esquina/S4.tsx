// Bloque 4: regla seis (las tres y cuatro), la siete clasificada, el giro «El sujeto», la siete de verdad, el cierre,
// el CTA final y «Buen chico».
import React from "react";
import { C } from "../../estilos/archivo/estilo";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { Dormitorio, Mesa, Pasillo, Puerta, RelojDigital } from "../../estilos/archivo/piezas/Casa";
import { CamaPerro, CaraPerro, Ondas, OjosPerro, PerroAnda, PerroSentado, PerroTumbado } from "../../estilos/archivo/piezas/Perro";
import { CabezaGrande, Empleado, PersonaCama, PersonaDePie } from "../../estilos/archivo/piezas/Persona";
import { Cruz, EtiquetaTu, FilaCasillas, LogoNegociado, PantallaCTA, TarjetaRegla, Texto, Tick } from "../../estilos/archivo/piezas/Interfaz";
import { FichaSujeto, PantallaFinal, Recorte } from "../../estilos/archivo/piezas/Archivo";
import { parpadeo } from "../../estilos/archivo/piezas/Gato";
import { CABEZA, E, ESQUINA_X, Esquina, PERRO, R } from "./comun";

// la regla siete se dice tres veces: la clasificada, «encima de la regla siete» y la de verdad
const SIETE = () => E("Regla número siete");
const SIETE_VERDAD = () => E("Regla número siete", E("Este archivo no va"));

export const PLANOS_S4: Plano[] = [
  // ── regla 6 ──
  {
    desde: E("Regla número seis"),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={6} titulo="A LAS 3:04, NO LE SIGAS" k={t} escribeDesde={R("Regla número seis", "A las tres")} />,
  },
  {
    desde: E("Se levantará de su cama"),
    pinta: (t, f) => {
      const kU = 0.4;
      return (
        <Lienzo suelo>
          <CamaPerro x={700} y={800} />
          {t < kU ? <PerroTumbado x={700} y={780} f={f} escala={0.8} halo={0.4} /> : <PerroSentado x={700} y={800} f={f} cola={0} oreja={1} halo={0.5} escala={0.85} />}
          <RelojDigital x={1400} y={400} hora="03:04" escala={0.8} rojo />
          <S en={kU} n="blip" v={0.15} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Cruzará el pasillo"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Pasillo />
        <PerroAnda x={kf(t, [[0, 300], [2.4, 820]])} y={800} f={f} fase={(t * 1.3) % 1} anda={t < 2.4} cola={0} escala={0.8} />
      </Lienzo>
    ),
  },
  {
    desde: E("Se sentará delante de la esquina"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.2], [6, 1.32]])} cx={1100} cy={600} suelo>
        <Esquina />
        <PerroSentado {...PERRO} f={f} cola={0} oreja={t > R("Se sentará delante de la esquina", "Las orejas") ? 1 : 0} halo={0.6} />
      </Lienzo>
    ),
  },
  {
    desde: E("No ladrará"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.04]])} cx={960} cy={520}>
        <OjosPerro x={960} y={480} r={60} halo={1} abre={1 - parpadeo(f, 7)} />
        <S en={R("No ladrará", "Esperará")} n="latido" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("Luego volverá"),
    pinta: (t, f) => {
      const kP = R("Luego volverá", "Se tumbará en la puerta");
      return (
        <Lienzo suelo>
          <Puerta x={960} y={800} w={300} h={520} abierta={0.3} />
          {t < kP ? (
            <PerroAnda x={kf(t, [[0, 1600], [kP, 1200]])} y={800} f={f} fase={(t * 1.3) % 1} haciaIzquierda cola={0} escala={0.7} />
          ) : (
            <PerroTumbado x={960} y={800} f={f} escala={0.75} halo={0.5} oreja={1} haciaIzquierda />
          )}
        </Lienzo>
      );
    },
  },
  {
    desde: E("Mirando hacia fuera"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={900} cy={560} suelo>
        <Dormitorio ventana={false}>
          <PersonaCama {...CABEZA} ojos={0} respira={Math.sin(f / 22) * 3} />
        </Dormitorio>
        <PerroTumbado x={1640} y={800} f={f} escala={0.6} halo={0.5} oreja={1} />
        <Texto x={1640} y={540} texto="→" tam={80} color={C.gris} k={t - 0.5} />
      </Lienzo>
    ),
  },
  // ── regla 7 clasificada ──
  {
    desde: SIETE(),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={7} titulo="" k={t} />,
  },
  {
    desde: E("Está tumbado encima"),
    pinta: (t, f) => (
      <Lienzo>
        <rect x={560} y={330} width={800} height={300} rx={10} fill="none" stroke={C.gris} strokeWidth={10} />
        <Texto x={960} y={420} texto="REGLA 7" tam={60} color={C.gris} />
        <PerroTumbado x={960} y={620} f={f} escala={0.9} halo={0.4} cabezaBaja />
      </Lienzo>
    ),
  },
  {
    desde: E("Gracias"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 018" />
        <Empleado x={960} y={560} />
      </Lienzo>
    ),
  },
  {
    desde: E("Seis reglas"),
    pinta: (t) => (
      <Lienzo>
        <FilaCasillas x={960} y={520} marcadas={6} k={1} kMarca={1} tam={104} ultimaInterrogante={t > R("Seis reglas", "Alguien sí")} />
        <S en={R("Seis reglas", "Alguien sí")} n="impacto" v={0.3} />
      </Lienzo>
    ),
  },
  // ── el sujeto ──
  {
    desde: E("Este archivo no va"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.06]])} cx={1100} cy={520}>
        <Esquina />
        <Cruz x={ESQUINA_X} y={480} k={t - 1.3} tam={260} />
        <S en={1.3} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Sujeto"),
    pinta: (t) => {
      const kV = R("Sujeto", "Duerme ocho");
      return (
        <Lienzo>
          <FichaSujeto x={960} y={500} archivo="018" valor="UN HUMANO ADULTO" k={t} />
          <S en={0.3} n="tecla" v={0.2} />
          <S en={kV} n="blip" v={0.15} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Para un perro, eres"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3, 1.05]])} cx={900} cy={560} suelo>
        <Dormitorio ventana={false}>
          <PersonaCama {...CABEZA} ojos={0} respira={Math.sin(f / 22) * 3} />
        </Dormitorio>
        <EtiquetaTu x={CABEZA.x} y={300} k={t - 0.4} f={f} />
      </Lienzo>
    ),
  },
  {
    desde: E("Así que cada noche hace guardia"),
    pinta: (t, f) => {
      const kB = R("Así que cada noche hace guardia", "El bostezo");
      const kN = R("Así que cada noche hace guardia", "La nariz");
      const kP = R("Así que cada noche hace guardia", "La puerta");
      return (
        <Lienzo>
          <PerroSentado x={500} y={700} f={f} cola={0} oreja={1} halo={0.6} escala={0.9} />
          {[
            ["BOSTEZO", kB],
            ["NARIZ", kN],
            ["PUERTA", kP],
          ].map(([txt, k], i) => (
            <g key={i}>
              <Tick x={1000} y={300 + i * 160} k={t - (k as number)} tam={70} />
              <Texto x={1100} y={320 + i * 160} texto={txt as string} tam={56} ancla="start" k={t - (k as number)} />
            </g>
          ))}
          {[kB, kN, kP].map((k, i) => (
            <S key={i} en={k} n="blip" v={0.18} />
          ))}
        </Lienzo>
      );
    },
  },
  {
    desde: E("Está entre la esquina y tú"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={960} cy={540} suelo>
        <Esquina x={1600} ancho={360} />
        <PerroSentado x={1100} y={800} f={f} cola={0} oreja={1} halo={0.7} />
        <PersonaDePie x={380} y={800} pose="quieto" />
        <EtiquetaTu x={380} y={440} k={t - 0.4} f={f} />
      </Lienzo>
    ),
  },
  {
    desde: E("Esta noche ha oído algo"),
    pinta: (t, f) => {
      const kA = R("Esta noche ha oído algo", "Te ha avisado");
      const kC = R("Esta noche ha oído algo", "Le has mandado callar");
      return (
        <Lienzo suelo>
          <Esquina x={1600} ancho={360} />
          <PerroSentado x={1100} y={800} f={f} cola={0} oreja={t > kC ? 0 : 1} cabeza={t > kC ? 18 : 0} halo={0.7} />
          {t > kA && t < kC ? <Ondas x={1300} y={480} k={t - kA} tam={0.6} /> : null}
          {t > kA && t < kC ? <S en={0} n="golpe" v={0.3} /> : null}
          <Cruz x={1300} y={480} k={t - kC - 0.6} tam={140} />
          <S en={kC + 0.6} n="blip_grave" v={0.3} />
        </Lienzo>
      );
    },
  },
  // ── la regla siete de verdad ──
  {
    desde: SIETE_VERDAD(),
    entra: "glitch",
    pinta: (t) => <TarjetaRegla n={7} titulo="PONTE DETRÁS DE ÉL" k={t} escribeDesde={E("Ponte detrás", SIETE_VERDAD()) - SIETE_VERDAD()} />,
  },
  {
    desde: E("Es el único sitio seguro"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.05]])} cx={960} cy={540} suelo>
        <Esquina x={1600} ancho={360} />
        <PerroSentado x={1100} y={800} f={f} cola={0} oreja={1} halo={0.7} />
        <PersonaDePie x={760} y={800} pose="quieto" />
        <EtiquetaTu x={760} y={440} k={t - 0.3} f={f} />
      </Lienzo>
    ),
  },
  {
    desde: E("La regla ocho"),
    pinta: (t, f) => (
      <Lienzo>
        <FilaCasillas x={960} y={460} marcadas={7} n={8} k={1} kMarca={1} tam={96} ultimaInterrogante />
        <S en={0.4} n="blip_grave" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Él ya la conoce"),
    pinta: (t, f) => (
      <Lienzo>
        <CaraPerro x={960} y={500} r={240} halo={0.9} abre={1 - parpadeo(f, 9)} />
        <S en={0.5} n="latido" v={0.3} />
      </Lienzo>
    ),
  },
  // ── cierre ──
  {
    desde: E("El empleado que escribió"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 018" />
        <Empleado x={960} y={560} escribe={1} />
        <PerroTumbado x={1560} y={800} f={f} escala={0.6} halo={0.4} cabezaBaja />
      </Lienzo>
    ),
  },
  {
    desde: E("Una noche de marzo"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Pasillo />
        <PerroTumbado x={960} y={800} f={f} escala={0.7} halo={0.4} oreja={1} />
        <RelojDigital x={960} y={260} hora="03:04" escala={0.7} />
      </Lienzo>
    ),
  },
  {
    desde: E("A la mañana siguiente"),
    pinta: (t) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 018" />
        <Texto x={960} y={420} texto="VACANTE" tam={60} color={C.gris} k={t - 1.2} />
        <S en={1.2} n="blip_grave" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("El perro sigue tumbado"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [5, 1.06]])} cx={960} cy={560} suelo>
        <Puerta x={960} y={800} w={300} h={520} />
        <PerroTumbado x={960} y={800} f={f} escala={0.75} halo={0.5} oreja={0} haciaIzquierda />
      </Lienzo>
    ),
  },
  {
    desde: E("todavía levanta las orejas"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.3], [3, 1.36]])} cx={960} cy={600} suelo>
        <Puerta x={960} y={800} w={300} h={520} />
        <PerroTumbado x={960} y={800} f={f} escala={0.75} halo={0.7} oreja={kf(t, [[0.6, 0], [0.9, 1]])} haciaIzquierda />
        <RelojDigital x={960} y={420} hora="03:04" escala={0.5} rojo />
        <S en={0.6} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("Nosotros no escribimos"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo>
        <LogoNegociado x={960} y={480} r={140} texto k={t} />
      </Lienzo>
    ),
  },
  {
    desde: E("Gracias por su cooperación"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <Mesa x={880} y={800} carpeta="ARCHIVO 018" />
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
        comenta="¿A QUÉ LE LADRA TU PERRO DE NOCHE?"
        kComenta={R("Queda un trámite", "cuéntanos en los comentarios")}
        siguiente="SIGUIENTE ARCHIVO: 019"
        kSiguiente={R("Queda un trámite", "El próximo archivo")}
      />
    ),
  },
  { desde: E("Buen chico", E("Queda un trámite")), pinta: (t) => <PantallaFinal texto="BUEN CHICO." k={t} /> },
];
