FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN pip install pandas
ENTRYPOINT ["python", "validate_and_build.py"]
