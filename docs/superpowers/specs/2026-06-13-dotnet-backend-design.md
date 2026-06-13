# ApnaGhar .NET Backend — Design

**Date:** 2026-06-13
**Status:** Approved (pending written-spec review)

## Overview

Add a .NET (ASP.NET Core, .NET 8) backend API for ApnaGhar and wire the
existing Next.js frontend to it, replacing the hardcoded `mock-data.ts` source
of truth. The API provides full CRUD over property listings with JWT
authentication and ownership-based authorization. Storage is EF Core + SQLite
for now, behind a repository abstraction so the engine can be swapped to SQL
Server or PostgreSQL later with a config change plus a migration regeneration.

## Decisions

| Decision | Choice |
|---|---|
| Database engine | EF Core + **SQLite** now; repository pattern + provider-by-config → swappable to SQL Server / PostgreSQL later |
| Images | Unsplash URLs for seed data; **local-disk** uploads behind an `IImageStorage` abstraction (swappable to S3 / Azure Blob) |
| API scope | **Full CRUD** on properties |
| Auth | **JWT** bearer; **ownership-based** authorization |
| Frontend | **Wire it up** end-to-end (replace `mock-data.ts` with real API calls) |
| Solution structure | **Approach A** — pragmatic single Web API project, layered by folder |
| Validation | **FluentValidation** |
| Testing | **Component tests** — API exercised through its real HTTP surface in-process |

## Architecture (Approach A)

Single ASP.NET Core Web API project, `apna-ghar-api/`, sibling to
`apna-ghar-frontend/`. Layered by folder, not by separate projects. The
repository abstraction preserves engine swap-ability; if the project grows,
this layout refactors naturally into a multi-project Clean Architecture.

```
apna-ghar-api/
  ApnaGhar.Api.csproj
  Program.cs                    # DI, middleware, JWT, CORS, EF, FluentValidation
  appsettings.json              # connection string, JWT settings, "DatabaseProvider": "Sqlite"
  Controllers/                  # AuthController, PropertiesController, MetaController
  Services/                     # PropertyService, AuthService, TokenService
  Data/
    ApnaGharDbContext.cs
    Repositories/               # IPropertyRepository + EfPropertyRepository, IUserRepository + EfUserRepository
    Seed/                       # seeds the 9 properties + amenity/city lists
    Migrations/
  Entities/                     # User, Property, PropertyImage, PropertyAmenity
  Dtos/                         # request/response shapes (entities never exposed)
  Validators/                   # FluentValidation validators for request DTOs
  Auth/                         # JWT config, password hashing, current-user accessor
  Storage/                      # IImageStorage + LocalDiskImageStorage
  wwwroot/uploads/              # uploaded images served as static files
```

**Swap-ability mechanism:** `Program.cs` reads `DatabaseProvider` from config
and registers the matching EF provider (`UseSqlite(...)` now). Controllers and
services depend only on `IPropertyRepository` / `IUserRepository`, never on
`DbContext`. Switching engines = change config + `dotnet ef migrations add`.

## Data model

EF Core entities mapping the current frontend `Property` model.

| Entity | Fields |
|---|---|
| `User` | `Id` (Guid), `Email` (unique), `PasswordHash`, `DisplayName`, `CreatedAt` |
| `Property` | `Id` (Guid), `Title`, `Description`, `ListingType` (enum), `PropertyType` (enum), `Price` (decimal(18,2)), `AreaSqft`, `Bedrooms`, `Bathrooms`, `IsFurnished`, `ParkingAvailable`, `VastuCompliant`, `Locality`, `City`, `State`, `IsFeatured`, `PostedAt` (UTC), `OwnerName`, `OwnerType` (enum), `OwnerPhone`, `CreatedByUserId` (FK → User) |
| `PropertyImage` | `Id`, `PropertyId` (FK), `Url`, `SortOrder` |
| `PropertyAmenity` | `Id`, `PropertyId` (FK), `Name` |

Modeling decisions and rationale:

- **`Id` is a `Guid`** (was `"1"`–`"9"`). Users now create listings, so
  sequential ids invite enumeration and collisions. The frontend treats `id`
  as an opaque string in routes, so this stays compatible.
- **Enums stored as strings** (`"Rent"`, `"Villa"`, `"Builder"`) via EF value
  conversion — readable in the DB and portable across engines.
- **`postedDaysAgo` → `PostedAt`** UTC timestamp. The API returns an ISO date;
  the frontend `postedLabel()` is adjusted to compute "days ago" from it.
  (Storing a relative number in a DB is meaningless.)
- **`owner.*` stays on the property** as descriptive display data (Owner /
  Agent / Builder label + contact), *plus* the new `CreatedByUserId` link that
  drives the ownership check. The two are unrelated: `OwnerType` is a label
  shown to browsers; authorization is "did you create this listing?".
- **Amenities as a simple child table** (`PropertyAmenity` rows with a `Name`
  string) rather than a normalized lookup + join — pragmatic for a prototype,
  still fully queryable; can normalize later.
- **`Price`** configured with `HasPrecision(18, 2)` so decimal behaviour is
  correct and consistent when the engine is swapped.

## API surface

REST, JSON, base path `/api`.

