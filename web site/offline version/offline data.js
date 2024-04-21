//scriviamo una funzione con un vettore statico per non sprecare memoria con un elenco infinito di informazioni che possono essere prelevate tramite un'indice
//risparmiamo memoria a discapito del rallentamento causto dal dover creare il vettore statico ogni volta che chiamiamo la funzione
//per quanto riguarda i film già scaricati toglierli dall'elenco dei dowload e inserirli nell'elenco di preferenza, mettendo nei link di streaming i percorso assoluto di dove è stato salvato.
const categories = {
    'guardare': [
        3, 4, 6, 7, 8, 9,
        12, 14, 15, 16, 17, 18,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 39,
        40, 41, 42, 43, 44, 45, 48, 49,
        50, 51, 52, 53, 54, 56, 57, 58, 59,
        61, 63, 64, 65, 67, 68, 69,
        70, 71, 72, 73, 75, 77, 78,
        80, 81, 82, 83, 85, 86, 87, 88, 89,
        90, 91, 92, 93, 94, 95, 96, 97, 98, 99
    ],
    'visto': [1, 5, 13, 46, 55, 79],
    'download': [0, 10, 35, 37, 47, 76, 84],
    'stupendo': [2, 11, 19, 36, 38, 60, 62, 66, 74]
};

