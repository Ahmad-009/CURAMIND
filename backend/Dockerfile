FROM python:3.12-slim AS builder

WORKDIR /backendapp

COPY requirements.txt .

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --default-timeout=100 --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS runner

WORKDIR /backendapp  

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY . .

# FIX 4: Tell Python exactly where to look for your local folders/modules
ENV PYTHONPATH="/backendapp:/backendapp/app"

EXPOSE 10000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
