FROM python:3.11-alpine

# Set non-root execution user
RUN adduser -D -u 1000 sandbox

WORKDIR /workspace

USER sandbox

CMD ["python3"]
