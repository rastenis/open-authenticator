# [WIP] open-authenticator

A minimal, dockerized authentication service for easy auth management. Supports custom strategies and Passportjs strategies.

## Features

- Set up one OAuth flow, enable a myriad of ways to authenticate!
- Demo page with multiple auth choices
- Enable strategies:
  - Easily add supoprted PassportJS methods via guided CLI tool
  - Define custom strategies yourself. Examples for SMS and Pushover included
- Upon authentication, your application receives the identifier and profile data in a standardized format
- Run as a standalone container or include it in your Docker composition
- Automatic TLS certificate generation if running standalone (requires ports 443 and 80)

## Set up

```bash
git clone https://github.com/Scharkee/open-authenticator.git
yarn
# configure config.json using configExample.json
# if you're running the composition, open docker-compose.yml and set the DOMAIN and CERTBOT_EMAIL variables
docker-compose up -d
```

## Configuration

Configuration for strategies installed using the CLI tool are added automatically, according to the API key info you enter using the tool.

Configuration for custom strategies can be added as a key/value set in config.strategies. The key is the strategy name, the value is an object of what needs to be passed to your strategy code.

```javascript
// Pushover configuration example
"pushover": {
    "user": "PUSHOVER_USER",
    "token": "PUSHOVER_TOKEN"
}
```

## Running standalone Docker container

To run just the container, without Nginx, either for use with a reverse proxy or for running in HTTP mode (not advised), run:

```bash
$ docker build --tag openauthenticator .
$ docker run -p 80:80 -d openauthenticator # or port:80 for custom port
```

## Adding custom strategy

The template for adding a custom strategy can be found in src/strategies/template.ts.
Demos for custom strategies can be found in pushover.ts and sms.ts.

## Unique multi-identity support

WIP

### Running independently

WIP

### Mismatched URI warning for testing

WIP

### Contribution & Support

Submit bugs and requests through the project's issue tracker:

[![Issues](http://img.shields.io/github/issues/Scharkee/netcore-postgres-oauth-boiler.svg)](https://github.com/Scharkee/netcore-postgres-oauth-boiler/issues)

### License

This project is licensed under the terms of the MIT license.
