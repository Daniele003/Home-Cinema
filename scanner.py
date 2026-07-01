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

# File per memorizzare le esclusioni
EXCLUDE_FILE = "exclude_list.txt"

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
        if hasattr(obj, 'entries'):
            return obj.entries
        elif hasattr(obj, '_entries'):
            return obj._entries
        elif hasattr(obj, '__dict__'):
            return obj.__dict__
        return super().default(obj)

def scan_directory(directory):
    esclusioni = carica_esclusioni()
    try:
        items = os.listdir(directory)
        # Filtra i file/cartelle ignorati
        return [i for i in items if i not in esclusioni]
    except Exception as e:
        print(f"Errore nella scansione di {directory}: {e}")
        return []

#*************************************************************************************************************************************************************************************************************************************************************************
# VISUALIZZAZIONE DEL MENU A CONSOLE MIGLIORATA
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
        # Ottieni dimensioni terminale
        cols, rows = shutil.get_terminal_size()
        max_voci = rows - 6 # Spazio per titolo e bordi
        
        # Gestione scrolling se troppe voci
        inizio = 0
        if selezione_corrente >= max_voci:
            inizio = selezione_corrente - max_voci + 1
        fine = min(inizio + max_voci, totale_opzioni)

        # Pulisci schermo (metodo cross-platform ANSI)
        sys.stdout.write("\033[H\033[J")
        
        header = f"--- {titolo} ---"
        print(header[:cols])
        
        for i in range(inizio, fine):
            opzione = str(opzioni[i])
            # Tronca le voci troppo lunghe per non rompere il layout
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

        if tasto == 'SU':
            selezione_corrente = (selezione_corrente - 1) % totale_opzioni
        elif tasto == 'GIU':
            selezione_corrente = (selezione_corrente + 1) % totale_opzioni
        elif tasto == 'INVIO':
            return selezione_corrente
        elif tasto == 'QUIT':
            return -1

#*************************************************************************************************************************************************************************************************************************************************************************

def pulisci_nome_file(filename):
    nome, _ = os.path.splitext(filename)
    nome = re.sub(r"[\.\-_]", " ", nome)
    nome = re.sub(
        r"(1080p|720p|4k|bluray|webrip|x264|x265|ita|eng|sub|h264|dd5)",
        "",
        nome,
        flags=re.IGNORECASE,
    )
    return " ".join(nome.split())

def Trova(f_name, pos=1):
    nome = pulisci_nome_file(f_name)
    try:
        risultati = Search().multi(nome)
    except Exception as e:
        print(f"Errore API TMDB: {e}")
        return None
    
    if not risultati.get("results"):
        print(f"\nNessun risultato per: {f_name}")
        if pos: return None
        nuovo_titolo = input("Inserisci titolo manuale (o 's' per saltare): ")
        if nuovo_titolo.lower() == 's': return None
        return Trova(nuovo_titolo, pos=False)
        
    media_filtrati = [r for r in risultati["results"] if r.get("media_type") in ['movie', 'tv']]

    if not media_filtrati:
        if pos: return None
        nuovo_titolo = input(f"Nessun film/serie per '{f_name}'. Inserisci manuale (o 's' per saltare): ")
        if nuovo_titolo.lower() == 's': return None
        return Trova(nuovo_titolo, pos=False)

    if pos:
        return media_filtrati[0] if media_filtrati else None
    else:
        voci = ["Cerca altro titolo manuale"]
        voci.extend([f"[{v.get('media_type', '').upper()}] {v.get('name', '')}{v.get('title', '')} ({v.get('first_air_date', '')[:4]}{v.get('release_date', '')[:4]})" for v in media_filtrati])
        
        scelta = mostra_menu(f"Associa: {f_name}", voci)
        if scelta == -1: return None
        if scelta == 0:
            return Trova(input("Titolo da cercare: "), pos=False)
        return media_filtrati[scelta - 1]

if __name__ == "__main__":
    risultati = {}
    esclusioni = carica_esclusioni()
    
    print("--- Home Cinema Scanner ---")
    while True:
        directory = input("\nInserisci percorso cartella (o 'exit' per terminare): ").replace("\\","/")
        if directory.lower() == 'exit': break
        
        if directory.endswith("/") and len(directory) > 1:
            directory = directory[:-1]
            
        if os.path.isdir(directory):
            items = scan_directory(directory)
            for item in items:
                full_path = f"{directory}/{item}"
                print(f"Analisi: {item}...", end="\r")
                risultati[full_path] = Trova(item)
            print("\nScansione completata.")
        else:
            print(f"Percorso non valido: {directory}")

    # Ciclo di revisione e gestione
    while True:
        menu_principale = [
            "Salva e genera JSON",
            "Rivedi/Correggi associazioni",
            "Elimina un film dalla lista",
            "Ignora un file/cartella (non verrà più scansionato)",
            "Esci senza salvare"
        ]
        scelta_main = mostra_menu("GESTIONE LIBRERIA", menu_principale)
        
        if scelta_main == 0: # Salva
            break
        elif scelta_main == 4 or scelta_main == -1: # Esci
            sys.exit(0)
            
        elif scelta_main == 1: # Rivedi
            chiavi = list(risultati.keys())
            voci_assoc = []
            for k in chiavi:
                v = risultati[k]
                info = f"[{v.get('media_type', '??')}] {v.get('name', '')}{v.get('title', '')}" if v else "NON ASSOCIATO"
                voci_assoc.append(f"{os.path.basename(k)} -> {info}")
            
            idx = mostra_menu("Seleziona per correggere", voci_assoc)
            if idx != -1:
                target = chiavi[idx]
                risultati[target] = Trova(os.path.basename(target), pos=False)

        elif scelta_main == 2: # Elimina
            chiavi = list(risultati.keys())
            voci_del = [f"ELIMINA: {os.path.basename(k)}" for k in chiavi]
            idx = mostra_menu("Scegli cosa rimuovere dalla lista", voci_del)
            if idx != -1:
                del risultati[chiavi[idx]]
                print("Rimosso.")

        elif scelta_main == 3: # Ignora
            chiavi = list(risultati.keys())
            voci_ign = [f"IGNORA SEMPRE: {os.path.basename(k)}" for k in chiavi]
            idx = mostra_menu("Scegli cosa ignorare in futuro", voci_ign)
            if idx != -1:
                nome_item = os.path.basename(chiavi[idx])
                salva_esclusione(nome_item)
                del risultati[chiavi[idx]]
                print(f"'{nome_item}' aggiunto alle esclusioni.")

    # Salvataggio
    print("\nDownload dettagli avanzati...")
    movie_api = Movie()
    tv_api = TV()
    dati_completi = {}

    for path, info in risultati.items():
        if not info:
            dati_completi[path] = {"percorso_file": path, "info_ricerca": None, "info_dettagliate": None}
            continue

        item_id = info.get("id")
        media_type = info.get("media_type")
        info_dettagliate = None
        try:
            if media_type == 'movie': info_dettagliate = movie_api.details(item_id)
            elif media_type == 'tv': info_dettagliate = tv_api.details(item_id)
        except: pass

        dati_completi[path] = {
            "percorso_file": path,
            "info_ricerca": info,
            "info_dettagliate": info_dettagliate
        }

    nome_file_output = "libreria_media.json"
    with open(nome_file_output, "w", encoding="utf-8") as f:
        json.dump(dati_completi, f, indent=4, ensure_ascii=False, cls=TMDBEncoder)
    print(f"\nFatto! Salvato in {nome_file_output}")
