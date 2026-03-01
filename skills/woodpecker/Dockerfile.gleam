FROM nixos/nix:2.28.3 AS build

RUN echo "experimental-features = nix-command flakes" >> /etc/nix/nix.conf
WORKDIR /app
COPY flake.nix flake.lock ./
RUN nix develop --command echo "Dependencies cached"
COPY . .
RUN nix develop --command just dist

FROM docker.io/erlang:28-alpine
RUN apk add --no-cache curl tzdata
RUN adduser -D -u 1000 appuser
WORKDIR /app
COPY --from=build --chown=appuser:appuser /app/build/erlang-shipment ./
USER appuser
EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["run"]
