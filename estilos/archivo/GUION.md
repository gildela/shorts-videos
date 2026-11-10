# Estilo «Archivo» — cómo se escribe el guion

Formato principal (el de la plantilla gratis): el **LARGO, 800-1300 palabras, de 6 a 10 minutos de vídeo** (a 139
palabras por minuto más las pausas `[pausa N]` de 1,5-3 s entre bloques). Estructura: gancho → apertura del archivo →
de cinco a siete reglas (con una o dos fichas de dato comprobado en medio) → giro → cierre. Todo sale del vídeo de
referencia (Bradikinin, «If Your Cat Ever Watches You Sleep», 6:37): 139 palabras por minuto, frases de 6 palabras de
media, pausas de 1,5 a 3,8 s tras cada remate, voz plana sin un solo énfasis, siete reglas con la séptima
«clasificada» y sustos escondidos de dos fotogramas. El guion de muestra entero (8 minutos) está en el §9. El formato
corto (1:30-1:50) es solo de la comunidad y va al final (§10).

## 1. La fórmula del largo

| Bloque | Qué lleva | Palabras |
|---|---|---|
| **Gancho** (0:00-0:45) | 2-3 frases con la situación de casa a las tres de la madrugada, en segunda persona y presente, con la hora y el sitio. Lo raro aparece en la última frase («Y a los pies de tu cama… hay dos puntos amarillos»). Luego: «Si esto te ha pasado alguna vez, este archivo es para ti» y tres órdenes cortas («No enciendas la luz. No digas nada. Y sobre todo… no le preguntes qué quiere»). Cierra con «Lleva ahí desde que te dormiste. Hay siete reglas. Ya cumples seis. Nadie te las ha explicado». | 70-110 |
| **Apertura del archivo** | «Archivo cero cero uno. [Categoría]. Negociado de Asuntos Nocturnos.» (o «Archivo cero cero uno del Negociado de Asuntos Nocturnos…»), la situación en una frase de funcionario y «hay N reglas» si no se ha dicho en el gancho. Una frase de trámite («Por favor, sigue todas las instrucciones»). | 15-40 |
| **Reglas** (de cinco a siete) | Cada una: «Regla número N. [La orden, en una frase].» + la explicación contada como amenaza (qué hace la cosa, qué pasa si no cumples) + **un dato real con cifra** por regla o, como mínimo, uno cada dos reglas, con la fuente dicha en la voz («Un experimento en Japón lo demostró en dos mil diecinueve»). Remate corto y `[pausa]`. | 50-150 cada una (media ≈ 100) |
| **Fichas de dato comprobado** (una o dos, intercaladas) | Un párrafo sin número de regla en el que el dato más fuerte se cuenta entero: el año, quién, cuántos, la cifra y lo que concluyeron, y un remate frío. En pantalla es una `TarjetaDato` con el sello «COMPROBADO». En el gato: el gato espía de mil novecientos sesenta y siete (dentro de la regla tres) y las cámaras en cincuenta y cinco gatos (regla cuatro). | 40-80 cada una |
| **Interludio** (opcional, entre la regla 3 y la 4) | «Cosas que decidiste que eran normales»: tres situaciones cortas sin número, cada una con su remate. Le da aire a la mitad del vídeo. | 60-100 |
| **Regla clasificada** (opcional, la 7.ª) | «Regla número siete.» `[pausa 2]` «Está sentado encima de la regla siete. Esperaremos.» `[pausa 3]` «Gracias.» El motor corta el drone en seco: silencio digital. | 15-30 |
| **Giro** (hacia el final, 1-1,5 min antes del cierre) | Lo que da la vuelta al archivo. Elige uno: **la regla que se contradice** (la cinco decía «no te muevas»; la siete de verdad dice «respira hondo, que lo vea»), **la regla que faltaba** («La regla ocho es para la noche en que no lo note»), **«ese fuiste tú»** (el ruido, el aliento, la puerta: eras tú) o **el archivo era sobre ti** («Sujeto: un humano adulto. Responde a su nombre»). Siémbralo antes: una frase de una regla anterior que solo se entiende ahora («Está comprobando algo»). | 60-140 |
| **Cierre inquietante** | Qué pasó con el archivo o con quien lo escribió, en cuatro o cinco frases secas; la fórmula «Nosotros no escribimos este archivo. Nos pidieron que te lo leyéramos. Gracias por su cooperación.» y una última frase de 1-5 palabras («Pspsps.»). Deja la puerta abierta a otro archivo (en pantalla: «SIGUIENTE ARCHIVO: 018»). | 40-90 |

