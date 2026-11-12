# Subagente de revisión de pronunciación (estilo «Archivo»)

Brief para un subagente (Agent) que revisa un guion antes de la voz y, después, la transcripción de la voz ya
generada. Solo lee y propone; quien aplica los cambios es Claude en la sesión.

## Cuándo se lanza

1. **Antes de la voz** (paso 5b de `skill/animaciones-nube/SKILL.md`): sobre `src/videos/<id>/guion.md`.
2. **Después de la voz** (si el usuario lo pide o la voz se ha regenerado): sobre `src/videos/<id>/transcripcion.txt`
   comparado con `guion.md`. Es la prueba real de lo que se ha comido el TTS.

## Qué le pasas

- El archivo a revisar (guion o transcripción).
- Este brief completo.
- Pide solo este resultado: una lista de hallazgos, cada uno con la frase original, la palabra exacta, el problema y
  una alternativa concreta. Sin reescribir el guion entero.

## Qué busca

- **Consonantes finales perdidas**: palabras que acaban en -s, -d, -r, -n, -z o en grupo consonántico (-ld, -rt, -ns)
  justo antes de una `[pausa N]` o de un punto. Esas son las que la voz suele comerse. Ejemplos a vigilar: plurales en
  -s de una sílaba («tres», «dos»), participios en -ado/-ido/-ada («dormido», «cerrada»), infinitivos en -r y palabras
  en -n o -l antes de pausa.
- **Palabras raras o nombres propios** que el TTS puede leer mal: siglas, extranjerismos, nombres de estudios, ciudades.
  Propón escribirlas como se dicen (sin acentos raros ni mayúsculas que cambien la lectura).
- **Números y horas**: que estén con letra («tres y cuatro minutos», «dos mil veinte»). Un número con cifra es un fallo.
- **Ambigüedades de lectura**: «Esperaremos.» tras una pausa corta, «no» al final de frase, comas que cambian la
  entonación.
- **Tildes que cambian sentido**: «él» / «el», «más» / «mas», «sé» / «se», «tú» / «tu» (solo si hay riesgo).

## Cómo proponer el cambio

- Preferido: cambiar la palabra por otra equivalente que no termine en consonante dura antes de pausa («tres» → «tres
  noches», si el sentido lo admite) o mover la pausa a una frase más corta.
- Nunca quitar la palabra de la regla ni cambiar el dato de `fuentes.md`.
- Nunca añadir puntos suspensivos para hacer pausas (ver `GUION.md` §4).
- Si no hay nada que corregir, responde exactamente: «Pronunciación: sin cambios».

## Formato de respuesta

Una línea por hallazgo: `[bloque] «frase original» → palabra «X»: problema. Propuesta: «frase corregida».`
Máximo 15 hallazgos, los más graves primero (los que quitan una palabra completa, luego los de número, luego el resto).
