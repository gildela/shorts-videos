# Lote variado de guiones (2026-11-15)

Propuesta para que rafa la revise. **No están en la cola ni producidos ni programados.** Cuando rafa dé el OK, se pasan a `skill-cartoon/cola-guiones.jsonl` con esas fechas.

Objetivo (rafa, 15 nov): variar estructuras para que el canal no sea monótono y poder monetizar. 15 guiones en 7 familias, ordenados para que nunca salgan dos de la misma familia seguidos.

## Familias

- **F1** · Trato con trampa (Severance)
- **F2** · Escalera sarcástica de días («¿Qué pasaría si…?»)
- **F3** · ¿Sabías que…? Envíaselo a…
- **F4** · ¿Te imaginas que…? (escalera absurda)
- **F5** · Dilema desde el segundo 1
- **F6** · Tipos de personas cuando…
- **F8** · Reglas no escritas (nueva, en prueba)

## Calendario sugerido (después del experimento, que acaba el 17)

| N.º | Guion | Familia | Fecha y hora | Duración | Pantalla fotograma 1 |
|---|---|---|---|---|---|
| 05 | [sabias-pepino](05-sabias-pepino.md) | F3 | 2026-11-18 10:00 | 30-33 s | ¿EL PEPINO ES FRUTA? |
| 11 | [aceptarias-jefe-mente](11-aceptarias-jefe-mente.md) | F1 | 2026-11-18 12:00 | 74-81 s | ¿EL DOBLE POR ESTO? |
| 01 | [calla-boca](01-calla-boca.md) | F2 | 2026-11-18 14:00 | 64-70 s | ¿Y SI TE CALLARAS? |
| 12 | [tipos-cuenta-cena](12-tipos-cuenta-cena.md) | F6 | 2026-11-18 16:00 | 47-51 s | ¿CUÁL ERES TÚ? |
| 06 | [sabias-embrion](06-sabias-embrion.md) | F3 | 2026-11-18 18:00 | 25-27 s | LO PRIMERO QUE SE TE FORMÓ |
| 02 | [movil-cajon](02-movil-cajon.md) | F2 | 2026-11-19 10:00 | 53-58 s | ¿UNA SEMANA SIN MÓVIL? |
| 07 | [sabias-almeja](07-sabias-almeja.md) | F3 | 2026-11-19 12:00 | 26-29 s | 507 AÑOS |
| 10 | [firmarias-ex](10-firmarias-ex.md) | F1 | 2026-11-19 14:00 | 70-77 s | ¿100.000 € POR ESTO? |
| 13 | [reglas-piso-compartido](13-reglas-piso-compartido.md) | F8 | 2026-11-19 16:00 | 46-51 s | LA 4 LA HAS ROTO |
| 03 | [colega-correa](03-colega-correa.md) | F4 | 2026-11-19 18:00 | 62-68 s | ¿Y SI NO TUVIERA CORREA? |
| 08 | [sabias-gallina](08-sabias-gallina.md) | F3 | 2026-11-20 10:00 | 24-26 s | ¿Y EL GALLO? |
| 04 | [dormir-once](04-dormir-once.md) | F2 | 2026-11-20 12:00 | 52-57 s | ¿DORMIR A LAS 11? |
| 14 | [madre-o-jefe](14-madre-o-jefe.md) | F5 | 2026-11-20 14:00 | 58-64 s | ¿TU MADRE O TU JEFE? |
| 09 | [sabias-platano](09-sabias-platano.md) | F3 | 2026-11-20 16:00 | 28-30 s | EL PLÁTANO ES RADIACTIVO |
| 15 | [aceptarias-suegra-llave](15-aceptarias-suegra-llave.md) | F1 | 2026-11-20 18:00 | 62-68 s | ¿ALQUILER GRATIS POR ESTO? |


## Reglas que cumplen

- Castellano de España, sarcástico, coloquial, palabrotas moderadas; estilo PLANO; sin «Fuente:», sin emojis, sin cuenta atrás.
- Ninguno termina con «ya ves lo que valías», «de nada» ni «gracias a ti» (comprobado automáticamente).
- Códigos de familia = catálogo `shorts/evolucion-guiones/familias-formato.md` (F1-F6 y F8 nueva «Reglas no escritas», en prueba). Reglas de variedad del catálogo cumplidas: 3-5 familias por día, ninguna más de 2 veces ni en slots seguidos, cada día uno ≤ 35 s y uno ≥ 60 s, mismo CTA como mucho 2 veces al día.
- F2: escalera por días con consecuencias absurdas y épicas, trampa final que señala al espectador y CTA guardar o comentar + pregunta. Aquí se permite «Día 1, Día 2…» en voz porque es el formato que pidió rafa.
- F3: dato real, contado en serio; el guiño va SOLO en a quién se lo mandas y no se explica. Sin palabras explícitas. Los datos están comprobados (pepino = baya, 95 % agua; Tiberio en Plinio; embrión deuteróstomo; almeja Ming, 507 años, nacida en 1499; gallinas ~300 huevos/año sin gallo; potasio-40 del plátano y «dosis equivalente a un plátano»).
- F1: esqueleto Severance de la regla 1 (gancho-pregunta → mecanismo → lado bueno → «¿Cuál es la trampa?» → escalera → remate → «Guárdate el vídeo y dime: A o B»).
- `cola-propuesta.jsonl`: las 15 líneas listas para añadir a la cola (con `"familia"` y `"usado": null`) cuando rafa dé el OK.
- El 03 (correa, F4) empieza por «¿Te imaginas…?», que está reservado al experimento hasta que rafa decida; por eso va el 19, después del experimento.
