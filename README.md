# Capital Gains CLI

CLI em Node.js para calcular imposto sobre ganhos de capital em operações de compra e venda de ações. A aplicação lê, a cada linha da stdin, um array JSON de operações reais e escreve o resultado (imposto por operação) na stdout.

## Requisitos
- Node.js >= 20 (ESM habilitado)
- Sem dependências de runtime (apenas módulos nativos)

## Instalação
```bash
npm install
npm link
```

## Como Executar

- Via comando global (recomendado após `npm link`):
```bash
capital-gains
[{"operation":"buy","unit-cost":10.00,"quantity":1000}]
[{"tax":0}]
```

- Via script npm (sem link global):
```bash
npm start
```

- Com arquivos (redirecionamento):
```bash
capital-gains < cases/operations.txt > out.txt
```

## Executar com Docker

Crie a imagem e rode o CLI lendo da stdin (ideal para pipes):

```bash
# Build
docker build -t capital-gains .

# Lendo de arquivo local
cat cases/operations.txt | docker run --rm -i capital-gains > out.txt
```

Observações:
- O container expõe o binário via `node ./bin/capital-gains`; a stdin do container é o que o host enviar (ex.: via `|` ou `<< EOF`).
- Se preferir montar um arquivo ao invés de pipe: `docker run --rm -i -v "$PWD/cases:/data" capital-gains < /data/operations.txt`.

### Formato de Saída
- Sucesso: `{ tax: number }`

### Entrada e Saída
- Cada linha de entrada é um array JSON de operações reais; cada item tem os campos:
  - `operation`: "buy" | "sell"
  - `unit-cost`: número (preço unitário)
  - `quantity`: número inteiro > 0

Exemplo de entrada (uma única linha):
```json
[{"operation":"buy","unit-cost":10.00,"quantity":10000}, {"operation":"sell","unit-cost":25.00,"quantity":1000}]
```

Exemplo de saída correspondente:
```json
[{"tax":0}, {"tax":3000}]
```

### Erros
- Assumimos entradas válidas. A aplicação não produz payloads de erro estruturados na saída.

## Regras de Tributação (implementadas)
- Compra: não há imposto; atualiza a posição e o custo médio ponderado.
- Venda: calcula lucro/prejuízo com base no custo médio.
- Prejuízo: acumula para compensar lucros futuros.
- Isenção por operação: se o valor total negociado na venda ≤ 20.000, o imposto é 0.
- Alíquota: 20% sobre o lucro tributável (após compensação de prejuízo) quando a venda excede 20.000.

Observação: em vendas isentas (valor negociado ≤ 20.000), o imposto é 0 e o prejuízo acumulado NÃO é consumido. A compensação de prejuízo só ocorre em vendas tributáveis (valor negociado > 20.000).

## Como Rodar os Testes
O projeto mantém a configuração de testes com Jest. A suíte será recriada; por ora pode estar vazia.
```bash
npm test         # executa testes quando existirem
npm run coverage # executa cobertura
```
Relatório HTML (quando houver testes): após `npm run coverage`, abra `coverage/index.html`.

## Arquitetura (resumo)
- Camadas: `infra` (CLI) → `app` (use case/mapeadores) → `domain` (entidades, políticas, serviços) com tipos primitivos.
- Padrões: Use Case, Strategy para políticas, Engine stateful para orquestração.
- Serviços: `OperationProcessor`, `TaxCalculator`, `CapitalGainsEngine`.

Detalhes completos em `docs/ARQUITETURA.md`.

## Decisões Técnicas
- Simplicidade: uso de tipos primitivos para valores monetários e quantidades; remoção de objetos de valor e do padrão Result/DomainError.
- Elegância: separação clara de camadas; nomes descritivos (`CapitalGainsEngine`, `TaxAssessment`).
- Operacional: foco em stdin/stdout em modo batch; entradas assumidas válidas.

## Bibliotecas/Frameworks
- Runtime: Node.js (ESM). Sem dependências externas no runtime.
- Testes: Jest (dev-only), configurado em `package.json`.

## Notas Adicionais
- A engine (`CapitalGainsEngine`) mantém estado de portfólio por linha processada.