Cuentas: un gancho de 90 + apertura de 25 + seis reglas de 100 + una ficha de 60 + giro de 100 + cierre de 70 son
unas 945 palabras: unos ocho minutos y medio con sus pausas. La estimación de `fabrica guion` (139 por minuto) es
prudente: la voz de ElevenLabs suele ir algo más deprisa (el guion de muestra, 1.033 palabras y 83 s de pausas,
estimaba 8:49 y la voz real dura 8:08).

El número del archivo se dice con letra («Archivo cero diecisiete») y el motor lo pinta en la cabecera
(`archivo="017"`). Cada vídeo tiene un número distinto.

**Cuántas reglas decir.** El archivo «tiene» siete y la barra de la cabecera enseña siempre siete casillas, que se van
marcando según llegan las reglas. Si cuentas seis o siete, di «hay siete reglas, ya cumples seis». Si cuentas cinco, di
igual «hay siete»: las que faltan son la clasificada y la que nadie te dio, y eso también da miedo. Nunca menos de
cinco.

**Títulos de bloque.** Pon una línea `# Regla uno`, `# Ficha: el gato espía`, `# El sujeto`… al empezar cada bloque,
como en el guion de muestra. La fábrica no lee las líneas que empiezan por `#`: te sirven para orientarte, para
repartir el `Video.tsx` en bloques (`S1.tsx`…`S7.tsx`, ver `LEEME.md`) y para escribir los capítulos de `subir.txt`.

## 2. Las reglas por dentro

- **La orden, en una frase** y en imperativo: «No enciendas la luz.» «Si te llama, ve.» «A las cinco, llena el
  cuenco.» Se entiende sin la explicación y se puede dibujar (lo prohibido, grande, con la cruz roja encima).
- **La explicación es una amenaza contada como un manual**: qué hace la cosa, en qué orden, qué pasa si no cumples.
  «Primero te tocará la mejilla. Luego la boca. Luego un párpado.» Escalar dentro de la regla funciona: el tercer
  paso siempre es peor.
- **El dato real con cifra** va en medio, dicho como un trámite («Unos científicos midieron ese ronroneo en dos mil
  nueve»), y la frase siguiente lo convierte en amenaza («Ya estás de pie. No has decidido levantarte»).
- **Remate de 3-6 palabras** y `[pausa 1.5]`, o `[pausa 3]` si es el más fuerte de la regla.
- **Las reglas van de lo doméstico a lo raro**: las primeras se cumplen sin pensar («ya cumples seis»); las últimas
  ya no son normales. La clasificada no se dice hasta después del giro.
- **Variedad**: no más de dos reglas seguidas que empiecen por «No». Mezcla órdenes de no hacer, de hacer y de
  horario («A las tres…», «A las cinco…»).

## 3. Las frases

- **6-8 palabras por frase.** Si una frase pasa de 10, pártela. Muchas de 3 («Es tu gato.» «Está sentado.» «Muy
  quieto.» «Mirándote.»).
- **Una imagen dibujable por frase**: si no se puede dibujar con un pictograma blanco, no va.
- **Segunda persona, presente.** «Te despiertas.» «Tu gato ve.» Nunca «uno se despierta» ni pasado (salvo el cierre,
  que cuenta lo que le pasó al empleado).
- **Números con letra** («dos mil veinte», «seis veces», «cincuenta y cinco gatos»), para que la voz los lea bien.
- **Un dato real comprobado por regla o cada dos reglas**, con la fuente apuntada en `fuentes.md` (dos fuentes por
  dato). El dato es lo que hace que el miedo cuele. En un largo eso son de cuatro a siete datos: búscalos **antes**
  de escribir. Si no tienes dato, no tienes regla.
