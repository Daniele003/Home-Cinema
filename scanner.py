import os
import re
import sys
import json
import shutil
from tmdbv3api import TMDb, Search, Movie, TV

#*************************************************************************************************************************************************************************************************************************************************************************
# CONFIGURAZIONE
#*************************************************************************************************************************************************************************************************************************************************************************
API_Read_Access_Token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4Y2ExNmRiNmU0N2E4NmEyZmRlOWQ2ZDI5OTNlNWJhNiIsIm5iZiI6MTY2NzMyMjg3NC40NDMsInN1YiI6IjYzNjE1M2ZhZmQ2MzAwMDA3ZTQxZWRmOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.H0o69tt66TehWh8ZDxlAn-64pjRuH2rAZVJjwy__rVc"
tmdb = TMDb()
tmdb.api_key = '8ca16db6e47a86a2fde9d6d2993e5ba6'
tmdb.language = 'it'

EXCLUDE_FILE = "exclude_list.txt"
VIDEO_EXTENSIONS = {'.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'}

def carica_esclusioni():
    if os.path.exists(EXCLUDE_FILE):
        with open(EXCLUDE_FILE, "r", encoding="utf-8") as f:
            return set(line.strip() for line in f if line.strip())
    return set()

def salva_esclusione(item):
    esclusioni = carica_esclusioni()
    esclusioni.add(item)
    with open(EXCLUDE_FILE, "w", encoding="utf-8") as f:
        for e in sorted(esclusioni):
            f.write(e + "\n")

#*************************************************************************************************************************************************************************************************************************************************************************

class TMDBEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, 'entries'): return obj.entries
        elif hasattr(obj, '_entries'): return obj._entries
        elif hasattr(obj, '__dict__'): return obj.__dict__
        return super().default(obj)

#*************************************************************************************************************************************************************************************************************************************************************************
# VISUALIZZAZIONE DEL MENU A CONSOLE
#*************************************************************************************************************************************************************************************************************************************************************************
try:
    import msvcrt
    def leggi_tasto():
        tasto = msvcrt.getch()
        if tasto in (b'\x00', b'\xe0'):
            funzione = msvcrt.getch()
            if funzione == b'H': return 'SU'
            if funzione == b'P': return 'GIU'
        if tasto in (b'\r', b'\n'): return 'INVIO'
        if tasto == b'q': return 'QUIT'
        return None
except ImportError:
    import tty, termios
    def leggi_tasto():
        fd = sys.stdin.fileno()
        vecchie_impostazioni = termios.tcgetattr(fd)
        try:
            tty.setraw(sys.stdin.fileno())
            tasto = sys.stdin.read(1)
            if tasto == '\x1b':
                sys.stdin.read(1)
                direzione = sys.stdin.read(1)
                if direzione == 'A': return 'SU'
                if direzione == 'B': return 'GIU'
            elif tasto in ('\r', '\n'): return 'INVIO'
            elif tasto == 'q': return 'QUIT'
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, vecchie_impostazioni)
        return None

def mostra_menu(titolo, opzioni, selezione_iniziale=0):
    selezione_corrente = selezione_iniziale
    totale_opzioni = len(opzioni)
    if totale_opzioni == 0: return None

    def stampa_menu():
        cols, rows = shutil.get_terminal_size()
        max_voci = rows - 6
        inizio = 0
        if selezione_corrente >= max_voci:
            inizio = selezione_corrente - max_voci + 1
        fine = min(inizio + max_voci, totale_opzioni)

        sys.stdout.write("\033[H\033[J")
        header = f"--- {titolo} ---"
        print(header[:cols])
        
        for i in range(inizio, fine):
            opzione = str(opzioni[i])
            prefisso = " > " if i == selezione_corrente else "   "
            spazio_testo = cols - len(prefisso) - 5
            testo_troncato = (opzione[:spazio_testo] + '..') if len(opzione) > spazio_testo else opzione
            if i == selezione_corrente:
                print(f"\033[1;32m{prefisso}{testo_troncato}\033[0m")
            else:
                print(f"{prefisso}{testo_troncato}")
        
        print("-" * len(header[:cols]))
        print(f" [Su/Giu] Naviga | [Invio] Seleziona | [q] Esci/Annulla | ({selezione_corrente+1}/{totale_opzioni})")
        sys.stdout.flush()

    while True:
        stampa_menu()
        tasto = leggi_tasto()
        if tasto == 'SU': selezione_corrente = (selezione_corrente - 1) % totale_opzioni
        elif tasto == 'GIU': selezione_corrente = (selezione_corrente + 1) % totale_opzioni
        elif tasto == 'INVIO': return selezione_corrente
        elif tasto == 'QUIT': return -1

