# Home Cinema

Il progetto conserva l’interfaccia originale e mantiene i due cataloghi nella stessa pagina durante la navigazione. Il catalogo TMDB continua a caricarsi in sottofondo quando si apre quello locale. Una copia dei dati online viene conservata nel browser (IndexedDB): al successivo caricamento della pagina viene mostrata subito e aggiornata in background. Se l’aggiornamento fallisce, rimane disponibile l’ultima copia completa. Le impostazioni di ricerca, filtri e ordinamento sono conservate separatamente per ciascun catalogo nel browser.

## Ricerca, filtri e ordinamento

La ricerca confronta i titoli italiani e originali, senza distinguere maiuscole e accenti. È possibile selezionare più liste o più generi: all’interno di ogni gruppo basta una corrispondenza; tra ricerca, liste e generi le condizioni si combinano. I pulsanti selezionati possono essere premuti di nuovo per deselezionarli.

Gli ordinamenti disponibili sono **Titolo** (alfabetico), **Anno** e **Voto** (dal più alto al più basso), **Durata** (dalla più breve alla più lunga). I dati mancanti sono collocati in fondo. La durata viene richiesta a TMDB soltanto quando si sceglie questo ordinamento; per le serie si usa la durata disponibile degli episodi. Se il browser è offline o TMDB non fornisce un dato, alcune durate possono non essere disponibili.

## Catalogo locale

`scanner.py` aggiorna `local-data.js` senza sovrascrivere `local.html`; eseguilo dalla cartella del progetto dopo aver installato le dipendenze con `pip install -r requirements.txt`. La scansione sostituisce l’elenco generato con i risultati correnti; in presenza di file non associati chiede conferma e non sostituisce un catalogo valido con uno vuoto. I percorsi locali devono essere accessibili sul dispositivo in uso; molti browser impediscono a una pagina web di aprire direttamente file `file://`.

## Verifiche

Per i test automatici JavaScript serve Node.js 22 o successivo. Eseguire `npm install` e poi `npm test`. Per verificare lo scanner, dopo aver installato le dipendenze Python, eseguire `python3 -m unittest discover -s tests -p 'test_*.py'`. I test simulano le risposte TMDB e non modificano l’account.

## Sicurezza

Il progetto originale contiene credenziali TMDB nel codice sorgente e nel repository pubblico. Una credenziale inserita nel JavaScript di una pagina web è leggibile da chiunque possa accedere alla pagina: è opportuno revocare/ruotare quella esistente e spostare l’accesso TMDB su un server con credenziali protette prima della pubblicazione.
