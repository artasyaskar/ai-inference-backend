# AI Inference Backend Platform

A production-ready backend system for serving AI models reliably, cheaply, and at scale.

## What This System Does

- Exposes ML/LLM models through REST APIs
- Handles multiple models and versions
- Processes requests asynchronously
- Batches requests for efficiency
- Tracks latency, errors, and usage
- Runs reliably inside Docker containers

## Quick Start

### Prerequisites

- Python 3.11+
- Docker and Docker Compose (for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-inference-backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy environment configuration:
```bash
cp .env.example .env
```

### Running the Application

#### Option 1: Development Mode
```bash
python -m app.main
```

#### Option 2: Docker Compose (Recommended for Production)
```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

### List Available Models
```bash
curl http://localhost:8000/models
```

### Text Summarization
```bash
curl -X POST "http://localhost:8000/infer" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The quick brown fox jumps over the lazy dog. This is a sample text that needs to be summarized to demonstrate the summarization capabilities of the AI inference backend platform.",
    "model": "summarizer",
    "version": "v1"
  }'
```

### Sentiment Analysis
```bash
curl -X POST "http://localhost:8000/infer" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I love this AI inference backend! It works perfectly.",
    "model": "sentiment",
    "version": "v1"
  }'
```

### Text Generation
```bash
curl -X POST "http://localhost:8000/infer" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The future of AI is",
    "model": "generator",
    "version": "v1",
    "parameters": {
      "max_length": 50
    }
  }'
```

### Batch Inference
```bash
curl -X POST "http://localhost:8000/infer/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "text": "First text to process",
        "model": "summarizer"
      },
      {
        "text": "Second text to process",
        "model": "sentiment"
      }
    ]
  }'
```

### Get Metrics
```bash
curl http://localhost:8000/metrics
```

## Available Models

### Summarizer (v1)
- **Model**: facebook/bart-large-cnn
- **Use**: Text summarization
- **Parameters**: `max_length`, `min_length`

### Sentiment Classifier (v1)
- **Model**: cardiffnlp/twitter-roberta-base-sentiment-latest
- **Use**: Sentiment analysis
- **Output**: Classification with confidence score

### Generator (v1)
- **Model**: gpt2
- **Use**: Text generation
- **Parameters**: `max_length`, `num_return_sequences`

## Response Format

```json
{
  "success": true,
  "result": "Generated or processed text",
  "model_used": "summarizer:v1",
  "latency_ms": 123.45,
  "request_id": "uuid-string",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "metadata": {
    "model_type": "summarizer"
  }
}
```

## Architecture

```
ai-inference-backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── api/                 # API route handlers
│   │   ├── inference.py     # Inference endpoints
│   │   └── health.py        # Health check endpoints
│   ├── core/                # Core application logic
│   │   ├── config.py        # Configuration management
│   │   └── logging.py       # Structured logging
│   ├── models/              # Model management
│   │   ├── registry.py      # Model registry
│   │   └── loader.py        # Model loading logic
│   ├── services/            # Business logic
│   │   └── inference_service.py  # Main inference service
│   └── schemas/             # Pydantic models
│       ├── request.py       # Request schemas
│       └── response.py      # Response schemas
├── docker/
│   └── Dockerfile           # Docker configuration
├── tests/                   # Test suite
├── requirements.txt         # Python dependencies
├── docker-compose.yml       # Docker Compose configuration
└── README.md               # This file
```

## Performance Features

- **Async Processing**: All requests handled asynchronously
- **Model Caching**: Models loaded once and cached in memory
- **Batch Processing**: Multiple requests processed in parallel
- **Structured Logging**: JSON logs with performance metrics
- **Health Checks**: Kubernetes-ready health probes
- **Graceful Shutdown**: Clean model unloading on shutdown

## Monitoring

The system provides built-in metrics tracking:

- Request count per model
- Success/failure rates
- Average latency
- Model load times

Access metrics via the `/metrics` endpoint or check application logs.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `false` | Enable debug mode |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `DEFAULT_MODEL` | `summarizer` | Default model to use |
| `MAX_BATCH_SIZE` | `8` | Maximum batch size |
| `BATCH_TIMEOUT_MS` | `100` | Batch timeout in milliseconds |

## Production Deployment

### Docker Compose (Recommended)
```bash
# Production deployment
docker-compose -f docker-compose.yml up -d
```

### Scaling
```bash
# Scale to multiple instances
docker-compose up --scale ai-inference-backend=3
```

### Environment Configuration
Copy `.env.example` to `.env` and configure for your environment.

## Development

### Running Tests
```bash
python -m pytest tests/
```

### Code Style
```bash
# Install dev dependencies
pip install black flake8 mypy

# Format code
black app/

# Lint code
flake8 app/

# Type check
mypy app/
```

## Roadmap

- [x] Phase 1: Minimal Inference API
- [x] Phase 2: Model Registry & Versioning
- [ ] Phase 3: Async Inference & Batching
- [ ] Phase 4: Monitoring & Metrics
- [ ] Phase 5: Dockerized Production Setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