function get_films(pos) {
    let list = [
        new Film("10 cose che odio di te!",
            "10 things i hate about you!",
            "https://image.tmdb.org/t/p/original/jz1aH9vR1cHYsWPeAY3E7UMkxkH.jpg",
            "10 cose che odio di te (10 Things I Hate About You) è un film del 1999 diretto da Gil Junger, alla sua prima regia. Il titolo"
            + " della pellicola è ripreso da una poesia recitata nell'opera La bisbetica domata di William Shakespeare, di cui il film è una"
            + " versione cinematografica in chiave giovanile.",
            "", 97, 1999, "", ""),
        new Film("Un uomo tranquillo",
            "Cold Pursuit",
            "https://pad.mymovies.it/filmclub/2018/10/202/locandina.jpg",
            "Un uomo tranquillo (Cold Pursuit) è un film del 2019 diretto da Hans Petter Moland. La pellicola, con protagonista Liam Neeson, "
            + "è il remake del film del 2014 In ordine di sparizione (Kraftidioten), diretto dallo stesso Hans Petter Moland.",
            "", 118, 2019, "", ""),
        new Film("A qualcuno piace caldo",
            "Some Like It Hot",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Some_Like_It_Hot_%281959_poster%29.png/287px-Some_Like_It_Hot_%281959_poster%29.png",
            "A qualcuno piace caldo (Some Like It Hot) è un film del 1959 diretto da Billy Wilder. Considerato uno dei capolavori "
            + "della storia del cinema statunitense[2][3], il film, una divertente e sofisticata commedia della dualità[4], vinse un"
            + " Oscar e tre Golden Globe, tra cui il Golden Globe per la migliore attrice in un film commedia o musicale a Marilyn"
            + " Monroe e miglior attore in un film commedia o musicale a Jack Lemmon, che per la sua interpretazione ricevette anche"
            + " un premio BAFTA. Nel 1989 è stato scelto per la conservazione nel National Film Registry della Biblioteca del Congresso"
            + " degli Stati Uniti d'America[5]. Nel 1998 l'American Film Institute l'ha inserito al quattordicesimo posto della"
            + " classifica dei migliori cento film statunitensi di tutti i tempi[6], mentre dieci anni dopo, nella lista aggiornata,"
            + " è sceso al ventiduesimo posto[7]. Nel 2000 l'ha inserito al primo posto della classifica delle migliori cento commedie "
            + "statunitensi[8]. Nel 2005 la battuta «Well, nobody's perfect» (Beh, nessuno è perfetto) è stata inserita al "
            + "quarantottesimo posto della classifica delle migliori cento battute del cinema statunitense[9].",
            "", 120, 1959, "", ""),
        new Film("Delitti inquietanti",
            "The Glimmer Man",
            "https://image.tmdb.org/t/p/original/fBLU9JE6Wmz15YQRXpYqIggEKaq.jpg",
            "Il detective Jack Cole, attivo a New York, viene mandato a Los Angeles per indagare su un pericoloso serial killer che "
            + "è solito crocifiggere le sue vittime dopo averle uccise, fra cui la sua ex moglie.",
            "", 92, 1996, "", ""),
        new Film("Giochi di potere",
            "Patriot Games",
            "https://image.tmdb.org/t/p/original/f7HPxVL8KyH5LcFGw67tQkqwYb9.jpg",
            "",
            "", 117, 1992, "", ""),
        new Film("The Time Machine",
            "The Time Machine",
            "https://image.tmdb.org/t/p/original/ljrBMNFeDBrLGY3Iv5sg43esvjw.jpg",
            "",
            "", 96, 2002, "", ""),
        new Film("Due facce di un assassino",
            "Face off",
            "https://image.tmdb.org/t/p/original/iw6YBoXkdz6XltWVY6UpIJH6uxd.jpg",
            "",
            "", 103, 1997, "", ""),
        new Film("Vanguard",
            "急先鋒",
            "https://upload.wikimedia.org/wikipedia/en/8/84/Vanguard_poster.jpg",
            "",
            "", 108, 2020, "", ""),
        new Film("Profumo di donna",
            "Scent of a Woman",
            "https://image.tmdb.org/t/p/original/bgb8xw3YWhaoTlXnk1iPFHArY4Q.jpg",
            "",
            "", 157, 1992, "", ""),
        new Film("6 Underground",
            "6 Underground",
            "https://image.tmdb.org/t/p/original/lnWkyG3LLgbbrIEeyl5mK5VRFe4.jpg",
            "",
            "", 128, 2019, "", ""),
        new Film("The Tourist",
            "The Tourist",
            "https://image.tmdb.org/t/p/original/oXe1nw4HcS32YVpvxwsWEVdvEXA.jpg",
            "",
            "", 103, 2010, "", ""),
        new Film("Starman",
            "Starman",
            "https://www.themoviedb.org/t/p/w1280/4fKXWIiaLTQDvOS5Ok4XfD5qKJb.jpg",
            "",
            "", 115, 1984, "", ""),
        new Film("Il delinquente del rock and roll",
            "Jailhouse Rock",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Jailhouse_Rock_%281957_poster_-_one-sheet%29.jpg/293px-Jailhouse_Rock_%281957_poster_-_one-sheet%29.jpg",
            "",
            "", 96, 1957, "", ""),
        new Film("Blue Hawaii",
            "Blue Hawaii",
            "https://image.tmdb.org/t/p/original/kujIwcrOsgcyRLbs5xfwU1ADwHk.jpg",
            "",
            "", 102, 1961, "", ""),
        new Film("Fratelli rivali",
            "Love Me Tender",
            "https://image.tmdb.org/t/p/original/a1vVEgUuyYjnp5UVVqqu6124kFS.jpg",
            "",
            "", 89, 1956, "", ""),
        new Film("Lo sceriffo scalzo",
            "Follow That Dream",
            "https://image.tmdb.org/t/p/original/yOpq3KyiVDFis01ekc0DUcGxJg8.jpg",
            "",
            "", 109, 1962, "", ""),
        new Film("Cento ragazze e un marinaio",
            "Girls! Girls! Girls!",
            "https://image.tmdb.org/t/p/original/3L3QDcLp87CLcakOnbhJDUmQzPl.jpg",
            "",
            "", 106, 1962, "", ""),
        new Film("Zoolander",
            "Zoolander",
            "https://image.tmdb.org/t/p/original/8S8BUFyH8KIORgVZuTzcvKJmGiG.jpg",
            "",
            "", 89, 2001, "", ""),
        new Film("Poco leoni, molto ...",
            "Four Lions",
            "https://image.tmdb.org/t/p/original/lU9WFPChJ1CsD5kZuYoCdoAlbRd.jpg",
            "",
            "", 94, 2010, "", ""),
        new Film("Un weekend da bamboccioni",
            "Grown Ups",
            "https://image.tmdb.org/t/p/original/6VKb1o376uTby49JpuLEcK9ys3v.jpg",
            "",
            "", 102, 2010, "", ""),
        new Film("Fuori in 60 secondi",
            "Gone in 60 Seconds",
            "https://image.tmdb.org/t/p/original/1awMAcro7JCsD9fN3gvWaRpui4g.jpg",
            "",
            "", 117, 2000, "", ""),
        new Film("Arrivederci professore",
            "The Professor",
            "https://image.tmdb.org/t/p/original/zdPJ04UUGvcn7kJkvUzfUW4uRcc.jpg",
            "",
            "", 9, 2018, "", ""),
        new Film("The Majestic",
            "The Majestic",
            "https://image.tmdb.org/t/p/original/m9WrB91B8ghxIZhyFugkoSleBE7.jpg",
            "",
            "", 152, 2001, "", ""),
        new Film("Amici, amanti e...",
            "No Strings Attached",
            "https://image.tmdb.org/t/p/original/AjEkknAEPhbGCN0IkmT7mEPfED0.jpg",
            "",
            "", 98, 2011, "", ""),
        new Film("Il principe cerca moglie",
            "Coming to America",
            "https://image.tmdb.org/t/p/original/7EZUIAmWV1AaaClm3EVTVOs89dN.jpg",
            "",
            "", 116, 1988, "", ""),
        new Film("Segnali dal futuro",
            "Knowing",
            "https://image.tmdb.org/t/p/original/7xkAVXnrSW5SgpTo8Z5U3a1ZOW2.jpg",
            "",
            "", 117, 2009, "", ""),
        new Film("Il talento di Mr. C",
            "The Unbearable Weight of Massive Talent",
            "https://image.tmdb.org/t/p/original/2mgRecYtLE2hZO1yoYhLKZya640.jpg",
            "",
            "", 107, 2022, "", ""),
        new Film("I pinguini di Mr. Popper",
            "Mr. Popper's Penguins",
            "https://image.tmdb.org/t/p/original/rESWB1bGL2Co1hD8Af1D6E8Dkxl.jpg",
            "",
            "", 94, 2011, "", "https://www.youtube.com/watch?v=0GAIP6o2s48"),
        new Film("Un'impresa da Dio",
            "Evan Almighty",
            "https://image.tmdb.org/t/p/original/jJPKLAJ5KUOPk7GGArl2jLvnDI9.jpg",
            "",
            "", 96, 2007, "", ""),
        new Film("Notte prima degli esami - Oggi",
            "Notte prima degli esami - Oggi",
            "https://image.tmdb.org/t/p/original/zc43153cFR9uqbxILOqZnuaByyB.jpg",
            "",
            "", 102, 2007, "", ""),
        new Film("Tomorrowland - Il mondo di domani",
            "Tomorrowland",
            "https://image.tmdb.org/t/p/original/kziYpr5Nfw60P0My8aj1sgCEqed.jpg",
            "",
            "", 130, 2015, "", ""),
        new Film("strappare lungo i bordi",
            "",
            "",
            "serie tv netflix.",
            "", 0, 0, "", ""),
        new Film("I maghi del crimine",
            "Now You See Me",
            "https://image.tmdb.org/t/p/original/tWsNYbrqy1p1w6K9zRk0mSchztT.jpg",
            "",
            "", 115, 2013, "", ""),
        new Film("Now You See Me 2",
            "Now You See Me 2",
            "https://image.tmdb.org/t/p/original/tK30ssQuyfhrBXMgMTW5oO3htbi.jpg",
            "",
            "", 129, 2016, "", ""),
        new Film("Batman Begins",
            "Batman Begins",
            "https://image.tmdb.org/t/p/original/ijKpiStjMetB43uxOAXpE8RAQR7.jpg",
            "",
            "", 140, 2005, "", ""),
        new Film("Will Hunting - Genio ribelle",
            "Good Will Hunting",
            "https://image.tmdb.org/t/p/original/khZIGZMko7LVU7jMTdL2HNZ6QI7.jpg",
            "",
            "", 126, 1997, "", ""),
        new Film("C'era una volta a... Hollywood",
            "Once Upon a Time in Hollywood",
            "https://movieplayer.net-cdn.it/images/2019/07/22/cera-una-volta-a-hollywood-poster.jpg",
            "",
            "", 161, 2019, "", ""),
        new Film("Yes Man",
            "Yes Man",
            "https://image.tmdb.org/t/p/original/8Vk2nQF1kY34x53YnWd5zDaTht.jpg",
            "",
            "", 100, 2008, "", ""),
        new Film("La ragazza della porta accanto",
            "The Girl Next Door",
            "https://image.tmdb.org/t/p/original/lUL6PNWpW9BFvXIWWXUZszfXGGl.jpg",
            "",
            "", 109, 2004, "", ""),
        new Film("Facciamola finita",
            "This Is the End",
            "https://image.tmdb.org/t/p/original/7euGyduJTxAfwPA5waQ7PkBpwJW.jpg",
            "",
            "", 107, 2013, "", ""),
        new Film("Prima dell'alba",
            "Before Sunrise",
            "https://image.tmdb.org/t/p/original/gsSYVU9nUqCdSSRwMvuQv4akpdW.jpg",
            "",
            "", 101, 1995, "", ""),
        new Film("Smetto quando voglio",
            "Smetto quando voglio",
            "https://image.tmdb.org/t/p/original/wmYtqp01Xau2DvnKAVqZeSUawjh.jpg",
            "",
            "", 102, 2017, "", ""),
        new Film("Smetto quando voglio - Masterclass",
            "Smetto quando voglio - Masterclass",
            "https://image.tmdb.org/t/p/original/1t64gBY4x2JMYuNxvzdhILpiMP7.jpg",
            "",
            "", 118, 2017, "", ""),
        new Film("Smetto quando voglio - Ad honorem",
            "Smetto quando voglio - Ad honorem",
            "https://image.tmdb.org/t/p/original/guhMZZFeBAQMiHsssbcOGPA1laN.jpg",
            "",
            "", 102, 2017, "", ""),
        new Film("The Greatest Showman",
            "The Greatest Showman",
            "https://image.tmdb.org/t/p/original/kXHTyYMrJwuFGEXg5RXtJOboIpD.jpg",
            "",
            "", 105, 2017, "", ""),
        new Film("Il bisbetico domato",
            "Il bisbetico domato",
            "https://image.tmdb.org/t/p/original/4cDTwuuT8Zyl7zPSRltDIlMBO17.jpg",
            "",
            "", 104, 1980, "", ""),
        new Film("Fidanzata in affitto",
            "No Hard Feelings",
            "https://image.tmdb.org/t/p/original/2HpLrqxZXKpuxTQpyAo7Cdf5AF4.jpg",
            "",
            "", 103, 2023, "", ""),
        new Film("Su×bad - Tre menti sopra il pelo",
            "Superbad",
            "https://image.tmdb.org/t/p/original/9ifmORLRmCfhpdWw9e2fFJfwI4c.jpg",
            "",
            "", 113, 2007, "", ""),
        new Film("Una notte da leoni",
            "The Hangover",
            "https://www.themoviedb.org/t/p/w1280/3hc7c0AL1VZ4dh2fae4SryeOpmp.jpg",
            "",
            "", 99, 2009, "", ""),
        new Film("Una notte da leoni 2",
            "The Hangover Part II",
            "https://www.themoviedb.org/t/p/w1280/ayb4BKsLaiqOOOuOj7V2xnJYT8d.jpg",
            "",
            "", 101, 2011, "", ""),
        new Film("Una notte da leoni 3",
            "The Hangover Part III",
            "https://www.themoviedb.org/t/p/w1280/mNiD4pO8zFkR8utEps07bEfk2BC.jpg",
            "",
            "", 100, 2013, "", ""),
        new Film("Notte prima degli esami",
            "Notte prima degli esami",
            "https://www.themoviedb.org/t/p/w1280/d7IhjqqCQSQchXjoYGdFFZOhxvK.jpg",
            "",
            "", 95, 2006, "", ""),
        new Film("Good Boys - Quei cattivi ragazzi",
            "Good Boys",
            "https://image.tmdb.org/t/p/original/aMZXB1LkwiSBIOEJsPLTRKCoUIO.jpg",
            "",
            "", 89, 2019, "", ""),
        new Film("La quinta onda",
            "The 5th Wave",
            "https://image.tmdb.org/t/p/original/5FHeJI9BnAXfZ840njB5NThim3O.jpg",
            "",
            "", 112, 2016, "", ""),
        new Film("In Time",
            "In Time",
            "https://image.tmdb.org/t/p/original/kyuXWPU7KLGD6yIfhCVk59LF0KN.jpg",
            "",
            "", 109, 2011, "", ""),
        new Film("La ricerca della felicità",
            "The Pursuit of Happyness",
            "https://www.themoviedb.org/t/p/w1280/dKfwffncCU7XsecrRwDkvooe16m.jpg",
            "",
            "", 117, 2006, "", ""),
        new Film("Source Code",
            "Source Code",
            "https://image.tmdb.org/t/p/original/zmB89JlUiFgOn3qkMvhB1VVJ82I.jpg",
            "",
            "", 93, 2011, "", ""),
        new Film("",
            "",
            "",
            "",
            "", 0, 0, "", ""),
        new Film("Il talento di Mr. Ripley",
            "The Talented Mr. Ripley",
            "https://image.tmdb.org/t/p/original/nGpHw0ni3CxRYP0hOrJ75qmZnkW.jpg",
            "",
            "", 139, 1999, "", ""),
        new Film("50 e 50",
            "50/50",
            "https://image.tmdb.org/t/p/original/8f9tM9JVB4ETBhxlQcXIjLckArl.jpg",
            "",
            "", 100, 2011, "", ""),
        new Film("Sliding Doors",
            "Sliding Doors",
            "https://image.tmdb.org/t/p/original/s8VOVTywXZIIHqdEjkCZziH0ebq.jpg",
            "",
            "", 99, 1998, "", ""),
        new Film("La forza del campione",
            "Peaceful Warrior",
            "https://image.tmdb.org/t/p/original/r4VQCZe3aSo7TmmsxcyLqaoMR1l.jpg",
            "",
            "", 120, 2006, "", ""),
        new Film("",
            "",
            "",
            "",
            "", 0, 0, "", ""),
        new Film("Don Juan De Marco - Maestro d'amore",
            "Don Juan De Marco",
            "https://th.bing.com/th/id/R.d53495fe504721d2b56117e7622a4476?rik=3vrtbV%2bsxZ9ZiA&riu=http%3a%2f%2fwww.giorgiopaciarelli.it%2fwp-content%2fuploads%2f2017%2f03%2fcome-costruire-un-ciak-cinematografico_5d3d490dfd209b7e0a467d505c7b096e.jpg&ehk=Lawo4F8sGwWdD0cWm1sdOCH%2fCExtZTWQRgS7fDye4xc%3d&risl=&pid=ImgRaw&r=0",
            "",
            "", 97, 1995, "", ""),
        new Film("G.I. Joe - La nascita dei Cobra",
            "G.I. Joe: The Rise of Cobra",
            "https://image.tmdb.org/t/p/original/ibQuFwe8Ezb7ADlII2W9q2GWE9u.jpg",
            "",
            "", 118, 2009, "", ""),
        new Film("Questione di tempo",
            "About Time",
            "https://image.tmdb.org/t/p/original/nwI3bfgost0wWbJG9OgP6VaXA7g.jpg",
            "",
            "", 123, 2013, "", ""),
        new Film("Collateral Beauty",
            "Collateral Beauty",
            "https://image.tmdb.org/t/p/original/pVIAPiIvHcitgXV8BA7uTyCcEuk.jpg",
            "",
            "", 97, 2016, "", ""),
        new Film("Il grande match",
            "Grudge Match",
            "https://image.tmdb.org/t/p/original/x0Xu0GdmgbgGI3SrXUerOU6jA9J.jpg",
            "de niro contro stallone",
            "", 113, 2013, "", ""),
        new Film("Mr. Deeds",
            "Mr. Deeds",
            "https://image.tmdb.org/t/p/original/rtUGG5gfpsF3uI52pgkzwsSfVlB.jpg",
            "",
            "", 96, 2002, "", ""),
        new Film("Luci della ribalta",
            "Limelight",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Limelight_%281952%29_-_original_theatrical_poster.jpeg/297px-Limelight_%281952%29_-_original_theatrical_poster.jpeg",
            "",
            "", 137, 1952, "", ""),
        new Film("",
            "",
            "",
            "",
            "", 0, 0, "", ""),
        new Film("Le pagine della nostra vita",
            "The Notebook",
            "https://image.tmdb.org/t/p/original/lfA4GW15zJd7Xn4pWkFMyMUDOyi.jpg",
            "",
            "", 123, 2004, "", ""),
        new Film("Before We Go",
            "Before We Go",
            "https://www.themoviedb.org/t/p/w1280/hbWU6Q6owywuCzLRSJ0Nzxh0E2E.jpg",
            "",
            "", 95, 2014, "", ""),
        new Film("L'attimo fuggente",
            "Dead Poets Society",
            "https://image.tmdb.org/t/p/original/hmGAF5NDoYB6S39UONevjHCESOI.jpg",
            "",
            "", 124, 1989, "", ""),
        new Film("Batman: The Killing Joke",
            "Batman: The Killing Joke",
            "https://image.tmdb.org/t/p/original/lrQ3LeNIN0nmviZ692seNBUl1Pq.jpg",
            "",
            "", 77, 2016, "", ""),
        new Film("Non è mai troppo tardi",
            "The Bucket List",
            "https://image.tmdb.org/t/p/original/7Xmwg9VnzhYHlyhOIpp5UkYWwDg.jpg",
            "",
            "", 97, 2007, "", ""),
        new Film("",
            "",
            "",
            "",
            "", 0, 0, "", ""),
        new Film("La tomba delle lucciole",
            "火垂るの墓",
            "https://image.tmdb.org/t/p/original/kwXG1DSpciHsBvcBojqMqGkU7pe.jpg",
            "",
            "", 93, 1988, "", ""),
        new Film("Scrivimi ancora",
            "Love, Rosie",
            "https://image.tmdb.org/t/p/original/chzeHGagHF1Oflcq9Et9ZFUYHDU.jpg",
            "",
            "", 102, 2014, "", ""),
        new Film("Zodiac",
            "Zodiac",
            "https://image.tmdb.org/t/p/original/6YmeO4pB7XTh8P8F960O1uA14JO.jpg",
            "",
            "", 157, 2007, "", ""),
        new Film("Exam",
            "Exam",
            "https://image.tmdb.org/t/p/original/i1J2zBCyOQJKsQipqJ0qXERC1Ma.jpg",
            "",
            "", 101, 2009, "", ""),
        new Film("Red Lights",
            "Red Lights",
            "https://image.tmdb.org/t/p/original/7h7jnVwtvefnyvUDLVj05XuS45l.jpg",
            "",
            "", 118, 2012, "", ""),
        new Film("Anatomia di una caduta",
            "Anatomie d'une chute",
            "https://image.tmdb.org/t/p/original/yq8eLLU4ef6EkCInk3tA9ktuX4S.jpg",
            "",
            "", 150, 2023, "", ""),
        new Film("A Beautiful Mind",
            "A Beautiful Mind",
            "https://image.tmdb.org/t/p/original/26uu1IKOs81D7Pfz1iC9FgrwAk9.jpg",
            "",
            "", 135, 2001, "", ""),
        new Film("Coach Carter",
            "Coach Carter",
            "https://th.bing.com/th/id/R.c1c104a7dc8d807fe027b88919354f35?rik=34i9nCkIiC9Dsg&riu=http%3a%2f%2fstatic.rogerebert.com%2fuploads%2fmovie%2fmovie_poster%2fcoach-carter-2005%2flarge_ijyyo95Z1c7gFqH8zuqgL9OzI77.jpg&ehk=W%2baL09jE%2fKJmWMAnrhpKLIKxJaFEV8Q3nXS%2fUN3gBmU%3d&risl=&pid=ImgRaw&r=0",
            "",
            "", 136, 2005, "", ""),
        new Film("Il sapore della vittoria",
            "Remember the Titans",
            "https://th.bing.com/th/id/R.c2b283bdbcc17da37a52d607fe30cb1d?rik=%2bW8CFQCXqsaFbg&riu=http%3a%2f%2fstatic.rogerebert.com%2fuploads%2fmovie%2fmovie_poster%2fremember-the-titans-2000%2flarge_iI12IRzif2VjTkQJRDQw3WyWKdS.jpg&ehk=N0EBJwebGmG86sdPBuhafHvf4AiWz7RUjPBNp86cmso%3d&risl=&pid=ImgRaw&r=0",
            "",
            "", 113, 2000, "", ""),
        new Film("Il grande dittatore",
            "The Great Dictator",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/The_Great_Dictator_%281940%29_poster.jpg/299px-The_Great_Dictator_%281940%29_poster.jpg",
            "",
            "", 125, 1940, "", ""),
        new Film("Le ali della libertà",
            "The Shawshank Redemption",
            "https://image.tmdb.org/t/p/original/9OxcvTJwZDjQTFvY2NxiwnSrQS6.jpg",
            "",
            "", 142, 1994, "", ""),
        new Film("Ex Machina",
            "Ex Machina",
            "https://image.tmdb.org/t/p/original/uOfFwhoOnquwScn4jLT7aJ0ijvd.jpg",
            "",
            "", 108, 2015, "", ""),
        new Film("Il premio",
            "Il premio",
            "https://image.tmdb.org/t/p/original/45DhCmjVGfTZwUZYgGzynF9hmg.jpg",
            "",
            "", 100, 2017, "", ""),
        new Film("Profumo di donna",
            "Profumo di donna",
            "https://image.tmdb.org/t/p/original/wBSMKhXrrRd1WBbfxebvkJaSsxw.jpg",
            "",
            "", 102, 1974, "", "")
    ];
    if (pos === true)
        return list;
    else {
        let returner = [];
        for (let index = 0; index < pos.length; index++) {
            returner.push(list[pos[index]]);
        }
        return returner;
    }
}

