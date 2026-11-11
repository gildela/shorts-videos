// Bloque 2: la regla dos (los agujeros del grosor de un lápiz), la regla tres (no contarlos) y la ficha de las voces.
import React from "react";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { CorteParedes } from "../../estilos/archivo/piezas/Casa";
import { Raton, Lapiz, Cota, Agujero } from "../../estilos/archivo/piezas/Objetos";
import { Ondas } from "../../estilos/archivo/piezas/Perro";
import { Sello, TarjetaDato, TarjetaRegla, Texto } from "../../estilos/archivo/piezas/Interfaz";
import { E, R } from "./comun";

export const PLANOS_S2: Plano[] = [
  {
    desde: E("Regla número dos"),
    pinta: (t) => <TarjetaRegla n={2} titulo="BUSCA LOS AGUJEROS" k={t} escribeDesde={R("Regla número dos", "Busca los agujeros")} />,
  },
  {
    desde: E("Un ratón cabe por un hueco"),
    pinta: (t) => (
      <Lienzo>
        <Agujero x={860} y={520} r={70} k={pop(t)} />
        <Lapiz x={1080} y={520} largo={560} grosor={64} k={pop(t - 0.3)} />
        <Cota x={860} y={720} largo={140} texto="6 MM" k={t - 0.6} horizontal />
        <S en={0.2} n="blip" v={0.2} />
      </Lienzo>
    ),
  },
  {
    desde: E("Tu casa tiene muchos"),
    pinta: (t) => (
      <Lienzo>
        <CorteParedes ancho={1260} alto={520}>
          <Agujero x={330} y={480} r={26} k={pop(t - 0.2)} />
          <Agujero x={1590} y={640} r={26} k={pop(t - 0.5)} />
          <Agujero x={960} y={300} r={26} k={pop(t - 0.8)} />
        </CorteParedes>
        <Texto x={960} y={950} texto="tuberías · bajo las tejas · rejilla del desván" tam={44} k={fade(t - 1, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("Rellénalos con lana"),
    pinta: (t) => (
      <Lienzo>
        <CorteParedes ancho={1260} alto={520}>
          <Agujero x={330} y={480} r={26} />
          <Agujero x={1590} y={640} r={26} />
          <Agujero x={960} y={300} r={26} />
        </CorteParedes>
        <Texto x={960} y={260} texto="lana de acero" tam={80} k={fade(t, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("Tápalos todos"),
    pinta: (t) => (
      <Lienzo>
        <CorteParedes ancho={1260} alto={520}>
          <Agujero x={330} y={480} r={26} />
          <Agujero x={1590} y={640} r={26} />
          <Agujero x={960} y={300} r={26} />
        </CorteParedes>
        <Sello x={330} y={480} texto="TAPADO" k={pop(t - 0.3)} tam={0.7} />
        <Sello x={1590} y={640} texto="TAPADO" k={pop(t - 0.6)} tam={0.7} />
        <Sello x={960} y={300} texto="TAPADO" k={pop(t - 0.9)} tam={0.7} />
        <S en={0.3} n="golpe" v={0.3} />
      </Lienzo>
    ),
  },
  {
    desde: E("Regla número tres"),
    pinta: (t) => <TarjetaRegla n={3} titulo="NO INTENTES CONTARLOS" k={t} escribeDesde={R("Regla número tres", "No intentes contarlos")} />,
  },
  {
    desde: E("Lo has intentado"),
    pinta: (t, f) => (
      <Lienzo>
        <Raton x={420} y={600} escala={1.2} k={t} />
        <Raton x={960} y={600} escala={1.2} haciaIzquierda k={t - 0.3} />
        <Raton x={1500} y={600} escala={1.2} k={t - 0.6} />
        <Texto x={960} y={300} texto="uno · dos · uno que corre" tam={70} k={fade(t - 0.5, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("Una hembra puede"),
    pinta: (t) => (
      <Lienzo>
        <TarjetaDato x={960} y={460} w={1400} h={520} fuente="UC IPM · PEST NOTES 7483 · 2025" k={t}>
          <Texto x={0} y={-120} texto="5 A 10 CAMADAS AL AÑO" tam={64} peso={900} k={t - 0.3} />
          <Texto x={0} y={-10} texto="5 O 6 CRÍAS CADA UNA" tam={56} k={t - 1.4} />
          <Texto x={0} y={100} texto="MADURAN A LAS 6 SEMANAS" tam={56} k={t - 2.6} />
        </TarjetaDato>
      </Lienzo>
    ),
  },
  {
    desde: E("Si un día contaste uno"),
    pinta: (t) => (
      <Lienzo>
        {Array.from({ length: 6 }, (_, i) => (
          <Raton key={i} x={260 + i * 280} y={560 + (i % 2) * 40} escala={0.9} haciaIzquierda={i % 2 === 1} k={t - i * 0.25} />
        ))}
        <Texto x={960} y={300} texto="ya no es uno" tam={80} k={fade(t - 1.2, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("Dos mil cinco"),
    pinta: (t, f) => (
      <Lienzo>
        <TarjetaDato x={960} y={440} w={1500} h={560} fuente="PLOS BIOLOGY · 2005 · UNIVERSIDAD DE WASHINGTON" k={t}>
          <Ondas x={0} y={60} n={5} k={t - 0.8} tam={1.4} />
          <Texto x={0} y={-150} texto="ratones machos · canciones" tam={60} peso={900} k={t - 0.3} />
        </TarjetaDato>
        <S en={0.5} n="estatica" v={0.12} />
      </Lienzo>
    ),
  },
  {
    desde: E("Cantan entre treinta mil"),
    pinta: (t) => (
      <Lienzo>
        <Texto x={960} y={440} texto="30.000 A 110.000 HZ" tam={120} peso={900} k={t} />
        <Texto x={960} y={640} texto="tu oído llega a unos 20.000" tam={56} k={fade(t - 1.2, 0.5)} />
      </Lienzo>
    ),
  },
];
