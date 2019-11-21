# USR-Info

```bash
npm run db:migrate
npm run serve
```

Что бы отравлять с gmail, нужно [разрешить доступ небезопасным приложениям](https://myaccount.google.com/lesssecureapps)

## Routes

```bash
  # Get send
  GET /organizations/report?year=YYYY&month=MM[&day=DD]

  # Get active proxies
  GET /proxies

  # Add proxies
  POST /proxies { "servers": ["server:port", "server:port"] }

  # Get active amount proxies
  GET /proxies/amount

  # Get balance
  /balance

  # Generate code
  /generateCode?code=0000000
```

## Add service

```bash
vi /lib/systemd/system/usr-info.service
```

```txt
[Unit]
Description=Parse for usr-info
After=docker.service
Conflicts=shutdown.target reboot.target halt.target

[Service]
Restart=always
RestartSec=10
WorkingDirectory=/root/usr-info
ExecStart=/usr/local/bin/docker-compose up
ExecStop=/usr/local/bin/docker-compose down
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TimeoutStartSec=10
TimeoutStopSec=30
StartLimitBurst=3
StartLimitInterval=60s
NotifyAccess=all
```

for me: [](https://github.com/ThomWright/postgres-migrations)