function filter_type(type_names) {
    return get_films(categories[type_names]);
}

function stringMatching(string, search) {
    function character_frequency(s1, s2) {
        let count = 0;
        for (let index = 0; index < Math.min(s1.length, s2.length); index++) {
            if (s1[index] == s2[index]) {
                count += 1;
            }
            else {
                let distance = 0;
                //andremo a cercare questa lettera, il contributo al count sarà
                //proporzionale alla distanza a cui verrà trovata la prima occorrenza, se
                //non viene trovata si toglierà al count l'inverso della lunghezza della
                //parola (ovvero 1/l)
                for (let l = 0; l < s2.length && distance == 0; l++) {
                    if (l <= index) {
                        //controllo all'indietro
                        if (s1[index] == s2[index - l])
                            distance = l;
                    }
                    if (l + index < s2.length) {
                        //controllo in avanti
                        if (s1[index] == s2[index + l])
                            distance = l;
                    }
                }
                if (distance == 0) { //lettera non trovata
                    count -= 1 / Math.min(s1.length, s2.length)
                } else {
                    count += 1 / distance;
                }
            }
        }
        console.log("'" + s1 + "' è compatibile con '" + s2 + "' per il " + count / search.length + "% [" + count + " caratteri pesati in comune]");
        //rapporto alla lunghezza
        return count / search.length;
    }
    if (string.includes(search))
        return 100;
    if (string.toLowerCase().includes(search.toLowerCase()))
        return 99;
    let match = 0;
    match += 100 * character_frequency(string, search);
    return match;
}

