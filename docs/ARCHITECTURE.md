# OmniBot Architecture - Phase 2 MVP

## Overview

OmniBot is designed as a modular, scalable Discord bot built with TypeScript and Discord.js v14. This document outlines the architecture for Phase 2 (Core MVP) with considerations for future expansion.

## Core Principles

1. **Modularity** - Features are organized into separate modules that can be enabled/disabled
2. **Scalability** - Architecture supports growth to 250 roles and thousands of guilds
3. **Maintainability** - Clear separation of concerns with typed interfaces
4. **Security** - Environment validation, error handling, graceful degradation
5. **Extensibility** - New features can be added without breaking existing code

## Directory Structure

```
src/
├── bot.ts                 # Entry point - orchestrates startup
├── config/
│   └── environment.ts     # Environment validation with Zod
├── database/
│   └── client.ts          # Prisma client initialization
├── discord/
│   ├── client.ts          # Discord client setup
│   └── handlers/
│       ├── commandHandler.ts    # Load/register commands
│       └── eventHandler.ts      # Load/attach events
├── commands/
│   ├── interfaces/
│   │   └── command.ts     # SlashCommand interface
│   └── slash/
│       ├── ping.ts        # /ping command
│       ├── help.ts        # /help command
│       └── setup.ts       # /setup command
├── events/
│   ├── interfaces/
│   │   └── event.ts       # DiscordEvent interface
│   ├── ready.ts           # Client ready event
│   └── interactionCreate.ts   # Handle interactions
├── services/
│   └── logger.ts          # Pino logger setup
├── types/
│   └── index.ts           # Shared type definitions
└── scripts/
    └── register-commands.ts   # Command registration CLI
```

## Core Components

### 1. Environment Configuration (`config/environment.ts`)

- **Purpose**: Validate all environment variables at startup
- **Technology**: Zod schema validation
- **Benefits**: Type safety, early error detection, clear error messages
- **Exports**: `env`, `validateEnvironment()`, `getEnvironment()`

### 2. Discord Client (`discord/client.ts`)

- **Purpose**: Initialize Discord.js client with minimal intents
- **Intents** (MVP):
  - `Guilds` - Required for basic operations and slash commands
- **Collections**:
  - `commands` - Stores loaded SlashCommand instances
  - `events` - Stores loaded DiscordEvent instances
- **Note**: Additional intents can be enabled in future phases

### 3. Handlers

#### Command Handler (`discord/handlers/commandHandler.ts`)

```typescript
// Responsibilities:
- Load all commands from src/commands/slash/
- Parse and validate command structure
- Register commands globally or per-guild
- Handle registration errors gracefully
```

#### Event Handler (`discord/handlers/eventHandler.ts`)

```typescript
// Responsibilities:
- Load all events from src/events/
- Attach event listeners (one-time or repeated)
- Handle event execution with error handling
```

### 4. Commands (`commands/slash/`)

All commands implement `SlashCommand` interface:

```typescript
interface SlashCommand {
  data: SlashCommandBuilder;           // Discord API definition
  execute(interaction: CommandInteraction): Promise<void>;
  permissions?: PermissionResolvable[];  // Optional permission checks
  module?: string;                      // Module identifier
  enabled?: boolean;                    // Enable/disable flag
}
```

**Phase 2 Commands:**
- `/ping` - Latency check
- `/help` - Command information
- `/setup` - Configuration panel (placeholder)

### 5. Events (`events/`)

All events implement `DiscordEvent` interface:

```typescript
interface DiscordEvent<K extends keyof ClientEvents> {
  name: K;                              // Event name
  once?: boolean;                       // Execute once flag
  execute(...args: ClientEvents[K]): Promise<void> | void;
  module?: string;                      // Module identifier
  enabled?: boolean;                    // Enable/disable flag
}
```

**Phase 2 Events:**
- `ready` - Bot online and ready
- `interactionCreate` - Handle slash commands and buttons

### 6. Database (`database/client.ts`)

- **ORM**: Prisma
- **Database**: PostgreSQL
- **Client**: Singleton pattern for Prisma client
- **Logging**: Query/error logging in development
- **Schema**: See `prisma/schema.prisma`

### 7. Logger (`services/logger.ts`)

- **Library**: Pino
- **Output**: Pretty-printed in development, JSON in production
- **Context**: Includes app name, environment, module info
- **Usage**: `createModuleLogger("ModuleName")`

## Data Flow

### Command Execution Flow

```
User runs /command
        ↓
Discord API → Bot
        ↓
interactionCreate event fired
        ↓
EventHandler checks if slash command
        ↓
CommandHandler retrieves command from collection
        ↓
Permission checks (if defined)
        ↓
AuditLog recorded (if guildId available)
        ↓
command.execute(interaction)
        ↓
Response sent to user
        ↓
Error handling & logging (if error)
```

