# Contributing to OmniBot

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Commit: `git commit -m "feat: add your feature"`
6. Push: `git push origin feature/your-feature`
7. Create a Pull Request

## Development Setup

See [SETUP.md](./docs/SETUP.md) for detailed installation instructions.

## Code Style

- **Language**: TypeScript (strict mode)
- **Formatting**: Prettier (via TypeScript default)
- **Linting**: tsc --noEmit
- **Testing**: Vitest

## Commit Convention

```
feat: add new feature
fix: fix a bug
docs: documentation changes
refactor: code refactoring
test: test changes
chore: dependency updates, etc
ci: CI/CD changes
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass: `npm test`
4. Ensure type checking passes: `npm run lint`
5. Ensure build passes: `npm run build`

## Branch Naming

- Feature: `feature/name`
- Bugfix: `bugfix/name`
- Documentation: `docs/name`
- Release: `release/v0.0.0`

## Testing

All new features must include tests. Run tests with:

```bash
npm test
```

## Questions?

Open an issue on GitHub for questions or discussions.

---

**Thank you for contributing to OmniBot!**
