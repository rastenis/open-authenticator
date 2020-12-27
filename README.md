# open-authenticator

A stateless, minimal, dockerized authentication service for easy auth management. Supports custom strategies and a wide variety of PassportJS strategies.

![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/scharkee/open-authenticator)

## Features

- Set up one OAuth flow, enable a myriad of ways to authenticate!
- Demo page with multiple auth choices
- Enable strategies:
  - Easily add supoprted PassportJS methods via guided CLI tool
  - Define custom strategies yourself. Examples for SMS and Pushover included
- Upon authentication, your application receives the identifier and profile data in a standardized format
- Run as a standalone container or include it in your Docker composition
- Automatic TLS certificate generation if running standalone (requires ports 443 and 80)

## Configuration

Configuration for strategies installed using the CLI tool are added automatically, according to the API key info you enter using the tool.

To run the configuration setup CLI tool + the strategy configuration:

- `docker exec -it CONTAINER_NAME yarn run setup` if you are using an image, or
- `yarn run setup` if you are building yourself, or running outside of the container.

Configuration for custom strategies can also be manually added as a key/value set in config.strategies. The key is the strategy name, the value is an object of what needs to be passed to your strategy code.

If you want to only change the config, run `yarn run config`. To only modify strategies, run `yarn run strategies`.

```javascript
// Strategy configuration example. In this case it is for a custom strategy that requires a user and a token value, which is later used to send out confirmation notifications via Pushover.
"pushover": {
    "user": "PUSHOVER_USER",
    "token": "PUSHOVER_TOKEN"
}
```

## Running by using prebuilt image (just the authenticator)

To run just the container, without Nginx:

```bash
# Perform configuration. This will be persisted locally.
$ docker run -v /absolute/path/to/your/config:/app/config/ -it scharkee/open-authenticator yarn run setup

# Run the authenticator
$ docker run -d -p 80:80 -v /absolute/path/to/your/config:/app/config/ scharkee/open-authenticator --name="CONTAINER_NAME"
```

Run `docker exec -it CONTAINER_NAME yarn run strategies` when you want to adjust your strategy configurations. It will persist in your local config folder for next launch.

To make it reachable, you will want to either:

- Use with a HTTPS-enabled reverse proxy yourself, like Apache or Nginx,
- Or run it in HTTP mode (not advised, and largely unsupported by OAuth providers) on port 80 and reach it directly.

A setup for a composition using the prebuilt image would look something like this:

```docker
services:
  authenticator:
    container_name: authenticator
    image: scharkee/open-authenticator
    volumes:
      - ./config/open-authenticator:/app/config
    ports:
      - "8080:80"
  #...other services. You have to use your own https cert solution.

```

If you would rather use an included HTTPS cert solution, run it in composition mode:

## Set up for composition mode, or for building the container locally

```bash
# clone the repo
$ git clone https://github.com/Scharkee/open-authenticator.git
$ cd open-authenticator

# install dependencies
$ yarn

# run configuration
$ yarn setup
```

## Running in composition mode

(needs ports 80 and 443)

This will set up Nginx with HTTPS certificates for you automatically.

Before running the composition, open docker-compose.yml and set the `DOMAIN` and `CERTBOT_EMAIL` variables.

```bash
$ docker-compose up -d
```

After configuring and running, you should be able to access open-authenticator at https://DOMAIN, if you have got your DNS correctly set.

### Running outside of container, or running locally built Docker container (just the authenticator)

To run without the container, for developing custom strategies or testing:

```bash
$ yarn launch # this is for production mode. Run 'yarn dev' if you want hot reload.
```

To build the container locally, without Nginx, either for use with a reverse proxy or for running in HTTP mode (not advised), run:

```bash
$ docker build --tag openauthenticator .
$ docker run -p 80:80 -d openauthenticator # or yourPort:80 for custom port
```

You can run `yarn run config` and also perform configuration in the config/config.json file. You do not need to map that with `-v` if building locally like this.

You also do not have to edit docker-compose.yml to add the domain.

### Restoring configuration

If you only have the config.json, you can restore the managed strategies by running:

- `docker exec -it CONTAINER_NAME yarn run restore` if you are using an image, or
- `yarn run restore` if you are building yourself.

### Adding custom strategy

The template for adding a custom strategy can be found in src/strategies/template.ts.
Demos for custom strategies can be found in pushover.ts and sms.ts.

### Getting all available strategies

You can get all configured strategies by making a GET request to /strategies

Example response:

```json
["google", "twitter", "github"]
```

This is very handy for making dynamic log-ins, for example (new strategies will appear automatically once configured).

### Mismatched URI warning for testing

When running the demo and/or testing, make sure to configure demoUrl in the config, because otherwise some providers will complain about a mismatched url.

### Unique multi-identity support

Multiple identities being linked and unlinked via open-authenticator are not supported since that would force the use of a database, and make stateless operation impossible. This instead can be implemented by the user, using the raw data returned from open-authenticator.

### Contribution & Support

Submit bugs and requests through the project's issue tracker:

[![Issues](http://img.shields.io/github/issues/Scharkee/netcore-postgres-oauth-boiler.svg)](https://github.com/Scharkee/netcore-postgres-oauth-boiler/issues)

### License

This project is licensed under the terms of the MIT license.
