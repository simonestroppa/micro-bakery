# Forno di Quartiere — sito ordini per micro bakery

Sito completo per gestire le ordinazioni di una piccola panetteria/pasticceria:
menù pubblico con form ordine (ritiro o consegna), e pannello di amministrazione
per gestire prodotti e ordini in arrivo.

## Cosa include

- **Sito pubblico** (`/`): menù prodotti per categoria, carrello, form ordine
  con scelta ritiro/consegna, data e ora.
- **Pannello admin** (`/admin`): protetto da password, per gestire prodotti,
  vedere e aggiornare lo stato degli ordini, attivare/disattivare ritiro e
  consegna.
- **Immagini prodotto**: caricamento con ritaglio/inquadratura (formato
  4:3) direttamente dal form del pannello admin, salvate su Vercel Blob.
- **Notifiche nuovo ordine** (opzionali): email via Resend e/o WhatsApp via
  Twilio. Se non configurate, il sito funziona comunque: vedrai gli ordini
  nel pannello admin.
- **Database**: Postgres (es. [Neon](https://neon.tech), piano gratuito
  disponibile), tramite una singola variabile `DATABASE_URL`. Le tabelle
  vengono create/aggiornate automaticamente al primo avvio.

## 0. Metodo senza installare nulla (solo browser)

Se non puoi installare Node.js, Git o altri programmi sul tuo computer, puoi
pubblicare questo sito usando solo il browser: carica i file su GitHub
tramite "Upload files" (drag & drop, nessun comando), collega un database
Postgres gratuito su [Neon](https://neon.tech) (dashboard web, nessun CLI),
e collega tutto a [Vercel](https://vercel.com) per l'hosting. Non serve
eseguire `npm install` né alcuno script in locale: i prodotti si aggiungono
direttamente dal pannello admin del sito una volta online.
Vedi la spiegazione passo-passo completa in chat con Claude, oppure la
sezione 4 qui sotto per i dettagli sull'hosting.

## 1. Avvio in locale (alternativa, se hai Node.js disponibile)

Serve [Node.js](https://nodejs.org) versione 20 o superiore installato sul tuo
computer, e un database Postgres: il modo piu' rapido e' crearne uno
gratuito su [Neon](https://neon.tech) (bastano pochi click, poi copi la
"Connection string" dal dashboard).

```bash
# 1. Installa le dipendenze
npm install

# 2. Genera una password per il pannello admin
node scripts/hash-password.mjs "laTuaPasswordSicura"
# Copia la riga ADMIN_PASSWORD_HASH=... che stampa

# 3. Crea il file .env partendo dall'esempio
cp .env.example .env
# Apri .env e incolla:
# - DATABASE_URL: la connection string Postgres (es. da Neon)
# - ADMIN_PASSWORD_HASH ottenuto sopra
# Poi genera anche una SESSION_SECRET, ad esempio con:
openssl rand -base64 32
# e incollala come valore di SESSION_SECRET

# 4. (Facoltativo) popola il menu con alcuni prodotti di esempio
npm run seed

# 5. Avvia il sito in modalita' sviluppo
npm run dev
```

Il caricamento delle immagini prodotto (facoltativo in locale) richiede in
piu' un token `BLOB_READ_WRITE_TOKEN` di [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) — vedi i
commenti in `.env.example`. Senza questo token il sito funziona comunque,
semplicemente non potrai caricare immagini finche' non lo imposti.

Apri [http://localhost:3000](http://localhost:3000) per il sito pubblico e
[http://localhost:3000/admin/login](http://localhost:3000/admin/login) per
il pannello di gestione.

## 2. Personalizzare il negozio

- **Nome del negozio**: modifica `BAKERY_NAME` in `.env` e i testi
  nell'hero in `app/page.tsx`.
- **Prodotti**: aggiungili direttamente dal pannello admin (`/admin/prodotti`),
  non serve toccare il codice. Puoi anche caricare una foto per ogni
  prodotto: al momento della scelta del file si apre un editor per
  ritagliare/inquadrare l'immagine nel formato 4:3 usato nel catalogo.
- **Ritiro / consegna / preavviso minimo**: `/admin/impostazioni`.
- **Colori e font**: token di design in `app/globals.css` (sezione `:root`),
  font caricati in `app/layout.tsx`.

## 3. Attivare le notifiche nuovo ordine (facoltativo)

Puoi saltare questa parte all'inizio: gli ordini si vedono comunque nel
pannello admin. Quando vuoi ricevere anche un avviso automatico:

**Email (via [Resend](https://resend.com), piano gratuito disponibile)**
1. Crea un account su resend.com e verifica un dominio (o usa il dominio di
   test che offrono per iniziare).
2. Genera una API key.
3. In `.env` imposta `RESEND_API_KEY`, `RESEND_FROM` e `NOTIFY_EMAIL_TO`
   (la tua email dove vuoi ricevere l'avviso).

**WhatsApp (via [Twilio](https://www.twilio.com), sandbox gratuita per test)**
1. Crea un account Twilio e attiva la sandbox WhatsApp.
2. In `.env` imposta `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
   `TWILIO_WHATSAPP_FROM` (numero sandbox Twilio) e `NOTIFY_WHATSAPP_TO`
   (il tuo numero, nel formato `whatsapp:+39...`).

## 4. Mettere il sito online

Il modo piu' semplice e gratuito per iniziare e' **Vercel** (gli stessi
creatori di Next.js):

1. Crea un account gratuito su [vercel.com](https://vercel.com).
2. Carica questo progetto su GitHub (crea un nuovo repository e fai push
   della cartella).
3. Su Vercel scegli "Add New Project" e collega il repository GitHub.
4. Nelle impostazioni del progetto Vercel, aggiungi le stesse variabili
   d'ambiente che hai nel tuo `.env` locale (`DATABASE_URL`,
   `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, ecc.).
5. Per le immagini prodotto: su Vercel vai in Storage -> Create -> Blob e
   collega lo store al progetto, cosi' `BLOB_READ_WRITE_TOKEN` viene
   impostato automaticamente.
6. Fai il deploy. Vercel ti dara' un indirizzo tipo
   `tuo-forno.vercel.app`, a cui puoi poi collegare un dominio vero
   (es. `www.tuoforno.it`) dalle impostazioni del progetto.

**Nota sul database**: il sito usa Postgres, quindi il database va comunque
ospitato altrove (Vercel non fornisce Postgres incluso di default) — va
benissimo il piano gratuito di [Neon](https://neon.tech) o
[Supabase](https://supabase.com) usato anche in locale.

## 5. Struttura del progetto

```
app/
  page.tsx              sito pubblico (menu + carrello)
  admin/
    login/               login pannello admin
    (dashboard)/         pagine protette: panoramica, ordini, prodotti, impostazioni
  api/                   endpoint per prodotti, ordini, impostazioni, login
components/              componenti condivisi (carrello, card prodotto,
                         editor di ritaglio immagine, ecc.)
db/                      schema e connessione database (Drizzle + Postgres)
lib/                     autenticazione, impostazioni negozio, notifiche,
                         upload immagini (Vercel Blob)
scripts/                 seed prodotti di esempio, generazione password admin
```

## Bisogno di aiuto?

Se vuoi aggiungere pagamenti online, foto prodotto caricate direttamente
dall'admin, gestione di piu' negozi, o qualsiasi altra funzione, torna pure
in chat: possiamo costruirla insieme partendo da questa base.
