# Calendaroo

**Calendaroo** to aplikacja do zarządzania czasem i harmonogramami, stworzona w oparciu o React na frontendzie i Node.js z SQLite na backendzie. Aplikacja umożliwia planowanie wydarzeń, obliczanie przepracowanych godzin oraz wynagrodzenia.

## Funkcjonalności

- **Kalendarz**:
  - Wyświetlanie wydarzeń w układzie miesięcznym.
  - Wyróżnianie dni z zaplanowanymi wydarzeniami.
  
- **Zarządzanie wydarzeniami**:
  - Dodawanie, edytowanie i usuwanie wydarzeń.
  - Wprowadzanie szczegółów wydarzeń, takich jak czas trwania czy wynagrodzenie za godzinę.
  
- **Obliczenia**:
  - Automatyczne obliczanie całkowitego czasu przepracowanego w danym okresie.
  - Kalkulacja łącznego wynagrodzenia na podstawie stawki godzinowej.

- **Przyjazny interfejs**:
  - Responsywny design stworzony w Tailwind CSS.
  - Intuicyjny układ dla lepszej organizacji czasu.

## Technologie

### Frontend
- **React**: Framework do budowy dynamicznego interfejsu użytkownika.
- **Tailwind CSS**: Narzędzie do szybkiego tworzenia stylów i responsywności.

### Backend
- **Node.js**: Serwer obsługujący żądania API.
- **Express**: Framework webowy ułatwiający tworzenie endpointów API.
- **SQLite**: Lekka baza danych do przechowywania informacji o wydarzeniach.

## Instalacja

1. **Sklonuj repozytorium**:
   ```bash
   git clone https://github.com/username/calendaroo.git
   cd calendaroo
   ```

2. **Zainstaluj zależności**:
   - Backend:
     ```bash
     cd backend
     npm install
     ```
   - Frontend:
     ```bash
     cd frontend
     npm install
     ```

3. **Uruchom aplikację**:
   - Backend:
     ```bash
     cd backend
     npm start
     ```
   - Frontend:
     ```bash
     cd frontend
     npm start
     ```

4. **Otwórz aplikację**:
   W przeglądarce otwórz [http://localhost:3000](http://localhost:3000).

## Struktura projektu

```
calendaroo/
├── backend/          # Kod backendowy Node.js
│   ├── server.js     # Główny plik serwera
│   └── database.db  # Plik SQLite
├── frontend/         # Kod frontendowy React
│   ├── src/
│   │   └── components/ # Komponenty React
│   └── public/      # Pliki statyczne
└── README.md         # Dokumentacja projektu
```

## Endpointy API

| Metoda | Endpoint          | Opis                          |
|--------|-------------------|-------------------------------|
| GET    | `/events`         | Pobiera listę wydarzeń.      |
| POST   | `/events`         | Dodaje nowe wydarzenie.       |
| PUT    | `/events/:id`     | Aktualizuje wybrane wydarzenie. |
| DELETE | `/events/:id`     | Usuwa wydarzenie.             |

## Przyszłe funkcje
- Powiadomienia e-mail o nadchodzących wydarzeniach.
- Eksport danych do plików CSV/PDF.
- Obsługa wielu użytkowników.
- Widok tygodniowy.

## Wkład w rozwój
Zapraszamy do współpracy! Wszelkie sugestie i pull requesty są mile widziane.

1. Sforkuj projekt.
2. Utwórz nową gałąź:
   ```bash
   git checkout -b nazwa-funkcji
   ```
3. Wprowadź zmiany i stwórz commit:
   ```bash
   git commit -m "Dodano nową funkcjonalność"
   ```
4. Wypchnij zmiany:
   ```bash
   git push origin nazwa-funkcji
   ```
5. Utwórz pull request.

## Licencja

Projekt jest udostępniony na licencji MIT. Szczegóły w pliku `LICENSE`.

---

Dziękujemy za korzystanie z **Calendaroo**! Masz pytania lub sugestie? Skontaktuj się z nami!