- **Un chiste frío por minuto como mucho**, dicho con la misma voz que las advertencias. Nunca se ríe de la broma.
- **Remates seguidos de pausa.** Después de cada frase que cierra una idea, una línea `[pausa N]`.

## 4. Las pausas

Las marcas van **en línea propia, entre bloques**, exactamente así (ElevenLabs admite hasta 3 s por marca):

```
[pausa 1.5]     entre frases que cierran una idea dentro del mismo bloque
[pausa 2]       antes de «Archivo cero…» y antes de cada «Regla número…»
[pausa 3]       después del remate más fuerte de una regla, tras «Esperaremos.» y antes del giro
```

En un largo salen de 30 a 45 marcas (el guion de muestra lleva 39 y suman 83 s). `fabrica guion` las convierte en
`<break time="2.0s" />` para ElevenLabs y las descuenta de las palabras; si la voz no las respeta, `fabrica
transcribir` mete los silencios en el audio. No pongas puntos suspensivos para hacer pausas largas: los puntos
suspensivos («Y sobre todo… no le preguntes») son medio segundo; lo demás son marcas.

## 5. Silencios, sustos y apagón: déjalos escritos

El montaje los pone en `Video.tsx`, pero el guion tiene que dejarles sitio:
- **2-3 silencios del drone**: frases que los piden. «Esperaremos.» (la regla clasificada), «Para un gato, pareces
  muerto.» (el giro) y la última palabra del vídeo.
- **3-5 sustos escondidos** de 2-3 fotogramas: frases con doble sentido en las que el subtítulo puede mentir un
  instante («Nunca has preguntado adónde.» → «NUNCA HAS PREGUNTADO POR QUÉ VUELVE.»), un momento tranquilo para los
  ojos donde no deberían estar (el interludio, una regla sin susto), la hora (03:04) dicha al principio y repetida al
  final. Nunca en la primera frase.
- **El apagón final**: la última frase es corta y quieta; tras ella, la cinta se va a negro.

## 6. El tono

- **Voz de funcionario que lee un expediente**: plana, sin énfasis, sin preguntas retóricas, sin «¿sabías que…?».
- Frío, seco, literal. Las amenazas se dicen como instrucciones de un manual.
- El humor sale del contraste entre lo absurdo y la seriedad con que se dice. Nunca un guiño.
- La «cosa» (el gato, el perro, la casa) nunca es mala: es otra, y tiene sus razones. El miedo viene de que las
  razones son reales.
- En ocho minutos el tono no cambia nunca: ni se acelera en el giro ni se pone solemne en el cierre.

## 7. Prohibido

- Nombres de canales, de marcas, de personas reales (salvo el autor de un estudio, en `fuentes.md`).
- Música que se note, ambientes, gritos, susurros: la voz es siempre la misma.
- Datos sin fuente, estadísticas inventadas, «los expertos dicen».
- Frases de más de 12 palabras. Adjetivos de relleno («terrorífico», «escalofriante»): el estilo no califica,
  describe.
- **Más de 1300 palabras**: pasa de 10 minutos y el vídeo se arrastra.
- **Menos de 800 palabras**: se queda en 5-6 minutos y no da para el giro.
- **Menos de 5 reglas**: no parece un expediente, parece una anécdota.
- Explicar la broma, pedir suscripciones, mencionar el vídeo («en este vídeo»).

## 8. Errores típicos

- **Reglas de relleno**: una regla sin dato y sin escalada es un párrafo de más. Si no tienes dato para ella, apóyala
  en el de la regla de al lado («un dato cada dos reglas») o quítala.
- **Todos los datos al principio**: repártelos; el más fuerte va en una ficha de dato hacia la mitad (minuto 3-5),
  que es donde la gente se va.
- **Giro sin sembrar**: si nada de antes lo anuncia, parece un truco. Siembra una frase en las reglas 2-3.
- **Giro explicado**: dilo una vez y sigue. Nada de «es decir…».
- **Bloques todos iguales**: alterna reglas largas (140 palabras) y cortas (50). En la muestra la regla dos tiene 50 y
  la tres 144.
