# Capital Gains CLI

CLI em Node.js para calcular imposto sobre ganhos de capital em operações de compra e venda de ações. A aplicação lê, a cada linha da stdin, um array JSON de operações reais e escreve o resultado (imposto por operação) na stdout.

## Requisitos
- Node.js >= 20 (ESM habilitado)
- Sem dependências de runtime (apenas módulos nativos)

## Instalação
```bash
npm install
```

## Como Executar

- Com arquivos (redirecionamento):
```bash
./bin/capital-gains < cases/operations.txt 
```

## Usando Docker

Este repositório inclui um `docker-compose.yml` com dois serviços:
- `app`: imagem de runtime (builda a partir do `Dockerfile`).
- `test`: ambiente efêmero de testes (Node 20) com o código montado via volume.

Comandos úteis:

```bash
# Build da imagem de runtime
docker compose build app

# Executar o CLI lendo de arquivo
docker compose run --rm -T app < cases/operations.txt

# Rodar testes
docker compose run --rm test

# Rodar cobertura
docker compose run --rm test sh -lc "npm run coverage"
```

## Como Rodar os Testes
O projeto mantém a configuração de testes com Jest. A suíte será recriada; por ora pode estar vazia.
```bash
npm test         # executa testes quando existirem
npm run coverage # executa cobertura
```
Relatório HTML (quando houver testes): após `npm run coverage`, abra `coverage/index.html`.

## Decisões Técnicas
- Simplicidade: uso de tipos primitivos para valores monetários e quantidades;
- Elegância: separação clara de camadas; nomes descritivos (`CapitalGainsEngine`, `TaxAssessment`).
- Operacional: foco em stdin/stdout em modo batch; entradas assumidas válidas.

## Bibliotecas/Frameworks
- Runtime: Node.js (ESM). Sem dependências externas no runtime.
- Testes: Jest (dev-only), configurado em `package.json`.
