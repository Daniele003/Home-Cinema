import os
import re
import sys
import json
from tmdbv3api import TMDb, Search, Movie, TV

#*************************************************************************************************************************************************************************************************************************************************************************
# CONFIGURAZIONE
#*************************************************************************************************************************************************************************************************************************************************************************
API_Read_Access_Token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4Y2ExNmRiNmU0N2E4NmEyZmRlOWQ2ZDI5OTNlNWJhNiIsIm5iZiI6MTY2NzMyMjg3NC40NDMsInN1YiI6IjYzNjE1M2ZhZmQ2MzAwMDA3ZTQxZWRmOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.H0o69tt66TehWh8ZDxlAn-64pjRuH2rAZVJjwy__rVc"
tmdb = TMDb()
tmdb.api_key = '8ca16db6e47a86a2fde9d6d2993e5ba6'
tmdb.language = 'it'
#*************************************************************************************************************************************************************************************************************************************************************************

class TMDBEncoder(json.JSONEncoder):
    """
    Spiega a json.dump come gestire gli oggetti custom AsObj di tmdbv3api.
    Quando incontra un oggetto non standard, ne estrae il dizionario interno.
    """
    def default(self, obj):
        if hasattr(obj, 'entries'):
            return obj.entries
        elif hasattr(obj, '_entries'):
            return obj._entries
        elif hasattr(obj, '__dict__'):
            return obj.__dict__
        return super().default(obj)

def levenshtein_distance(s1: str, s2: str) -> int:
    """
    Calcola la distanza di Levenshtein tra due stringhe.
    La distanza rappresenta il numero minimo di operazioni
    (inserimento, cancellazione, sostituzione) per trasformare s1 in s2.
    """
    # Validazione input
    if not isinstance(s1, str) or not isinstance(s2, str):
        raise TypeError("Entrambi i parametri devono essere stringhe.")

    len_s1, len_s2 = len(s1), len(s2)

    # Matrice (len_s1+1) x (len_s2+1)
    dp = [[0] * (len_s2 + 1) for _ in range(len_s1 + 1)]

    # Inizializzazione prima riga e colonna
    for i in range(len_s1 + 1):
        dp[i][0] = i
    for j in range(len_s2 + 1):
        dp[0][j] = j

    # Riempimento matrice
    for i in range(1, len_s1 + 1):
        for j in range(1, len_s2 + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,      # Cancellazione
                dp[i][j - 1] + 1,      # Inserimento
                dp[i - 1][j - 1] + cost  # Sostituzione
            )

    return dp[len_s1][len_s2]    
    

def scan_directory(directory):
    """
    scans the given directory and returns a list of all files and subdirectories within it.

    Args:
        directory (str): The path to the directory to scan.

    Returns:
        list: A list of file and subdirectory names within the specified directory.
    """
    return os.listdir(directory)

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
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, vecchie_impostazioni)
        return None

def mostra_menu(titolo, opzioni):
    selezione_corrente = 0
    totale_opzioni = len(opzioni)
    
    # Calcoliamo quante righe totali stampa il nostro menu
    # (Titolo + linee di separazione + opzioni)
    righe_da_sovrascrivere = 1 + 3 + totale_opzioni

    # Prima stampa iniziale del menu
    print("#" * 2 * len(titolo))
    print(f"    {titolo}")
    print("#" * 2 * len(titolo))
    for indice, opzione in enumerate(opzioni):
        if indice == selezione_corrente:
            print(f"\033[1;32m > {opzione} \033[0m")
        else:
            print(f"   {opzione}")
    print("#" * 2 * len(titolo))

    while True:
        tasto = leggi_tasto()

        if tasto in ('SU', 'GIU'):
            if tasto == 'SU':
                selezione_corrente = (selezione_corrente - 1) % totale_opzioni
            elif tasto == 'GIU':
                selezione_corrente = (selezione_corrente + 1) % totale_opzioni

            # IL TRUCCO: Muove il cursore in su di X righe senza cancellare lo schermo
            # \033[{righe_da_sovrascrivere}A muove il cursore verso l'alto
            # \r riporta il cursore all'inizio della linea
            sys.stdout.write(f"\033[{righe_da_sovrascrivere}A\r")
            
            # Ristampa il menu aggiornato sopra quello vecchio
            print("#" * 2 * len(titolo))
            print(f"    {titolo}")
            print("#" * 2 * len(titolo))
            for indice, opzione in enumerate(opzioni):
                if indice == selezione_corrente:
                    print(f"\033[1;32m > {opzione} \033[0m")
                else:
                    print(f"   {opzione}")
            print("#" * 2 * len(titolo))
            sys.stdout.flush()

        elif tasto == 'INVIO':
            return selezione_corrente
#*************************************************************************************************************************************************************************************************************************************************************************


