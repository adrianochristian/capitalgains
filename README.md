# Capital Gains CLI

CLI em Node.js para calcular imposto sobre ganhos de capital em operações de compra e venda de ações. A aplicação lê operações em JSON a partir da stdin (uma simulação por linha) e escreve o resultado (imposto por operação) na stdout.

## Requisitos
- Node.js >= 20 (ESM habilitado)
- Sem dependências de runtime (apenas módulos nativos)

## Instalação
```bash
npm install
# Opcional: expor o comando globalmente durante o desenvolvimento
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

# Interativo/piped
echo '[{"operation":"buy","unit-cost":10.00,"quantity":1000}]' | docker run --rm -i capital-gains

# Lendo de arquivo local
cat cases/operations.txt | docker run --rm -i capital-gains > out.txt
```

Observações:
- O container expõe o binário via `node ./bin/capital-gains`; a stdin do container é o que o host enviar (ex.: via `|` ou `<< EOF`).
- Se preferir montar um arquivo ao invés de pipe: `docker run --rm -i -v "$PWD/cases:/data" capital-gains < /data/operations.txt`.

### Formato de Saída
- Sucesso: `{ tax: number }`
- Erro: `{ error: { code, message, details } }`

### Entrada e Saída
- Cada linha de entrada é um array JSON de operações; cada item tem os campos:
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
Quando ocorre erro de domínio/validação, a saída da linha é um array com um único objeto de erro:
```json
[{"error":{"code":"SELL_EXCEEDS_POSITION","message":"Cannot sell 2000 units. Only 1000 units available","details":{"requested":2000,"available":1000}}}]
```

Principais códigos de erro:
- `MISSING_FIELD`, `INVALID_OPERATION_TYPE`, `NON_FINITE_UNIT_COST`, `NEGATIVE_OR_ZERO_QUANTITY`, `SELL_EXCEEDS_POSITION`, `EMPTY_INPUT`, `INVALID_JSON`, `INTERNAL_ERROR`.

## Regras de Tributação (implementadas)
- Compra: não há imposto; atualiza a posição e o custo médio ponderado.
- Venda: calcula lucro/prejuízo com base no custo médio.
- Prejuízo: acumula para compensar lucros futuros.
- Isenção por operação: se o valor total negociado na venda ≤ R$ 20.000, o imposto é 0.
- Alíquota: 20% sobre o lucro tributável (após compensação de prejuízo) quando a venda excede R$ 20.000.

Observação: em vendas isentas (valor negociado ≤ R$ 20.000), o imposto é 0 e o prejuízo acumulado NÃO é consumido. A compensação de prejuízo só ocorre em vendas tributáveis (valor negociado > R$ 20.000).

## Como Rodar os Testes
```bash
npm test         # executa unit, integration e e2e
npm run coverage # executa testes + cobertura (lcov/html)
```

Estrutura de testes:
- Unit: objetos de valor, entidades, políticas, serviços de domínio
- Integration: orquestração do use case e mapeadores
- E2E: CLI real lendo stdin e escrevendo stdout

Cobertura:
- 100% em statements/branches/functions/lines nos módulos coletados (domínio, serviços, valores, políticas e mapeadores).
- A orquestração (`src/app/run-simulation.usecase.js`) e a infra de CLI são verificadas por testes de integração/E2E e não entram na coleta (config em `package.json`).

Relatório HTML: após `npm run coverage`, abra `coverage/index.html`.

## Arquitetura (resumo)
- Camadas: `infra` (CLI) → `app` (use case/mapeadores) → `domain` (entidades, VOs, políticas, serviços)
- Padrões: DDD, Use Case, Strategy (políticas), Result (Ok/Err), Imutabilidade, Money/Quantity como VOs com BigInt
- Serviços principais: `OperationProcessor` (aplica operação e calcula PnL bruto), `TaxCalculator` (compensação e imposto), `TaxSimulator` (fachada/estado do portfólio).

Detalhes completos em `docs/ARQUITETURA.md`.

## Licença
MIT — veja `LICENSE`.