#*************************************************************************************************************************************************************************************************************************************************************************

def pulisci_nome_file(filename):
    nome, _ = os.path.splitext(filename)
    nome = re.sub(r"[\.\-_]", " ", nome)
    nome = re.sub(r"(1080p|720p|4k|bluray|webrip|x264|x265|ita|eng|sub|h264|dd5)", "", nome, flags=re.IGNORECASE)
    return " ".join(nome.split())

def Trova(f_name, force_type=None, pos=1):
    nome = pulisci_nome_file(f_name)
    try:
        risultati = Search().multi(nome)
    except Exception as e:
        print(f"Errore API TMDB: {e}")
        return None
    
    if not risultati.get("results"):
        if pos: return None
        nuovo_titolo = input(f"\nNessun risultato per '{f_name}'. Titolo manuale (o 's' per saltare): ")
        if nuovo_titolo.lower() == 's': return None
        return Trova(nuovo_titolo, force_type=force_type, pos=False)
        
    media_filtrati = [r for r in risultati["results"] if r.get("media_type") in ['movie', 'tv']]
    if force_type:
        media_filtrati = [r for r in media_filtrati if r.get("media_type") == force_type]

    if not media_filtrati:
        if pos: return None
        nuovo_titolo = input(f"Nessun film/serie per '{f_name}'. Titolo manuale (o 's' per saltare): ")
        if nuovo_titolo.lower() == 's': return None
        return Trova(nuovo_titolo, force_type=force_type, pos=False)

    if pos:
        return media_filtrati[0]
    else:
        voci = ["Cerca altro titolo manuale"]
        voci.extend([f"[{v.get('media_type', '').upper()}] {v.get('name', '')}{v.get('title', '')} ({v.get('first_air_date', '')[:4]}{v.get('release_date', '')[:4]})" for v in media_filtrati])
        scelta = mostra_menu(f"Associa: {f_name}", voci)
        if scelta == -1: return None
        if scelta == 0:
            return Trova(input("Titolo da cercare: "), force_type=force_type, pos=False)
        return media_filtrati[scelta - 1]

def is_tv_series_folder(path):
    """Prova a indovinare se una cartella è una serie TV"""
    items = os.listdir(path)
    pattern_episodio = re.compile(r"[sS]\d{1,2}[eE]\d{1,2}|[Ss]tagione|[Ss]eason", re.IGNORECASE)
    for item in items:
        if pattern_episodio.search(item):
            return True
        if os.path.isdir(os.path.join(path, item)) and re.search(r"[Ss]tagione|[Ss]eason|\d+", item):
            return True
    return False

