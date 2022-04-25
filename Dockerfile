FROM denoland/deno:alpine-1.21.0
COPY . /usr/src/app
WORKDIR /usr/src/app
EXPOSE 3000
RUN chmod +x /usr/src/app/docker-entrypoint.sh
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh", "deno", "run", "--allow-read","--allow-net","--allow-env","--allow-write","/usr/src/app/app.ts"]