## Database Schema (Phase 2)

**Tables:**
1. `Guild` - Server information
2. `GuildConfig` - Server settings
3. `ModuleConfig` - Per-module configuration
4. `AuditLog` - Action history
5. `ErrorLog` - Error tracking
6. `Backup` - Server backups (for future phases)
7. `BackupItem` - Backup content
8. `ManagedRole` - Bot-managed roles
9. `ManagedChannel` - Bot-managed channels
10. `SetupPreset` - Setup templates (for Phase 3)

## Module System

Future phases will add modules that follow this pattern:

```
moduleName/
├── commands/          # Module-specific commands
├── events/           # Module-specific events
├── services/         # Module business logic
└── types/            # Module types
```

Each module can be:
- Enabled/disabled per guild
- Configured independently
- Loaded dynamically
- Monitored via audit logs

## Error Handling

**Strategy:**
1. Validation layer: Zod for inputs
2. Try-catch in command/event handlers
3. Graceful user messages (never expose internals)
4. Detailed logging for debugging
5. ErrorLog database table for tracking

**Example:**
```typescript
try {
  await command.execute(interaction);
} catch (error) {
  log.error({ error }, "Command failed");
  await interaction.reply({
    content: "❌ An error occurred",
    ephemeral: true,
  });
}
```

## Security Considerations

1. **Token Protection**:
   - Never logged directly
   - Environment variable only
   - Validated at startup

2. **Input Validation**:
   - Discord.js slash command builder handles types
   - Database input validated by Prisma
   - Environment validated by Zod

3. **Permission Checks**:
   - Commands can define required permissions
   - Admin-only commands checked at event level
   - Future: Guild-specific role checks

4. **Rate Limiting**:
   - Discord API handles basic rate limits
   - Redis queue planned for future phases

## Performance Considerations

1. **Command Loading**: Cached in memory on startup
2. **Event Listeners**: Attached once at startup
3. **Database**: Connection pooling via Prisma
4. **Logging**: Conditional based on environment

## Scaling Plan

**Current (Phase 2):**
- Single bot instance
- Local development database
- Global command registration

**Future Phases:**
- Sharding support (for 2000+ guilds)
- Redis caching
- Distributed queue (Bull)
- Multi-instance load balancing

## Configuration Management

**Hierarchy:**
1. Environment variables (highest priority)
2. Guild configuration (database)
3. Module configuration (database)
4. Defaults (code)

**Access Pattern:**
```typescript
// Get environment
const env = getEnvironment();

// Get guild config
const guildConfig = await db.guildConfig.findUnique({
  where: { guildId },
});

// Get module config
const moduleConfig = await db.moduleConfig.findUnique({
  where: { guildId_moduleName: { guildId, moduleName } },
});
```

## Extending the Bot

### Adding a New Command

1. Create file `src/commands/slash/newcommand.ts`
2. Implement `SlashCommand` interface
3. Handler automatically loads on startup

### Adding a New Event

1. Create file `src/events/newevent.ts`
2. Implement `DiscordEvent` interface
3. Handler automatically loads on startup

### Adding a New Module

1. Create `src/modules/modulename/`
2. Implement commands/events/services
3. Register in module config
4. Enable/disable per guild

## Testing Strategy

**Unit Tests:**
- Environment validation
- Command structure
- Database schema
- Type definitions

**Integration Tests (Future):**
- Command execution
- Event handling
- Database operations

**Test Tools:**
- Vitest for unit tests
- Discord.js test utilities

## Monitoring & Observability

**Logging:**
- Module-level loggers
- Structured JSON format in production
- Real-time pretty-print in development

**Audit Trail:**
- All commands logged to AuditLog table
- Action, user, target tracked
- Searchable and filterable

**Error Tracking:**
- ErrorLog table for persistence
- Stack traces preserved
- Context attached to errors

## Future Architecture Enhancements

1. **Caching Layer** - Redis for frequently accessed data
2. **Queue System** - Bull for background jobs
3. **API Service** - REST API for dashboard
4. **WebSocket** - Real-time updates
5. **Sharding** - Support for 2000+ guilds
6. **Microservices** - Separate music/economy services
7. **Database Replication** - High availability

## Conclusion

Phase 2 architecture provides a solid foundation that:
- ✅ Handles core MVP requirements
- ✅ Supports modular additions
- ✅ Maintains code quality and type safety
- ✅ Provides security and error handling
- ✅ Scales to future complexity

The design anticipates future growth while keeping Phase 2 implementation simple and focused.
