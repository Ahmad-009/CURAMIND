FROM python:3.12 AS builder
WORKDIR /backendapp
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir  -r requirements.txt

FROM python:3.12-slim AS arctifact
WORKDIR /backendapp
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