def scan_recursive(directory, esclusioni, risultati):
    if os.path.basename(directory) in esclusioni:
        return

    try:
        items = os.listdir(directory)
    except:
        return

    for item in items:
        if item in esclusioni: continue
        full_path = os.path.join(directory, item).replace("\\", "/")
        
        if os.path.isdir(full_path):
            # È una cartella: Serie TV o Contenitore?
            probabile_serie = is_tv_series_folder(full_path)
            
            print(f"\nCartella trovata: {item}")
            opzioni = [
                f"È una Serie TV (Associa '{item}' come serie)",
                f"È un contenitore (Entra e scansiona i file all'interno)",
                "Ignora questa cartella"
            ]
            default_idx = 0 if probabile_serie else 1
            scelta = mostra_menu(f"Gestione cartella: {item}", opzioni, selezione_iniziale=default_idx)
            
            if scelta == 0: # Serie TV
                print(f"Analisi Serie: {item}...", end="\r")
                risultati[full_path] = Trova(item, force_type='tv')
            elif scelta == 1: # Contenitore
                scan_recursive(full_path, esclusioni, risultati)
            elif scelta == 2: # Ignora
                continue
        else:
            # È un file: Film o altro?
            ext = os.path.splitext(item)[1].lower()
            if ext in VIDEO_EXTENSIONS:
                print(f"Analisi Film: {item}...", end="\r")
                risultati[full_path] = Trova(item, force_type='movie')

if __name__ == "__main__":
    risultati = {}
    esclusioni = carica_esclusioni()
    
    print("--- Home Cinema Scanner Avanzato ---")
    while True:
        root_dir = input("\nInserisci percorso cartella radice (o 'exit'): ").replace("\\","/")
        if root_dir.lower() == 'exit': break
        if os.path.isdir(root_dir):
            scan_recursive(root_dir, esclusioni, risultati)
            print("\nScansione completata.")
        else:
            print(f"Percorso non valido: {root_dir}")

    while True:
        menu_main = ["Salva JSON", "Rivedi associazioni", "Elimina film", "Ignora sempre", "Esci"]
        scelta = mostra_menu("GESTIONE LIBRERIA", menu_main)
        
        if scelta == 0: break
        elif scelta in (4, -1): sys.exit(0)
        elif scelta == 1:
            chiavi = list(risultati.keys())
            voci = [f"{os.path.basename(k)} -> {risultati[k].get('name', risultati[k].get('title', 'NON ASSOCIATO')) if risultati[k] else 'NON ASSOCIATO'}" for k in chiavi]
            idx = mostra_menu("Correggi", voci)
            if idx != -1:
                t = chiavi[idx]
                risultati[t] = Trova(os.path.basename(t), pos=False)
        elif scelta == 2:
            chiavi = list(risultati.keys())
            voci = [f"ELIMINA: {os.path.basename(k)}" for k in chiavi]
            idx = mostra_menu("Rimuovi", voci)
            if idx != -1: del risultati[chiavi[idx]]
        elif scelta == 3:
            chiavi = list(risultati.keys())
            voci = [f"IGNORA: {os.path.basename(k)}" for k in chiavi]
            idx = mostra_menu("Escludi", voci)
            if idx != -1:
                n = os.path.basename(chiavi[idx])
                salva_esclusione(n)
                del risultati[chiavi[idx]]

    print("\nDownload dettagli...")
    movie_api, tv_api = Movie(), TV()
    dati_completi = {}
    for path, info in risultati.items():
        dettagli = None
        if info:
            try:
                if info.get("media_type") == 'movie': dettagli = movie_api.details(info.get("id"))
                else: dettagli = tv_api.details(info.get("id"))
            except: pass
        dati_completi[path] = {"percorso_file": path, "info_ricerca": info, "info_dettagliate": dettagli}

    # Esporta come JSON
    with open("libreria_media.json", "w", encoding="utf-8") as f:
        json.dump(dati_completi, f, indent=4, ensure_ascii=False, cls=TMDBEncoder)
    
    # Esporta come file JS per bypassare CORS in locale
    with open("libreria_media.js", "w", encoding="utf-8") as f:
        f.write("const libreria_media = ")
        json.dump(dati_completi, f, indent=4, ensure_ascii=False, cls=TMDBEncoder)
        f.write(";")
        
    print("\nLibreria aggiornata (libreria_media.json e libreria_media.js)!")