function offline_research(string, type_names) {
    let search_targets = [];
    let found = [];
    if (type_names.length > 0) {
        for (let index = 0; index < type_names.length; index++) {
            search_targets = search_targets.concat(filter_type(type_names[index]));
        }
    }
    else {
        search_targets = get_films(true);
    }
    //console.log("search_targets: ");
    //console.log(search_targets);
    if (!string) {
        found = search_targets;
        //console.log("stringa di ricerca vuota, found: ");
        //console.log(found);
    } else {
        inner_found = { 'titolo': [], 'title': [] }
        for (let index = 0; index < search_targets.length; index++) {
            let tmp = search_targets[index];
            if (stringMatching(tmp.ti, string) > 75)
                inner_found['titolo'].push(tmp);
            else
                if (stringMatching(tmp.to, string) > 75)
                    inner_found['title'].push(tmp);
        }
        found = inner_found['titolo'].concat(inner_found['title']);
    }
    //console.log("risultati ricerca \'" + string + "\' nelle categorie\'" + type_names + "\': ");
    //console.log(found);
    return found;
}

function criterio(list, logic_filter) { //esempio di utilizzo fitraggio per anno:     criterio(found,(film)=>{return film.anno < min || film.anno > max})
    if (logic_filter(/*film in valutazione*/)) { }
}