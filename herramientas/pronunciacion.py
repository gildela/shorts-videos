"""Revisión de pronunciación para la Fábrica de Animaciones (versión nube).

Compara las palabras del GUION con las que Whisper ha oído en la voz ya generada, y marca lo que la voz no
dice bien: sobre todo las letras finales que se comen («suelo» → «suel»), las palabras que no se oyen
(«no_oida») y las que suenan distintas («pronunciacion»). Las cifras y las palabras pegadas se ignoran: Whisper
escribe «2005» donde el guion dice «dos mil cinco», y eso no es un fallo de la voz.

Solo usa la biblioteca estándar de Python. No genera audio ni toca los vídeos ya hechos: solo lee y avisa.
"""
import difflib
import re
import unicodedata

UMBRAL_PARECIDO = 0.5  # por debajo, dos palabras no son la misma palabra mal dicha
GRAVEDAD = {
    "final_comido": "alta",
    "no_oida": "alta",
    "pronunciacion": "media",
}


def normal(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9ñ]", "", s)


def _tiene_cifra(s):
    return bool(re.search(r"\d", s))


# palabras con las que el guion escribe números («dos mil cinco»): Whisper las pone en cifras y no son fallos
NUMEROS = set("""cero uno una un dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince
dieciseis diecisiete dieciocho diecinueve veinte veintiuno veintidos veintitres veinticuatro veinticinco veintiseis
veintisiete veintiocho veintinueve treinta cuarenta cincuenta sesenta setenta ochenta noventa cien ciento
doscientos doscientas trescientos trescientas cuatrocientos quinientos seiscientos setecientos ochocientos
novecientos mil millon millones y""".split())


def _clasificar(guion_w, oida_w):
    """Dos palabras emparejadas (la del guion y la que Whisper oyó). Devuelve el tipo de problema o None."""
    g, o = normal(guion_w), normal(oida_w)
    if not g or not o or g == o:
        return None
    if _tiene_cifra(oida_w) or _tiene_cifra(guion_w):
        return None  # «2005» por «dos mil cinco»: cifra, no pronunciación
    if len(o) >= 2 and len(g) > len(o) and g.startswith(o):
        return "final_comido"  # la voz se ha comido el final: «suelo» → «suel»
    if difflib.SequenceMatcher(None, g, o).ratio() >= UMBRAL_PARECIDO:
        return "pronunciacion"  # parecida pero no igual: «golpees» → «golpis»
    return None  # otra palabra distinta: no se marca (lo cubre el guion-vs-voz de fabrica transcribir)


def _emparejar(g_idx, o_idx, guion, oido):
    """Empareja en orden las palabras de un tramo que no coincide. Devuelve pares (i_guion, j_oido_o_None)."""
    if len(g_idx) == len(o_idx):
        return list(zip(g_idx, o_idx))
    pares, libres = [], list(o_idx)
    for i in g_idx:
        mejor, mejor_r = None, 0.0
        for j in libres:
            r = difflib.SequenceMatcher(None, normal(guion[i]), normal(oido[j]["w"])).ratio()
            if r > mejor_r:
                mejor, mejor_r = j, r
        if mejor is not None and mejor_r >= UMBRAL_PARECIDO:
            pares.append((i, mejor))
            libres.remove(mejor)
        else:
            pares.append((i, None))
    return pares


def revisar(guion, oido, palabras_por_bloque=None):
    """guion: palabras del guion en orden (con su puntuación). oido: [{"w", "ini", "fin"}] de Whisper.
    palabras_por_bloque: nº de palabras de cada bloque de voz (para saber qué bloque regenerar).
    Devuelve un dict con los problemas, los bloques a repasar y un resumen en español."""
    a = [normal(w) for w in guion]
    b = [normal(o["w"]) for o in oido]
    problemas = []
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            continue
        g_idx = list(range(i1, i2))
        o_idx = list(range(j1, j2))
        for i, j in _emparejar(g_idx, o_idx, guion, oido):
            if j is None:
                if _tiene_cifra(guion[i]) or normal(guion[i]) == "":
                    continue
                if normal(guion[i]) in NUMEROS and any(_tiene_cifra(oido[k]["w"]) for k in range(j1, j2)):
                    continue  # el número está en cifras en lo oído
                # no se oye: si el guion es una cifra la voz la dice en palabras y Whisper la escribe con cifras
                problemas.append({"tipo": "no_oida", "guion": guion[i], "oida": None, "indice": i})
                continue
            tipo = _clasificar(guion[i], oido[j]["w"])
            if tipo:
                problemas.append({"tipo": tipo, "guion": guion[i], "oida": oido[j]["w"], "indice": i,
                                  "ini": oido[j]["ini"]})

    # tiempos: si no hay tiempo de la palabra (no_oida), se usa el de la palabra oída anterior
    ultimo = None
    fin_por_indice = {}
    emparejados = {p.get("indice"): p for p in problemas}
    for k, w in enumerate(guion):
        if k in emparejados and emparejados[k].get("ini") is not None:
            ultimo = emparejados[k]["ini"]
        fin_por_indice[k] = ultimo
    for p in problemas:
        p["gravedad"] = GRAVEDAD.get(p["tipo"], "baja")
        p["seg"] = round(p.get("ini") if p.get("ini") is not None else (fin_por_indice.get(p["indice"]) or 0.0), 2)
        p["frase"] = " ".join(guion[max(0, p["indice"] - 4): p["indice"] + 5])
        p["consejo"] = _consejo(p)
        p.pop("ini", None)

    bloques = []
    if palabras_por_bloque:
        inicio = 0
        for n, cuenta in enumerate(palabras_por_bloque):
            fin = inicio + cuenta
            afectados = [p for p in problemas if inicio <= p["indice"] < fin and p["gravedad"] != "baja"]
            if afectados:
                bloques.append({"bloque": n + 1, "problemas": len(afectados)})
            inicio = fin

    altos = sum(1 for p in problemas if p["gravedad"] == "alta")
    if not problemas:
        resumen = "La voz dice el guion sin fallos de pronunciación detectables."
    else:
        resumen = (f"{len(problemas)} palabras a revisar ({altos} con gravedad alta: finales comidos o sin oír). "
                   + ("Bloques a repasar: " + ", ".join(str(b["bloque"]) for b in bloques) + "." if bloques else ""))
    return {"problemas": problemas, "bloques": bloques, "resumen": resumen, "palabras_guion": len(guion), "palabras_oidas": len(oido)}


def _consejo(p):
    if p["tipo"] == "final_comido":
        return f"Pon «{p['guion']}» seguido de coma o punto y aparte, o escribe la forma que se oye bien; luego regenera ese bloque."
    if p["tipo"] == "no_oida":
        return "La voz se la salta: reescribe la frase con esa palabra más separada o regenera el bloque."
    return "Suena distinta a lo escrito: revisa cómo se escribe o prueba otra forma."


def formato(informe):
    """Texto legible para la consola."""
    lineas = [informe["resumen"]]
    for p in informe["problemas"]:
        oida = f" (la voz dice «{p['oida']}»)" if p.get("oida") else ""
        lineas.append(f"  · [{p['seg']:7.2f} s] {p['gravedad']}: «{p['guion']}»{oida} — {p['tipo']}")
        lineas.append(f"      …{p['frase']}…")
    return "\n".join(lineas)
