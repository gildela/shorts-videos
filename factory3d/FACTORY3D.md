# FÁBRICA 3D: el único motor de los Shorts diarios (rafa 2026-11-06)

TODOS los Shorts son renders 3D: personajes cartoon 3D (cabeza grande, ojos expresivos, sudadera verde = «tú»), escenarios con luz cálida y sombras, cámara que se mueve, imagen nueva cada ~2 s. La fábrica de emojis (Toon Lote, shorts/factory) está PROHIBIDA y bloqueada: su make.sh falla a propósito. qa.py de esta fábrica rechaza cualquier emoji.

Claude solo escribe `script.json` (uno por Short). Los scripts hacen todo lo demás (voz Kokoro em_alex gratis, subtítulos, render three.js en Chrome sin GPU, sonido, MP4). No leas ni toques el código del motor.

## Preparación (una vez por contenedor)
    cp -r /mnt/project-files/shorts/factory3d ~/factory3d
    [ -x ~/.faceless-shorts/venv/bin/python ] || bash <SKILL faceless-shorts>/scripts/setup.sh   # que falle Whisper es normal

## Montaje
    mkdir -p ~/factory3d/runs/<fecha>/<slug>          (un script.json en cada una)
    bash ~/factory3d/bin/batch.sh ~/factory3d/runs/<fecha> ~/factory3d/out/<fecha>
~8 min por Short de 55 s (5 Shorts ≈ 40 min). `batch.log`: `OK slug 52.1s 25MB` o `FAIL slug at: <paso>`. Si falla, mira las últimas líneas de `out/<fecha>/<slug>/make.log` (qa dice qué arreglar), corrige script.json y repite solo ese: `bash ~/factory3d/bin/make.sh ~/factory3d/runs/<fecha>/<slug> ~/factory3d/out/<fecha>/<slug>`.
Salida: `<slug>.mp4`, `cover.jpg` (fotograma de 1,5 s), `sheet.jpg` (un fotograma cada 2 s). QA visual: mira SOLO sheet.jpg.
Si un Short no sale bien después de 2 intentos, NO lo publiques (ni lo hagas con emojis): publica los que sí salieron.

## script.json
    { "title": "Un oso te pilla en el camping #shorts", "voice": "em_alex", "speed": 1.05, "lead": 0.4, "outro": 0.9, "gap": 0.28,
      "music": "tension", "sources": ["NPS: Bear safety"],
      "genes": { "cat": "survival", "hook": "imagine", "pattern": "3d-hook-protocol-loop", "len": "long", "viral": "Vnn", "lang": "es" },
      "lines": [ { "text": "Imagina que un oso te pilla en el camping.",
                   "caps": "*Imagina que un | oso te *pilla | en el *camping.",
                   "shot": { "set": "camping", "cam": "medium", "hud": "DÍA 2 · 07:15 · CAMPING",
                             "who": [ {"c": "tu", "act": "hold", "hold": "salchicha"}, {"c": "oso", "act": "roar", "enter": true} ], "fx": "shake" } } ] }

Guion (igual que antes): castellano de España, de tú, colega sarcástico con 2-4 palabrotas moderadas en los remates (playbook «Voz y tono»), 16-24 líneas, ~125-165 palabras (40-60 s; qa lo exige). Estructura @protocolonocturno obligatoria: línea 0 «Imagina que [catástrofe] te pilla en [algo cotidiano]» (≤ 10 palabras); protocolo numerado con pastillas «1 · …», «2 · …», «3 · …» (mínimo 3); cifras grandes como titular dorado; remate cotidiano («Dos horas después…»); penúltima línea = pregunta para comentarios; última línea vuelve a la 0 («Porque imagina que…») para el bucle. Números escritos como se dicen en "text"; cifras en "caps"/"head". caps: trozos de 1-3 palabras separados por `|`, exactamente una palabra con `*` por trozo.