#*************************************************************************************************************************************************************************************************************************************************************************
# ASSOCIAZIONE DEL NOME DI UN FILE O DI UNA CARTELLA AD UN FILM O AD UNA SERIE TV
#*************************************************************************************************************************************************************************************************************************************************************************
def pulisci_nome_file(filename):
    """Rimuove l'estensione e pulisce i tag tipici dei file video"""
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
        
    # Facciamo UNA SOLA chiamata all'API passando il nome come query
    risultati = Search().multi(nome)
    
    # 1. Controlliamo che la ricerca sia andata a buon fine
    if not risultati.get("results"):
        print(f_name + " non ha nessuna corrispondenza")
        if pos:
            return None
        else:
            return Trova(input("Inserisci il titolo del film da cercare: "), pos=False)
        
    # Estraiamo la vera e propria lista di film e serie tv
    lista_items = risultati["results"]
    
    # 2. Filtriamo usando .get() visto che ora iteriamo su dizionari
    media_filtrati = [r for r in lista_items if r.get("media_type") in ['movie', 'tv']]

    # Controllo di sicurezza: e se ci sono risultati ma NESSUNO è movie/tv?
    if not media_filtrati:
        print(f_name + " ha dei risultati, ma nessuno è un film o serie TV validi.")
        if pos:
            return None
        else:
            return Trova(input("Inserisci il titolo del film da cercare: "), pos=False)

    # 3. Assegnazione del risultato finale
    if pos:
        # Se pos supera la lunghezza della lista, prendiamo l'ultimo per evitare IndexError
        if len(media_filtrati) < pos:
            final_result = media_filtrati[-1]
        else:
            final_result = media_filtrati[pos - 1]
    else:
        voci = ["Il titolo corretto del film non è presente nella lista"]
        voci.extend([f"{v.get('name', '')}{v.get('title', '')} ({v.get('first_air_date', '')}{v.get('release_date', '')}) [{v.get('media_type', '')}]" for v in media_filtrati])
        
        selezione = mostra_menu(f"Seleziona il film corretto da associare a {f_name}", voci)
        
        # Correggiamo la logica: se sceglie 0 (l'opzione non presente)
        if selezione == 0:
            return Trova(input("Inserisci il titolo del film da cercare: "), pos=False)
        else:
            # Ricordiamo che gli indici dei film partono da 1 in 'voci', 
            # quindi dobbiamo sottrarre 1 per cercare in 'media_filtrati'
            final_result = media_filtrati[selezione - 1]
    
    # 4. Stampiamo l'esito usando .get() per prevenire crash su chiavi mancanti
    if final_result.get("media_type") == 'tv':
        print(f_name + "\t è stato associato alla serie tv \t" + final_result.get("name", "Sconosciuto"))
    else:
        titolo = final_result.get("title", "Sconosciuto")
        data = final_result.get("release_date", "Data non disponibile")
        print(f_name + "\t è stato associato al film \t" + titolo + " (" + data + ")")
        
    return final_result
#*************************************************************************************************************************************************************************************************************************************************************************


if __name__ == "__main__":
    risultati = {}
    paths = []
    directory = ""
    while directory.lower() != 'exit':
        # scansione del file system ed estrazione dei titoli da cercare
        directory = input("Enter a directory path to scan (or type 'exit' to quit): ").replace("\\","/")
        if directory[-1] == "/":
            directory = directory[:-1]
        if os.path.isdir(directory):
            paths.append(directory)
            files_and_dirs = scan_directory(directory)
            print(f"Contents of '{directory}':")
            # associazione predefinita dei file al primo risultato della ricerca
            for item in files_and_dirs:
                risultati[directory + "/" + item] = Trova(item)
        else:
            print(f"'{directory}' is not a valid directory. Please try again.")

    # controllo della correttezza delle associazioni
    # loop di correzione degli errori di associazione
    while mostra_menu("Tutte le associazioni sono corrette?", ["sì","no"]):
        associazioni = ["Nessuna"]
        associazioni.extend([f"{k}\t --> \t [{v.get('media_type', '')}] {v.get('name', '')}{v.get('title', '')} ({v.get('first_air_date', '')}{v.get('release_date', '')})" if v else f"{k}\t --> \t {v}" for k, v in risultati.items()])
        scelta = mostra_menu("Seleziona l'associazione da cambiare:", associazioni)
        if scelta:
            obbiettivo = list(risultati.keys())[scelta - 1]
            risultati[obbiettivo] = Trova(obbiettivo, pos=False)

# ... (fine del ciclo di correzione delle associazioni) ...

    print("\nDownload dei dettagli avanzati in corso. Attendi...")
    
    movie_api = Movie()
    tv_api = TV()
    
    dati_completi = {}

    # download dei dettagli di ogni film per completare i dati
    for path, info in risultati.items():
        if not info:
            # Se l'associazione è vuota o None, salviamo comunque il percorso
            dati_completi[path] = {
                "percorso_file": path,
                "info_ricerca": None,
                "info_dettagliate": None
            }
            continue

        item_id = info.get("id") if isinstance(info, dict) else getattr(info, 'id', None)
        media_type = info.get("media_type") if isinstance(info, dict) else getattr(info, 'media_type', None)
        
        info_dettagliate = None
        
        try:
            if media_type == 'movie':
                info_dettagliate = movie_api.details(item_id)
            elif media_type == 'tv':
                info_dettagliate = tv_api.details(item_id)
                
        except Exception as e:
            print(f"Errore durante il download dei dettagli per '{path}': {e}")

        # Salviamo direttamente gli oggetti estratti dall'API. 
        # Sarà il nostro TMDBEncoder a tradurli tutti in JSON valido!
        dati_completi[path] = {
            "percorso_file": path,
            "info_ricerca": info,
            "info_dettagliate": info_dettagliate
        }

    # salvataggio nel file JSON
    nome_file_output = "libreria_media.json"
    try:
        # Aggiungiamo cls=TMDBEncoder alla funzione dump
        with open(nome_file_output, "w", encoding="utf-8") as f:
            json.dump(dati_completi, f, indent=4, ensure_ascii=False, cls=TMDBEncoder)
            
        print(f"\nOperazione completata! Dati salvati con successo in '{nome_file_output}'.")
    except Exception as e:
        print(f"\nErrore critico durante il salvataggio del file JSON: {e}")