- **Cierre largo**: más de 90 palabras después del giro y el final se diluye.
- **Pausas que faltan**: sin `[pausa]` tras los remates, ocho minutos de voz plana se hacen bola.

## 9. Guion de muestra (8 minutos)

El del vídeo largo del gato: **1.033 palabras, 39 pausas (83 s), siete reglas más la ocho, 8:08 de voz.** Archivo 017.
Fíjate en cómo se reparte: gancho de 94 palabras (0:00-0:44); apertura de 15; reglas de 50 a 144 palabras; el gato
espía como ficha de dato dentro de la regla tres y las cámaras en 55 gatos dentro de la cuatro; el interludio «Cosas
que decidiste que eran normales» entre la tres y la cuatro; la regla siete clasificada («Esperaremos.»); el giro «El
sujeto», sembrado en la regla dos («Está comprobando algo»); la regla siete de verdad, que contradice a la cinco («No
te muevas» → «respira hondo, que lo vea»), y la regla ocho que falta; el cierre con el empleado y «Pspsps.».

```
# Si tu gato te mira mientras duermes

Son las tres y cuatro minutos de la madrugada. Te despiertas sin saber por qué. La casa está en silencio. Y a los pies de tu cama… hay dos puntos amarillos.

[pausa 1.5]

Es tu gato. Está sentado. Muy quieto. Mirándote.

[pausa 2]

Si esto te ha pasado alguna vez, este archivo es para ti. No enciendas la luz. No digas nada. Y sobre todo… no le preguntes qué quiere.

[pausa 1.5]

Lleva ahí desde que te dormiste. Está ahí todas las noches. Hay siete reglas. Casi todos los dueños de gatos ya cumplen seis. Nadie os las ha explicado.

[pausa 2]

# Archivo cero diecisiete

Archivo cero diecisiete. Felino doméstico. Negociado de Asuntos Nocturnos. Por favor, sigue todas las instrucciones.

[pausa 1.5]

# Regla uno

Regla número uno. No enciendas la luz.

Tu gato ve con seis veces menos luz que tú. A oscuras, él ve tu cara perfectamente. Tú solo ves sus ojos. Si enciendes la luz, la cosa se iguala. Y a él no le gusta que la cosa se iguale.

[pausa 1.5]

Sus ojos brillan porque tienen una capa como un espejo detrás. Devuelve la luz. Por eso parecen dos linternas. No son linternas. Son ventanas. Y él está detrás.

[pausa 3]

Eso que acabas de hacer. Lo hemos oído. Y el gato también.

[pausa 2]

# Regla dos

Regla número dos. No reacciones a la pata.

Primero te tocará la mejilla. Luego la boca. Luego un párpado. El primer toque es una pregunta. El segundo no. En el tercero lleva una uña fuera.

[pausa 1.5]

Después pondrá la nariz junto a tu boca. No es un beso. Está comprobando algo.

[pausa 2]

# Regla tres

Regla número tres. Si te llama, ve.

Tu gato sabe cómo se llama. Un experimento en Japón lo demostró en dos mil diecinueve. Le decían cuatro palabras parecidas. El gato ni se movía. Le decían su nombre… y giraba la oreja. Esa fue toda la respuesta.

[pausa 1.5]

Sabe su nombre. Simplemente decide no venir. Pero cuando él te llama a ti, tú vas. Te levantas. Cruzas el pasillo. Llegas a una habitación vacía. No necesitaba nada. Te estaba cronometrando.

[pausa 2]

No eres el primero en intentarlo. En mil novecientos sesenta y siete, la agencia de espionaje de Estados Unidos metió un micrófono dentro de un gato. Querían que escuchara conversaciones secretas. El informe final decía dos palabras: no práctico.

[pausa 1.5]

No dice que no funcionara. Dice que no era práctico. Porque el gato hacía lo que quería. Lo que nadie se preguntó es para quién estaba escuchando.

[pausa 2]

# Cosas que decidiste que eran normales

Has visto cosas en tu casa. Decidiste que eran normales.

[pausa 1.5]

Lo has buscado por todas las habitaciones. Lo has llamado. Has agitado la bolsa de comida. Estaba en la habitación todo el rato. Te miraba buscar.

[pausa 1.5]

Se cruza delante de tus pies. En la escalera. A oscuras. Ha estado a punto de matarte muchas veces. Y cada vez le has pedido perdón tú.

[pausa 2]

Se frota contra tus piernas. Eso no es cariño. Tiene glándulas de olor en la cara. Te está marcando. Para que los demás gatos sepan que ya tienes dueño. Significa: mío.

[pausa 2]

# Regla cuatro

Regla número cuatro. No cierres la puerta del dormitorio.

Lo intentaste una vez. Una pata apareció por debajo. Así que abriste. No entró. Nunca quiso entrar. Quería la puerta abierta. Son cosas distintas.

[pausa 1.5]

Con la puerta del baño pasa lo mismo. Hace años que no estás solo ahí dentro. Se sienta. Mira. No aparta la vista.

[pausa 1.5]

Luego se va. Nunca has preguntado adónde. Unos científicos sí. Colgaron cámaras diminutas del collar de cincuenta y cinco gatos. Uno de cada cuatro comía en otra casa. Lo llamaron «la segunda familia». Tú siempre has dado por hecho que eras la primera.

[pausa 3]

Ese vaso no estaba cerca del borde. No miraba el vaso. Nos miraba a nosotros.

[pausa 2]

# Regla cinco

Regla número cinco. No te muevas.

A las tres de la mañana algo va a correr por tu casa. Por el pasillo. Por encima de la cama. Por encima de ti. Y luego se parará. Nada lo persigue. Esa es la parte en la que conviene pensar.

[pausa 1.5]

Después beberá del vaso que tienes en la mesilla. Llevas años bebiendo después de él.

[pausa 1.5]

Luego se subirá a tu pecho. Apretará las patas contra ti. Una a una. Despacio. Está midiendo algo. No ha dicho qué. Luego dará la vuelta y se tumbará. A ti te toca el otro extremo.

[pausa 1.5]

No te muevas. Dejarás de sentir el brazo. Te entrarán ganas de ir al baño. Te quedarás exactamente así hasta que amanezca. Siempre lo has hecho.

[pausa 2]

# Regla seis

Regla número seis. A las cinco, llena el cuenco.

Primero ronroneará. Unos científicos midieron ese ronroneo en dos mil nueve. Dentro encontraron un segundo sonido. Suena como el llanto de un bebé. Ya estás de pie. No has decidido levantarte.

[pausa 1.5]

Camina delante de ti hasta la cocina. Dos veces mira atrás para comprobar que le sigues. Le sigues.

[pausa 1.5]

El cuenco no está vacío. Pero se ve el fondo. Para un gato, eso es el fin del mundo. El mundo se ha acabado todas las mañanas a las cinco. Comerá cuatro trozos. Y volverá a la cama. Tú no.

[pausa 2]

# Regla siete

Regla número siete.

[pausa 2]

Está sentado encima de la regla siete. Esperaremos.

[pausa 3]

Gracias.

[pausa 1.5]

Seis reglas. No has roto ninguna. Nadie te las dio. Alguien sí.

[pausa 2]

# El sujeto

Este archivo no va sobre el gato.

[pausa 1.5]

Sujeto: un humano adulto. Responde a su nombre. Acude cuando le llaman. Duerme ocho horas seguidas.

[pausa 1.5]

Para un gato, pareces muerto.

[pausa 2]

Así que cada noche viene a comprobarlo. La mirada. La pata. La nariz junto a tu boca. Está buscando señales de vida. Esta noche ha encontrado una.

[pausa 2]

No volveremos a hablar de esto.

[pausa 1.5]

Tú también te has inclinado sobre él mientras dormía, para ver si respiraba. Eso es lo que se hace con una mascota.

[pausa 3]

# Regla siete, de verdad

Regla número siete. Cuando lo notes encima del pecho, respira hondo. Que lo vea. Es lo único que ha venido a comprobar.

[pausa 1.5]

La regla ocho es para la noche en que no lo note. Sigue sentado encima de esa.

[pausa 2]

# Cierre

El empleado que escribió este archivo vivía solo, con una gata negra. En marzo dejó de venir a la oficina. Su puerta estaba cerrada por dentro. Su cuenco estaba lleno.

[pausa 1.5]

Los informes siguieron llegando. Cada semana. Puntuales. A las tres y cuatro minutos de la madrugada. Este es el último.

[pausa 2]

Nosotros no escribimos este archivo. Nos pidieron que te lo leyéramos.

[pausa 2]

Gracias por su cooperación.

[pausa 2]

Pspsps.
```

