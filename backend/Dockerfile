FROM python:3.12-slim AS builder

WORKDIR /backendapp

COPY requirements.txt .

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --default-timeout=100 --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS runner

# FIX 1: Removed the extra /app so it matches your local computer exactly
WORKDIR /backendapp  

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY . .

# FIX 2: Expose the port Render actually looks for
EXPOSE 10000

# FIX 3: Start it correctly on port 10000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
