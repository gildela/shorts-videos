// Bloque 1: el gancho (tres y cuatro, los pasos), la presentación del archivo 021 y la primera consulta (la hora).
import React from "react";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { DormitorioTecho, Puerta, Techo, TECHO, RelojDigital } from "../../estilos/archivo/piezas/Casa";
import { PersonaCama } from "../../estilos/archivo/piezas/Persona";
import { Pasos, Raton } from "../../estilos/archivo/piezas/Objetos";
import { Cruz, TarjetaPregunta, TarjetaRegla, TarjetaTitulo, Texto } from "../../estilos/archivo/piezas/Interfaz";
import { CABEZA, E, PUERTA, R, SOBRE_TECHO } from "./comun";

export const PLANOS_S1: Plano[] = [
  {
    desde: 0,
    entra: "negro",
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [3.5, 1.05]])} cx={960} cy={560} suelo>
        <DormitorioTecho reloj="03:04">
          <PersonaCama {...CABEZA} ojos={0} respira={Math.sin(f / 22) * 3} />
        </DormitorioTecho>
        <Puerta {...PUERTA} hueco />
        {t > E("tres") - 0.1 ? <RelojDigital x={1450} y={430} hora="03:04" escala={0.8 * pop(t - E("tres") + 0.1)} /> : null}
        <S en={E("tres")} n="blip_grave" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("algo camina"),
    entra: "glitch",
    pinta: (t, f) => (
      <Lienzo suelo={TECHO + 610}>
        <Techo />
        <Pasos x={820} y={SOBRE_TECHO} n={4} sep={120} cada={0.55} k={t - 0.2} escala={1.2} />
        <PersonaCama {...CABEZA} ojos={kf(t, [[0.8, 0], [1.6, 1]])} respira={Math.sin(f / 22) * 3} />
        <S en={0.6} n="tecla" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("Son pasos"),
    pinta: (t) => {
      const kP = R("Son pasos", "Se paran");
      return (
        <Lienzo zoom={kf(t, [[0, 1.2], [4, 1.3]])} cx={820} cy={300} >
          <Techo />
          <Pasos x={600} y={SOBRE_TECHO} n={6} sep={150} cada={0.22} k={t} escala={1.3} />
          <S en={0.1} n="tecla" v={0.2} />
          <S en={kP} n="impacto" v={0.2} />
        </Lienzo>
      );
    },
  },
  {
    desde: E("Si esto te ha pasado"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [5, 1.04]])} cx={960} cy={560} suelo>
        <DormitorioTecho reloj="03:04">
          <PersonaCama {...CABEZA} ojos={1} respira={Math.sin(f / 22) * 3} />
        </DormitorioTecho>
        <Pasos x={600} y={SOBRE_TECHO} n={6} sep={150} k={99} escala={1.3} />
        <Techo />
      </Lienzo>
    ),
  },
  {
    desde: E("Archivo cero veintiuno"),
    entra: "corte",
    pinta: (t) => <TarjetaTitulo grande="ARCHIVO 021" pequeno="PASOS EN EL TECHO" k={t} />,
  },
  {
    desde: E("Antes de empezar"),
    pinta: (t) => (
      <TarjetaPregunta
        pregunta="¿A QUÉ HORA EMPIEZAN?"
        k={t}
        escribeDesde={R("Antes de empezar", "A qué hora")}
        pie="ESCRIBE LA HORA EN LOS COMENTARIOS"
      />
    ),
  },
  {
    desde: E("Regla número uno"),
    pinta: (t) => <TarjetaRegla n={1} titulo="NO SUBAS A MIRAR" k={t} escribeDesde={R("Regla número uno", "No subas a mirar")} />,
  },
  {
    desde: E("Lo que camina encima"),
    pinta: (t) => (
      <Lienzo suelo={TECHO + 610}>
        <Techo />
        <Raton x={960} y={SOBRE_TECHO - 52} escala={1.4} k={t} />
        <Texto x={960} y={380} texto="15 gramos" tam={90} k={fade(t, 0.8)} />
        <S en={0.5} n="clic" v={0.25} />
      </Lienzo>
    ),
  },
  {
    desde: E("Los ratones viven de noche"),
    pinta: (t) => (
      <Lienzo suelo={TECHO + 610}>
        <Techo />
        <Raton x={320 + t * 130} y={SOBRE_TECHO - 52} escala={1.2} k={t} />
        <Texto x={960} y={420} texto="entran en las casas en otoño" tam={62} />
      </Lienzo>
    ),
  },
  {
    desde: E("Si subes, no lo verás"),
    pinta: (t, f) => (
      <Lienzo zoom={kf(t, [[0, 1.0], [4, 1.1]])} cx={1050} cy={420}>
        <Techo />
        <Raton x={960} y={SOBRE_TECHO - 52} escala={1.4} />
        <PersonaCama {...CABEZA} ojos={1} respira={Math.sin(f / 22) * 3} />
        <Texto x={960} y={230} texto="4,5 metros" tam={48} k={fade(t - 1, 0.5)} />
      </Lienzo>
    ),
  },
];