## 10. Formato corto (solo comunidad): 170-220 palabras, gancho + 2 reglas + cierre, 1:30-1:50

Misma voz, mismas frases, mismas pausas, con este esqueleto:

| Bloque | Qué lleva | Palabras |
|---|---|---|
| **Gancho** (2-3 frases + 3 órdenes) | La situación, lo raro en la última frase, «Si esto te ha pasado alguna vez, este archivo es para ti» y las tres órdenes. | 55-65 |
| **Apertura del archivo** | «Archivo cero diecisiete. [Categoría]. Negociado de Asuntos Nocturnos. Hay siete reglas. Casi todos […] ya cumplen seis… sin saberlo.» | 20-25 |
| **Regla uno** | Orden + amenaza + un dato real (3-5 frases). Remate corto. | 35-45 |
| **Regla dos** | Orden + explicación con su dato real y la fuente dicha en la voz. | 35-45 |
| **Cierre inquietante** | Dos o tres frases que dejan la puerta abierta; la última de 3-5 palabras. | 10-15 |

Más de 220 palabras en el corto y la voz se va a dos minutos. La barra de la cabecera sigue enseñando 7 casillas: el
archivo tiene siete, el corto cuenta dos.

Muestra: el guion corto del gato (`ejemplo/guion.md`, 1:38). Ojo: tiene 230 palabras sin las marcas; para un corto
nuevo quédate en 170-220, con una frase menos por bloque.

