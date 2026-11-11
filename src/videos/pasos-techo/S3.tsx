// Bloque 3: la consulta (¿arriba o tejado?), las reglas cuatro a siete, el sujeto, el giro, el cierre y el CTA final.
import React from "react";
import { Lienzo, Plano, fade, kf, pop } from "../../estilos/archivo/Plano";
import { S } from "../../estilos/archivo/Sonido";
import { DormitorioTecho, Mesa, Mesilla, Nevera, Pasillo, Puerta, Techo } from "../../estilos/archivo/piezas/Casa";
import { Empleado, PersonaCama, PersonaDePie } from "../../estilos/archivo/piezas/Persona";
import { Cota, Pasos, Raton } from "../../estilos/archivo/piezas/Objetos";
import { LogoNegociado, PantallaCTA, TarjetaDato, TarjetaPregunta, TarjetaRegla, Texto } from "../../estilos/archivo/piezas/Interfaz";
import { PantallaFinal } from "../../estilos/archivo/piezas/Archivo";
import { CABEZA, E, PUERTA, R, SOBRE_TECHO } from "./comun";

const K_REGLA_7 = E("Regla número siete", E("Los pasos en el techo de alguien"));
const K_CTA = E("Queda un trámite");

export const PLANOS_S3: Plano[] = [
  {
    desde: E("El Negociado necesita confirmarlo"),
    pinta: (t) => (
      <TarjetaPregunta
        pregunta="¿QUÉ HAY ENCIMA DE TU CAMA?"
        opciones={["ARRIBA", "TEJADO"]}
        k={t}
        escribeDesde={R("El Negociado necesita confirmarlo", "encima de tu dormitorio")}
        kOpciones={R("El Negociado necesita confirmarlo", "Si hay un vecino")}
        pie="ESCRIBE «ARRIBA» O «TEJADO» EN LOS COMENTARIOS"
      />
    ),
  },
  {
    desde: E("Regla número cuatro"),
    pinta: (t) => <TarjetaRegla n={4} titulo="DUERME EN LA MISMA CAMA" k={t} escribeDesde={R("Regla número cuatro", "Duerme siempre")} />,
  },
  {
    desde: E("Dos mil dieciséis"),
    pinta: (t) => (
      <Lienzo>
        <TarjetaDato x={960} y={460} w={1500} h={520} fuente="UNIVERSIDAD BROWN · 2016 · CURRENT BIOLOGY" k={t}>
          <Texto x={0} y={-120} texto="35 VOLUNTARIOS · UNA NOCHE" tam={60} peso={900} k={t - 0.3} />
          <Texto x={0} y={-10} texto="LA MITAD IZQUIERDA NO SE DURMIÓ" tam={52} k={t - 1.8} />
          <Texto x={0} y={100} texto="SE QUEDÓ DE GUARDIA" tam={52} k={t - 3.2} />
        </TarjetaDato>
      </Lienzo>
    ),
  },
  {
    desde: E("En tu cama, tu cerebro"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <DormitorioTecho reloj="03:04" techo={190}>
          <PersonaCama {...CABEZA} ojos={0} />
        </DormitorioTecho>
        <PersonaDePie x={1400} y={800} ojos={kf(t, [[0.2, 0], [0.8, 1]])} pose="quieto" frente />
        <Texto x={960} y={300} texto="una mitad vigila el techo" tam={60} k={fade(t - 2.4, 0.5)} />
        <S en={1} n="latido" v={0.12} />
      </Lienzo>
    ),
  },
  {
    desde: E("Si los oyes en tu propia cama"),
    pinta: (t, f) => (
      <Lienzo suelo>
        <DormitorioTecho reloj="03:04" techo={190}>
          <PersonaCama {...CABEZA} ojos={1} respira={Math.sin(f / 22) * 3} />
        </DormitorioTecho>
        <Texto x={960} y={300} texto="¿qué mitad está despierta?" tam={62} k={fade(t, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("Regla número cinco"),
    pinta: (t) => <TarjetaRegla n={5} titulo="SI CRUJE, DÉJALO" k={t} escribeDesde={R("Regla número cinco", "Si cruje")} />,
  },
  {
    desde: E("No todo lo que suena"),
    pinta: (t) => (
      <Lienzo suelo={800}>
        <Techo />
        <Pasos x={960} y={SOBRE_TECHO} n={1} k={t - 0.4} escala={1.3} cada={0.5} />
        <Texto x={960} y={420} texto="madera y metal · lento · uno solo" tam={56} k={fade(t - 1, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("Los ratones no dan pasos lentos"),
    pinta: (t) => (
      <Lienzo suelo={800}>
        <Techo />
        <Pasos x={520} y={SOBRE_TECHO} n={6} sep={130} cada={0.12} k={t} escala={1.2} />
        <Texto x={960} y={420} texto="los ratones corren" tam={60} k={fade(t - 0.6, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("y luego corre"),
    pinta: (t) => (
      <Lienzo suelo={800}>
        <Techo />
        <Pasos x={380} y={SOBRE_TECHO} n={1} k={99} escala={1.3} />
        <Pasos x={720} y={SOBRE_TECHO} n={7} sep={120} cada={0.11} k={t - 0.5} escala={1.2} />
        <Texto x={960} y={420} texto="ahora sí es otra cosa" tam={60} k={fade(t - 1.6, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("Regla número seis"),
    pinta: (t) => <TarjetaRegla n={6} titulo="NO DEJES COMIDA EN LA MESILLA" k={t} escribeDesde={R("Regla número seis", "No dejes")} />,
  },
  {
    desde: E("Un ratón hace unas doscientas"),
    pinta: (t) => (
      <Lienzo suelo={800}>
        <Mesilla x={300} y={800} reloj="03:04" />
        <PersonaCama {...CABEZA} ojos={0} />
        <Cota x={420} y={760} largo={560} texto="9 METROS" k={t - 1.5} horizontal />
        <Texto x={960} y={300} texto="200 COMIDAS PEQUEÑAS POR NOCHE" tam={56} k={fade(t, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("También roe"),
    pinta: (t) => (
      <Lienzo>
        <Texto x={960} y={380} texto="cables · tuberías de gas" tam={70} k={fade(t, 0.5)} />
        <Texto x={960} y={560} texto="un mordisco, dentro de una pared" tam={44} k={fade(t - 1.5, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("No va a por ti"),
    pinta: (t) => (
      <Lienzo suelo={800}>
        <Mesilla x={1000} y={800} reloj="03:04" />
        <Raton x={1080 + Math.min(t, 2) * 80} y={748} escala={1.2} haciaIzquierda k={t} />
        <Texto x={960} y={380} texto="va a por la galleta" tam={64} k={fade(t - 1, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("Regla número siete"),
    pinta: (t, f) => (
      <Lienzo suelo={800}>
        <Mesa x={880} y={800} carpeta="ARCHIVO 021" />
        <Empleado x={960} y={560} cabeza={Math.sin(f / 30) * 1.5} escribe={t > R("Regla número siete", "Esperaremos") - 0.5 ? 1 : 0} />
      </Lienzo>
    ),
  },
  {
    desde: E("Seis reglas"),
    pinta: (t) => (
      <Lienzo>
        <Texto x={960} y={460} texto="seis reglas" tam={150} peso={900} k={pop(t)} />
        <Texto x={960} y={640} texto="nadie te las dio · alguien sí" tam={56} k={fade(t - 1.2, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("Este archivo no va sobre los ratones"),
    pinta: (t) => (
      <Lienzo suelo={800}>
        <Pasillo y={800}>
          <Puerta x={1700} y={800} hueco />
          <Nevera x={1350} y={800} />
        </Pasillo>
        <PersonaDePie x={260 + Math.min(t, 4) * 300} y={800} pose="anda" fase={t * 6} haciaIzquierda={false} />
      </Lienzo>
    ),
  },
  {
    desde: E("En España, la ley"),
    pinta: (t) => (
      <Lienzo>
        <TarjetaDato x={960} y={460} w={1500} h={460} fuente="CÓDIGO TÉCNICO DE LA EDIFICACIÓN · DB-HR" k={t}>
          <Texto x={0} y={-60} texto="65 DECIBELIOS" tam={120} peso={900} k={t - 1.2} />
          <Texto x={0} y={100} texto="el ruido de pisadas que atraviesa el suelo" tam={44} k={t - 2.6} />
        </TarjetaDato>
      </Lienzo>
    ),
  },
  {
    desde: E("Debajo de ti hay alguien"),
    pinta: (t, f) => (
      <Lienzo suelo={800}>
        <DormitorioTecho reloj="03:04" techo={190}>
          <PersonaCama {...CABEZA} ojos={1} respira={Math.sin(f / 22) * 3} />
        </DormitorioTecho>
        <Texto x={960} y={300} texto="contando" tam={80} k={fade(t - 1, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("Los pasos en el techo de alguien"),
    pinta: (t) => (
      <Lienzo suelo={800}>
        <Techo />
        <Pasos x={600} y={SOBRE_TECHO} n={5} sep={120} cada={0.5} k={t} escala={1.2} />
        <Texto x={960} y={420} texto="los pasos eres tú" tam={60} k={fade(t - 1.6, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: K_REGLA_7,
    pinta: (t) => <TarjetaRegla n={7} titulo="NO GOLPEES EL TECHO" k={t} escribeDesde={E("No golpees", K_REGLA_7) - K_REGLA_7} />,
  },
  {
    desde: E("La regla ocho"),
    pinta: (t) => (
      <Lienzo>
        <Texto x={960} y={460} texto="regla ocho: el último piso" tam={64} k={fade(t, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("El empleado que escribió"),
    pinta: (t, f) => (
      <Lienzo suelo={800}>
        <Mesa x={880} y={800} carpeta="ARCHIVO 021" />
        <Empleado x={960} y={560} cabeza={Math.sin(f / 30) * 1.5} escribe={0} />
        <Texto x={960} y={260} texto="las trampas amanecían vacías" tam={56} k={fade(t - 1.6, 0.5)} />
      </Lienzo>
    ),
  },
  {
    desde: E("Nosotros no escribimos"),
    entra: "glitch",
    pinta: (t) => (
      <Lienzo>
        <LogoNegociado x={960} y={480} r={140} texto k={t} />
      </Lienzo>
    ),
  },
  {
    desde: E("Gracias por su cooperación"),
    pinta: (t, f) => (
      <Lienzo suelo={800}>
        <Mesa x={880} y={800} carpeta="ARCHIVO 021" />
        <Empleado x={960} y={560} cabeza={Math.sin(f / 30) * 1.5} />
      </Lienzo>
    ),
  },
  // ── CTA ──
  {
    desde: K_CTA,
    entra: "glitch",
    pinta: (t) => (
      <PantallaCTA
        k={t}
        kTick={R("Queda un trámite", "suscríbete al canal")}
        comenta="¿QUÉ SE OYE EN TU TECHO DE NOCHE?"
        kComenta={R("Queda un trámite", "cuéntanos en los comentarios")}
        siguiente="SIGUIENTE ARCHIVO: 022"
        kSiguiente={R("Queda un trámite", "El próximo archivo")}
      />
    ),
  },
  { desde: E("Escucha", K_CTA), pinta: (t) => <PantallaFinal texto="ESCUCHA." k={t} /> },
];