### Auth
- `POST /api/auth/register` — `{ email, password, displayName }` → `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `GET  /api/auth/me` — current user (from token)

### Properties
- `GET    /api/properties` — list with filtering/sorting/paging:
  `listingType`, `city`, `propertyType`, `minPrice`, `maxPrice`, `bedrooms`,
  `furnished`, `search` (title/locality), `sort`, `page`, `pageSize` →
  paged `PropertyListResponse`.
- `GET    /api/properties/{id}` — single property
- `GET    /api/properties/featured` — featured listings (home page)
- `GET    /api/properties/{id}/similar` — same city, capped at 3
- `POST   /api/properties` — create *(auth required)*
- `PUT    /api/properties/{id}` — update *(auth + ownership)*
- `DELETE /api/properties/{id}` — delete *(auth + ownership)*
- `POST   /api/properties/{id}/images` — multipart image upload *(auth + ownership)*

### Reference data
- `GET /api/meta/amenities` — replaces the frontend `ALL_AMENITIES` constant
- `GET /api/meta/cities` — replaces the frontend `POPULAR_CITIES` constant

## Authentication & authorization

- **JWT bearer tokens.** `TokenService` issues a token carrying `sub` (userId)
  and email. Secret, issuer, audience, and expiry all come from
  `appsettings.json` (secret via user-secrets in dev).
- **Password hashing** via ASP.NET Core's built-in `PasswordHasher<User>`
  (salted + iterated) — no extra dependency.
- **Ownership check:** write endpoints (`PUT`, `DELETE`, image upload) load the
  property and compare `CreatedByUserId` to the `sub` claim; mismatch →
  `403 Forbidden`. Reads are `[AllowAnonymous]`; writes are `[Authorize]`.

## Image storage

- `IImageStorage.SaveAsync(stream, fileName)` → returns a relative URL such as
  `/uploads/{guid}.jpg`; `DeleteAsync(url)` for cleanup.
- `LocalDiskImageStorage` writes into `wwwroot/uploads/`; the API serves it via
  static files. Validates content type (jpg/png/webp) and enforces a size cap.
- The DB only ever stores the URL string, so seed Unsplash URLs and uploaded
  URLs coexist seamlessly. Swapping to S3 / Azure Blob is a new `IImageStorage`
  implementation only.

## DTOs

Dedicated request/response shapes — entities are never exposed directly, so we
never leak `PasswordHash` or allow over-posting:
`AuthRequest`, `AuthResponse`, `PropertyResponse`, `CreatePropertyRequest`,
`UpdatePropertyRequest`, `PropertyListResponse` (paged).

## Frontend wiring

Replacing `src/lib/mock-data.ts` as the data source:

- New `src/lib/api.ts` — typed fetch client; base URL from
  `NEXT_PUBLIC_API_BASE_URL` (the API runs on its own port, e.g. `localhost:5000`).
- **Home** and **detail** pages (Server Components) fetch from the API
  server-side. The detail page drops `generateStaticParams()` and switches to
  **request-time SSR**, since listings are now dynamic and user-created.
- **Properties list** page: client-side `useMemo` filtering becomes
  **query-param calls to the API**, so filtering is server-driven and the URL
  reflects state.
- **Auth:** `/login` posts to `/api/auth/login`; JWT held in a client-side auth
  context (localStorage) that attaches `Authorization: Bearer` to write
  requests. *Upgrade path (deferred): move the token to an httpOnly cookie.*
- **`/dashboard/add-property`:** build the real form → `POST /api/properties`,
  then upload photos via the images endpoint.
- `next.config.mjs`: allow the API host for uploaded `<Image>` URLs.
  `postedLabel()` adjusted to take a `PostedAt` date instead of a days-ago number.

## Cross-cutting concerns

- **CORS:** API allows the Next origin (`localhost:3000` / `3001`).
- **Validation:** **FluentValidation** validators on request DTOs → `400` with
  RFC-7807 `ProblemDetails`.
- **Error handling:** global exception middleware → consistent `ProblemDetails`;
  `401` unauthenticated, `403` ownership violation, `404` missing, `400`
  validation.
- **Config / secrets:** JWT secret via .NET user-secrets in dev (not committed).
- **Seeding:** on startup → `Migrate()` then idempotently seed the 9 properties
  (assigned to a `seed@apnaghar` system user) plus amenity/city lists.

## Testing strategy

**Component tests** are the primary strategy: exercise the API through its real
HTTP surface in-process via `WebApplicationFactory`, against in-memory SQLite,
with real internal wiring (controllers → services → repositories → EF). Only
genuine external boundaries (`IImageStorage`) are stubbed. This validates
behaviour end-to-end at the API boundary rather than asserting on isolated
units with heavy mocking. xUnit as the test framework.

Coverage focus:
- Property listing filtering / sorting / paging via query params
- Register / login / token issuance; auth-required endpoints reject anonymous
- Ownership rule: non-owner cannot update/delete another user's listing (`403`)
- Validation failures return `400` + `ProblemDetails`
- Image upload happy path (with stubbed storage)

**Verification:** Swagger UI for manual API checks, then run the wired-up
frontend end-to-end against the live API.

## Build phases (for the implementation plan)

1. **API foundation** — project, entities, EF/SQLite, seeding, read endpoints, Swagger
2. **Auth** — register / login / JWT, password hashing
3. **Writes** — create/update/delete + image upload + ownership enforcement
4. **Frontend wiring** — api client, SSR pages, filtering, login, add-property
5. **Tests + end-to-end verification** — component tests, Swagger, full-stack run

## Out of scope (this version)

- httpOnly-cookie token storage (localStorage now; documented upgrade path)
- Admin role / moderation (ownership-based only)
- Cloud object storage for images (local disk now)
- Normalized amenity lookup table (flat child table now)
- Map integration on the detail page (still a placeholder)
- Production deployment / hosting configuration
