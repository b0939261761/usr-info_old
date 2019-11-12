# USR-Info

```bash
npm run db:migrate
npm run serve
```

Что бы отравлять с gmail, нужно [разрешить доступ небезопасным приложениям](https://myaccount.google.com/lesssecureapps)

## Routes

```bash
  # Get send
  GET http://localhost:8080/organizations?date=yyyy-MM-dd&status={invalid, unsuitable, suitable, send}

  # Get active proxies
  GET /proxies

  # Add proxies
  POST /proxies { "servers": ["server:port", "server:port"] }

  # Get balance
  /balance

  # Generate code
  /generateCode?code=0000000
```

for me: [](https://github.com/ThomWright/postgres-migrations)
