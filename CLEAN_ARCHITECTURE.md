# Clean Architecture Implementation

## Overview
This project now follows Clean Architecture principles as outlined in the blog post, with clear separation of concerns and dependency inversion.

## Folder Structure

```
lib/
├── domain/                    # Core business logic and entities
│   ├── entities/             # Business entities (User, Link, Appearance, Template)
│   │   ├── user.ts
│   │   ├── link.ts
│   │   ├── appearance.ts
│   │   ├── template.ts
│   │   └── index.ts
│   └── value-objects/        # Value objects and business rules
│
├── application/               # Application business rules and use cases
│   ├── use-cases/            # Application use cases
│   │   ├── user-use-cases.ts
│   │   ├── link-use-cases.ts
│   │   ├── appearance-use-cases.ts
│   │   └── index.ts
│   └── interfaces/           # Abstract interfaces
│
├── infrastructure/            # External concerns (databases, APIs, etc.)
│   ├── repositories/         # Data access implementations
│   │   ├── user-repository.ts
│   │   ├── link-repository.ts
│   │   ├── appearance-repository.ts
│   │   └── index.ts
│   ├── external-services/    # Third-party service integrations
│   └── database/             # Database configurations
│
├── services/                  # Service layer (combines use cases and repositories)
│   ├── user-service.ts
│   ├── link-service.ts
│   ├── appearance-service.ts
│   └── index.ts
│
└── hooks/                     # React Query hooks
    └── use-dashboard-queries.ts

stores/                        # Zustand state management
├── auth-store.ts             # Authentication state
├── dashboard-store.ts        # Dashboard UI state
└── index.ts

components/                     # Presentation layer
├── dashboard/                 # Dashboard components
├── ui/                       # Reusable UI components
├── templates/                 # Profile templates
└── providers/                 # Context providers
```

## Architecture Principles

### 1. Dependency Inversion
- High-level modules (use cases) don't depend on low-level modules (repositories)
- Both depend on abstractions (interfaces)
- Dependencies point inward toward the domain layer

### 2. Separation of Concerns
- **Domain**: Pure business logic, no external dependencies
- **Application**: Orchestrates use cases, business rules
- **Infrastructure**: Implements interfaces, handles external concerns
- **Presentation**: UI components, state management

### 3. Single Responsibility
- Each class has one reason to change
- Use cases handle specific business operations
- Repositories handle data access
- Services coordinate between layers

### 4. Open/Closed Principle
- Open for extension (new use cases, repositories)
- Closed for modification (existing interfaces)

## Data Flow

```
UI Component → TanStack Query Hook → Service → Use Case → Repository → Database
     ↑                                                                     ↓
     ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

## Benefits

1. **Testability**: Easy to mock dependencies and test business logic
2. **Maintainability**: Clear structure, easy to locate and modify code
3. **Scalability**: New features can be added without affecting existing code
4. **Performance**: TanStack Query provides caching, background updates, and optimistic updates
5. **State Management**: Zustand provides simple, performant state management

## Usage Examples

### Using TanStack Query Hooks
```typescript
function MyComponent() {
  const { data: links, isLoading } = useUserLinks(userId)
  const { mutate: updateOrder } = useUpdateCategoryOrder()
  
  if (isLoading) return <LoadingSpinner />
  
  return <div>{/* Render links */}</div>
}
```

### Using Zustand Store
```typescript
function MyComponent() {
  const { activeTab, setActiveTab } = useDashboardStore()
  
  return (
    <button onClick={() => setActiveTab('links')}>
      Switch to Links
    </button>
  )
}
```

## Migration Notes

- Old service files have been refactored to follow clean architecture
- TanStack Query hooks now use the new service layer
- Zustand stores are organized by domain
- Components use clean hooks and stores
- Type safety is maintained throughout the stack

