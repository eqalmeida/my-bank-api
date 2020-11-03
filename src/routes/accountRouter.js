import express from 'express';
import accountController from '../controllers/accountController.js';
const router = express.Router();

/**
 * 4. Crie um endpoint para registrar um depósito em uma conta.
 * Este endpoint deverá receber como parâmetros a “agencia”, o número da conta
 * e o valor do depósito. Ele deverá atualizar o “balance” da conta,
 * incrementando-o com o valor recebido como parâmetro. O endpoint deverá
 * validar se a conta informada existe, caso não exista deverá retornar um
 * erro, caso exista retornar o saldo atual da conta.
 */
router.post('/deposit', async (req, res) => {
  const { branch, accountNumber, value } = req.body;
  try {
    if (!branch || !accountNumber || !value) {
      throw new Error('Branch, account and value are required!');
    }
    const currBalance = await accountController.deposit(
      branch,
      accountNumber,
      value
    );
    res.send({ currentBalance: currBalance });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

/**
 * Crie um endpoint para registrar um saque em uma conta. Este endpoint deverá
 * receber como parâmetros a “agência”, o número da conta e o valor do saque.
 * Ele deverá atualizar o “balance” da conta, decrementando-o com o valor
 * recebido com parâmetro e cobrando uma tarifa de saque de (1). O endpoint
 * deverá validar se a conta informada existe, caso não exista deverá retornar
 * um erro, caso exista retornar o saldo atual da conta. Também deverá validar
 * se a conta possui saldo suficiente para aquele saque, se não tiver deverá
 * retornar um erro, não permitindo assim que o saque fique negativo.
 */
router.post('/withdraw', async (req, res) => {
  const { branch, accountNumber, value } = req.body;
  try {
    if (!branch || !accountNumber || !value) {
      throw new Error('Branch, account and value are required!');
    }

    const currBalance = await accountController.withdraw(
      branch,
      accountNumber,
      parseFloat(value)
    );
    res.send({ currentBalance: currBalance });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

/**
 * 6. Crie um endpoint para consultar o saldo da conta. Este endpoint deverá
 * receber como parâmetro a “agência” e o número da conta, e deverá retornar
 * seu “balance”. Caso a conta informada não exista, retornar um erro.
 */
router.get('/balance', async (req, res) => {
  const { branch, accountNumber } = req.body;
  try {
    if (!branch || !accountNumber) {
      throw new Error('Branch and account are required!');
    }

    const balance = await accountController.getBalance(branch, accountNumber);
    res.send({ balance });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

/**
 * 7. Crie um endpoint para excluir uma conta. Este endpoint deverá receber como
 * parâmetro a “agência” e o número da conta e retornar o número de contas
 * ativas para esta agência.
 */
router.delete('/', async (req, res) => {
  const { branch, accountNumber } = req.body;
  try {
    const activeAcounts = await accountController.deleteAccount(
      branch,
      accountNumber
    );
    res.send({ branch, activeAcounts });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

/**
 * 8. Crie um endpoint para realizar transferências entre contas. Este endpoint
 * deverá receber como parâmetro o número da “conta” origem, o número da “conta”
 * destino e o valor de transferência. Este endpoint deve validar se as contas
 * são da mesma agência para realizar a transferência, caso seja de agências
 * distintas o valor de tarifa de transferência (8) deve ser debitado na conta
 * origem. O endpoint deverá retornar o saldo da conta origem.
 */
router.post('/transfer', async (req, res) => {
  const { sourceAccount, destinationAccount, value } = req.body;
  try {
    const sourceBalance = await accountController.transferAmount(
      sourceAccount,
      destinationAccount,
      parseFloat(value)
    );
    res.send({ sourceAccount, sourceBalance });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

/**
 * 9. Crie um endpoint para consultar a média do saldo dos clientes de
 * determinada agência. O endpoint deverá receber como parâmetro a “agência” e
 * deverá retornar o balance médio da conta.
 */
router.get('/balanceavg/:branch', async (req, res) => {
  const { branch } = req.params;
  try {
    const balanceAvg = await accountController.getCustomersBalanceAvg(branch);
    res.send({ balanceAvg });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

/**
 * 10. Crie um endpoint para consultar os clientes com o menor saldo em conta.
 * O endpoint deverá receber como parâmetro um valor numérico para determinar a
 * quantidade de clientes a serem listados, e o endpoint deverá retornar em
 * ordem crescente pelo saldo a lista dos clientes (agência, conta, saldo).
 */
router.get('/lowestbalance/:qtd', async (req, res) => {
  const { qtd } = req.params;
  try {
    const customers = await accountController.getLowestBalanceCustomers(
      parseInt(qtd)
    );
    res.send(customers);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

/**
 * 11. Crie um endpoint para consultar os clientes mais ricos do banco. O
 * endpoint deverá receber como parâmetro um valor numérico para determinar a
 * quantidade de clientes a serem listados, e o endpoint deverá retornar em
 * ordem decrescente pelo saldo, crescente pelo nome, a lista dos clientes
 * (agência, conta, nome e saldo).
 */
router.get('/highestbalance/:qtd', async (req, res) => {
  const { qtd } = req.params;
  try {
    const customers = await accountController.getHighestBalanceCustomers(
      parseInt(qtd)
    );
    res.send(customers);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

/**
 * 12. Crie um endpoint que irá transferir o cliente com maior saldo em conta
 * de cada agência para a agência private agencia=99. O endpoint deverá retornar
 * a lista dos clientes da agencia private.
 */
router.patch('/upgrade-customers', async (req, res) => {
  try {
    const customers = await accountController.upgradeCustomers();
    res.send(customers);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

router.get('/reset-all', async (req, res) => {
  try {
    await accountController.reset();
    res.send({ message: 'Database reset' });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

export default router;
