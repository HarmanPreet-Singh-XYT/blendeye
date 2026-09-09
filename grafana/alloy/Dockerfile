# Grafana Alloy — BlendEye Observability Sidecar
# Bakes config.alloy into the image so Cloud Run can run it without volume mounts.
# All credentials are injected at runtime via environment variables.
FROM grafana/alloy:latest
COPY config.alloy /etc/alloy/config.alloy
# Cloud Run routes traffic to $PORT (default 8080); use it for the Alloy UI/health endpoint.
CMD ["run", "--server.http.listen-addr=0.0.0.0:8080", "/etc/alloy/config.alloy"]
