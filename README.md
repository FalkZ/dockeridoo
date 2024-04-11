# Dockeridoo

![Dockeridoo Mascot](./dockeridoo.png)

> The "easiest" way to run docker images as cli tools.


## Motivation

I wanted to create an simple tool to run as a cli tool. The main problem was, that I ran my tool on ARM architecture and wanted to run it on x86 as well. The cross compilation was quite straight forward, with the docker cli:

```bash
docker buildx build --platform linux/amd64,linux/arm64 ...
```

The main problem was, that I wanted other people to use my tool and the default way to run a docker image requires the following steps:

1. Start Docker Deamon
2. Pull a current Image
3. Run the Image and attach the current working directory as a volume

This is quite a lot of steps for a simple cli tool. Thats why I created this tool to run docker images with as little friction as possible.


## Usage

1. Prerequirements
    - Docker
    - NodeJS
2. Install Dockeridoo:
    ```bash
    # npm
    npm i -g dockeridoo 
    ```
3. Run an docker image as cli tool:
    ```bash
    dodoo [image name]
    # for example
    dodoo fa7k/create-cards
    ```

## How it works

1. It detects if docker is already running on your system. 
    If not, it starts the docker deamon.
2. It pulls the latest image specified in the command.
3. It runs the image with the current working directory as a volume. And any command line arguments will also be passed to the image.

## Create your own Dockeridoo compatible CLI Tool

**Dockerfile:**
```Dockerfile
FROM alpine:3.19 # choose a base image (preferably small)

# do whatever you want here

# These 2 lines are important to make the image work with Dockeridoo.
# The directory you started Dockeridoo will be supplied as the volume /workdir 
# This way files from the host system can be accessed inside the container
VOLUME /workdir
WORKDIR /workdir

ENTRYPOINT ["your_cli_tool.sh"]
```

If you want your cli tool to be compatible across achitectures, you can use the following command to build your image:
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t your_image_name .
```

> Hint: make sure your base image was also built for multiple architectures 😉