## shot (un plano 3D por línea; una línea de más de 3,2 s recibe sola un segundo ángulo a mitad)
| campo | qué es | valores |
|---|---|---|
| set | escenario (se hereda en las líneas siguientes; obligatorio en la 0) | aula · pasillo · cocina · salon · dormitorio · oficina · ascensor · cine · avion · super · hospital · calle · parque · playa · camping · bosque · nieve · montana · espacio · tormenta · noche · estudio |
| cam | encuadre (si falta, va rotando solo) | wide (general) · medium (cuerpo entero) · close (primer plano de «tú») · low (contrapicado, el peligro enorme) · top (cenital) · lado (perfil) · ots (por encima del hombro de «tú» mirando al peligro) · pov (ves lo que ve «tú», sin «tú») ; `cam2` = ángulo de la 2.ª mitad |
| who | personajes (por defecto solo «tú») | c: tu · chica · profe · abuela · jefe · nino · medico · poli · zombi · gente (grupo, `n`: 3-8) · oso · tiburon · dino · alien · perro · gato · fantasma · robot · paloma · pajaro |
| who[].act | acción | idle · walk · run · scared · point · wave · celebrate · think · hold · hide · crouch · sit · lie · fall · jump · talk · facepalm · roar (animales) · zombie |
| who[].mood | cara | calm · smile · scared · shock · angry · cry · cool · dead (si falta, «tú» pasa a asustado en la palabra amarilla) |
| who[].hold | objeto en la mano | cualquier prop |
| who[].enter | true = entra andando desde el lado | |
| who[].x / z / ry / s | posición (m), giro (rad), escala; si faltan, se colocan solos («tú» a la izquierda, los demás a la derecha mirándole) | |
| props | objetos extra: "nombre" o {"p","x","z","s","y","ry","fall":true (cae del cielo),"spin","bob","come"} | agua · ambulancia · arbol · ascensor · banco · bandera · bocadillo · boli · botiquin · bus · butaca · cafe · caja · calavera · cama · casco · coche · cohete · cubo · cuerda · diccionario · dinero · escalera · espray · examen · extintor · farola · fuego · hoguera · libro · linterna · luna · maleta · mesa · meteorito · mochila · movil · nevera · nube · ola · olla · ordenador · palomitas · paraguas · pino · pizarra · pizza · puerta · pupitre · rayo · reloj · roca · salchicha · sarten · semaforo · silla · sofa · sol · sombrilla · tabla · tele · tienda · toalla |
| fx | efecto | shake (temblor en la palabra amarilla) · flash (destello + temblor) · fire · smoke · rain · snow · night |
| hud | rótulo tipo diario arriba a la izquierda, se mantiene hasta que lo cambies (≤ 34) | «DÍA 1 · 11:30 · EXAMEN» |
| pill | pastilla roja del paso (≤ 22) | «1 · NO CORRAS» |
| head / sub | titular dorado grande (≤ 16) + subtítulo blanco (≤ 32) | «50 KM/H» / «lo que corre un oso» |
| card / cardText | tarjeta ERROR roja u OK verde en la palabra amarilla (≤ 22) | "error" / "TREPAR AL ÁRBOL" |
| say | bocadillo de diálogo (≤ 22) | «¿ESO ES MÍO?» |

Reglas que qa.py hace cumplir: cero emojis en todo script.json; nada de campos viejos `t`/`e`; nombres de set/cam/personaje/prop/fx válidos; sin «Fuente» en pantalla; PROHIBIDA la cuenta atrás del tiempo que queda (nada de «00:35», «quedan…»; la hora solo en el hud tipo diario, como hora de la historia); 40-60 s.
Consejos de dirección: plano 1 = el peligro mirando a cámara junto a «tú» (gancho visual en el primer segundo); alterna close / wide / low / ots para que cada ~2 s cambie la imagen; usa `head` para cada cifra, `card` para cada ERROR/OK, `say` para los chistes; no metas más de 3 personajes grandes en el mismo plano; los props van detrás o al lado de «tú» (x entre -3 y 3, z negativo = al fondo).

## Ejemplo completo
shorts/factory3d/example/script.json (oso en el camping, 56 s) y su resultado shorts/oso-camping-3d/.

## Ledger
Igual que antes (FACTORY.md antiguo): `{"date","slug","title","yt":"","tt":"","buf_yt","buf_tt","buf_ig","genes":{...,"lang":"es","engine":"3d"},"dur":<s>}`.
