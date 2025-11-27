# Testing Guide for ResumeSection

## Backend Testing

### Setup

```bash
cd backend
pip install pytest pytest-cov flask-testing
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::test_login
```

### Writing Tests

```python
# tests/test_auth.py
import pytest
from app import create_app
from models import db, User

@pytest.fixture
def app():
    """Create app for testing"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Test client"""
    return app.test_client()

def test_register(client):
    """Test user registration"""
    response = client.post('/register', json={
        'username': 'testuser',
        'password': 'testpass',
        'role': 'section'
    })
    assert response.status_code == 201
    assert 'id' in response.get_json()

def test_login(client):
    """Test login"""
    # Register first
    client.post('/register', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    
    # Login
    response = client.post('/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    assert response.status_code == 200
    assert 'access_token' in response.get_json()
```

## Frontend Testing

### Setup

```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Writing Tests

```typescript
// src/__tests__/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/auth/LoginForm';

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('submits form with credentials', async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password');
    await user.click(submitButton);
    
    // Assert result
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
```

## API Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### Login
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### Create Report
```bash
TOKEN="your_token_here"
curl -X POST http://localhost:5000/report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "date":"2024-01-15",
    "preacher":"John Doe",
    "total_attendees":150,
    "men":60,
    "women":70,
    "children":20,
    "youth":30,
    "offering":500,
    "notes":"Good service"
  }'
```

### Get Summary
```bash
TOKEN="your_admin_token"
curl -X GET "http://localhost:5000/summary?start=2024-01-01&end=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

## Integration Testing

### Test Workflow

```bash
# 1. Start both servers
# Terminal 1
cd backend && python app.py

# Terminal 2
cd frontend && npm run dev

# 2. Run E2E tests (example with Playwright)
npm install --save-dev @playwright/test

# playwright.config.ts
export default {
  webServer: {
    command: 'npm run dev',
    port: 5173,
  },
  use: {
    baseURL: 'http://localhost:5173',
  },
}
```

## Performance Testing

### Load Testing with Locust

```bash
pip install locust

# locustfile.py
from locust import HttpUser, task, between

class ReportUser(HttpUser):
    wait_time = between(1, 5)
    
    @task
    def get_summary(self):
        self.client.get('/summary', headers={
            'Authorization': f'Bearer {self.token}'
        })
```

Run: `locust -f locustfile.py --host=http://localhost:5000`

## CI/CD Testing

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - run: |
          cd backend
          pip install -r requirements.txt pytest
          pytest

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: |
          cd frontend
          npm install
          npm test
```

## Test Coverage Goals

- **Backend**: Min 80% code coverage
- **Frontend**: Min 70% code coverage
- **API Endpoints**: 100% coverage
- **Critical Paths**: 100% coverage

## Debugging Tests

### Backend
```bash
# Verbose output
pytest -v

# Show print statements
pytest -s

# Drop into pdb on failure
pytest --pdb

# Only failed tests from last run
pytest --lf
```

### Frontend
```bash
# Debug in VS Code
# Add to .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "--inspect-brk"],
}
```
