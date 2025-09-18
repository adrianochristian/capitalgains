Capital Gains Calculator (Node.js)

Como funciona
- Entrada: cada linha da stdin deve conter uma lista JSON de operações (use case). A última linha pode ser vazia para encerrar.
- Saída: para cada linha de entrada, o programa imprime uma lista JSON de objetos {"tax": number} correspondente a cada operação.

Regras de Tributação
- Compra: recalcula o preço médio ponderado; não há imposto.
- Venda: calcula PnL (preço de venda − custo médio) em centavos.
- Prejuízo: acumula em um pool para compensar lucros futuros.
- Isenção por operação: se o valor total da venda ≤ R$ 20.000,00, não há imposto e o prejuízo acumulado não é consumido.
- Imposto: 20% sobre o lucro tributável (após compensar prejuízo), arredondado para o centavo mais próximo.

Arquitetura
- src/cli.js: interface de linha de comando; lê stdin linha a linha.
- src/core/processor.js: processador de use cases (lista de operações → lista de { tax }).
- src/core/tax-rules.js: fachada do domínio; aplica uma operação ao estado.
- src/core/enums.js: enum Operation (BUY/SELL).
- src/core/config.js: configuração (alíquota, limite de isenção).
- src/core/errors.js: erros de domínio.
- src/core/portfolio.js: estado e invariantes (buy/sell, média, posição).
- src/core/policies/*: políticas declarativas (isenção de 20k, compensação de prejuízo, arredondamento de imposto).
- src/util/money.js: utilitários de dinheiro com conversão segura para centavos.

Rodando
- Interativo: `node src/cli.js` e digite cada linha JSON; finalize com linha vazia ou Ctrl+D.
- Pipe: `printf '%s\n' '[{"operation":"buy","unit-cost":10.00,"quantity":10000},{"operation":"sell","unit-cost":20.00,"quantity":5000}]' '' | node src/cli.js`

Testes
- Jest: `npm test`

Observações
- O estado é mantido apenas em memória e reiniciado para cada linha (use case).
- Cálculo em centavos evita problemas de ponto flutuante.