```
# Si tu gato te mira mientras duermes

Son las tres y cuatro minutos de la madrugada. Te despiertas sin saber por qué. La casa está en silencio. Y a los pies de tu cama… hay dos puntos amarillos.

[pausa 1.5]

Es tu gato. Está sentado. Muy quieto. Mirándote.

[pausa 1.5]

Si esto te ha pasado alguna vez, este archivo es para ti. No enciendas la luz. No digas nada. Y sobre todo… no le preguntes qué quiere.

[pausa 2]

Archivo cero diecisiete. Felino doméstico. Negociado de Asuntos Nocturnos. Hay siete reglas. Casi todos los dueños de gatos ya cumplen seis… sin saberlo.

[pausa 2]

Regla número uno. No enciendas la luz.

[pausa 1.5]

Tu gato ve con seis veces menos luz que tú. A oscuras, él ve tu cara perfectamente. Tú solo ves sus ojos. Si enciendes la luz, la cosa se iguala. Y a él no le gusta que la cosa se iguale.

[pausa 1.5]

Sus ojos brillan porque tienen una capa como un espejo detrás. Devuelve la luz. Por eso parecen dos linternas. No son linternas. Son ventanas. Y él está detrás.

[pausa 2]

Regla número dos. Si te mira fijamente… parpadea despacio.

[pausa 1.5]

Cierra los ojos. Cuenta hasta dos. Ábrelos. Esto no es un truco del archivo. Un estudio de dos mil veinte lo comprobó. Para un gato, el parpadeo lento es una señal de confianza. Si tu gato te devuelve el parpadeo, has pasado la noche. Si no lo hace… vuelve a intentarlo. Y no apartes la mirada.
```

Fíjate: el gancho acaba en la imagen rara («dos puntos amarillos»); cada regla tiene su dato (la visión del gato,
el tapetum; el estudio de 2020 del parpadeo lento); el cierre son cuatro frases cortas y la última es una orden.
