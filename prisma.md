# Guia de Prisma - WHOisWHO

Prisma és l'eina que fem servir per comunicar el nostre codi (TypeScript) amb la base de dades (PostgreSQL). Actua com un "traductor" (ORM) que converteix les nostres crides d'objectes en consultes SQL.

## 1. Estructura del Projecte

Tot gira al voltant del fitxer: `backend/prisma/schema.prisma`

Aquest fitxer és la **Font de la Veritat**. Aquí definim les taules (`models`) i les relacions.

### Els nostres Models

Actualment tenim:

- **User**: Guarda la informació de registre (username, password).
- **Stats**: Guarda les estadístiques de joc (victòries, derrotes).

### La Relació (1 a 1)

Tenim una relació "Un a Un" entre User i Stats.

- Un **User** té (opcionalment) unes **Stats**.
- Unes **Stats** pertanyen (obligatòriament) a un **User**.

> **Nota sobre l'Esborrat:** Hem configurat `onDelete: Cascade`. Això vol dir que si esborres un User, la base de dades **esborrarà automàticament** les seves Stats per evitar errors.

## 2. Flux de Treball (Comandes Clau)

Aquestes són les comandes que faràs servir habitualment:

### `npx prisma db push`

- **Quan:** Cada vegada que modifiquis el `schema.prisma`.
- **Què fa:** "Empempeny" els canvis directament a la base de dades (crea taules, modifica columnes...).
- **Ús:** Entorn de desenvolupament (com ara).

### `npx prisma generate`

- **Quan:** També quan modifiquis el `schema.prisma`.
- **Què fa:** Actualitza el codi dins de `node_modules`.
- **Per què:** Perquè TypeScript sàpiga que ara existeix `prisma.user` o `prisma.stats`. Si no ho fas, el VS Code no t'autocompletarà els nous camps.

### `npx prisma studio`

- **Quan:** Quan vulguis veure/editar les dades visualment.
- **Què fa:** Obre una web (GUI) per navegar per la base de dades. És com un Excel per al teu Postgres.

## 3. Resolució de Problemes Freqüents

- **Error "User table does not exist"**: La DB està buida. Executa `npx prisma db push`.
- **Error al Debugger (fitxers interns)**: Prisma té molt codi intern complex. Al `launch.json` hem configurat `skipFiles` per ignorar-lo i que només s'aturi al teu codi.
- **Error P2003 (Foreign Key)**: Intentes esborrar un pare (User) que té fills (Stats). Amb el canvi actual (`Cascade`) això ja no hauria de passar.

---

**Resum ràpid:**

1. Modifiques `schema.prisma`.
2. `npx prisma db push` (Actualitza DB).
3. `npx prisma generate` (Actualitza TS).
4. Restart Debugger.
