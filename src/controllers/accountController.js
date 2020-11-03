import AccountModel from '../models/Account.js';
import { promises as fs } from 'fs';

export default {
  /**
   * 4. Crie um endpoint para registrar um depósito em uma conta.
   * Este endpoint deverá receber como parâmetros a “agencia”, o número da conta
   * e o valor do depósito. Ele deverá atualizar o “balance” da conta,
   * incrementando-o com o valor recebido como parâmetro. O endpoint deverá
   * validar se a conta informada existe, caso não exista deverá retornar um
   * erro, caso exista retornar o saldo atual da conta.
   */
  deposit: async function (branch, account, value) {
    const acc = await AccountModel.findOne({ branch, accountNumber: account });
    if (!acc) {
      throw new Error('Account/branch not found');
    }
    let depositValue = parseFloat(value);
    if (!depositValue || !(depositValue > 0.0)) {
      throw new Error('Invalid value');
    }
    acc.balance += depositValue;
    await acc.save();
    return acc.balance;
  },

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
  withdraw: async function (branch, account, value) {
    const acc = await AccountModel.findOne({ branch, accountNumber: account });
    if (!acc) {
      throw new Error('Account/branch not found');
    }
    let withdrawValue = parseFloat(value);
    if (!withdrawValue) {
      throw new Error('Invalid value');
    }

    if (!(withdrawValue > 0.0)) {
      throw new Error('Invalid value');
    }

    // Withdraw taxes
    withdrawValue += 1;

    if (withdrawValue > acc.balance) {
      throw new Error('No avaliable balance for this withdraw');
    }

    acc.balance -= withdrawValue;
    await acc.save();
    return acc.balance;
  },

  /**
   * 6. Crie um endpoint para consultar o saldo da conta. Este endpoint deverá
   * receber como parâmetro a “agência” e o número da conta, e deverá retornar
   * seu “balance”. Caso a conta informada não exista, retornar um erro.
   */
  getBalance: async function (branch, account) {
    const acc = await AccountModel.findOne({ branch, accountNumber: account });
    if (!acc) {
      throw new Error('Account/branch not found');
    }
    return acc.balance;
  },

  /**
   * 7. Crie um endpoint para excluir uma conta. Este endpoint deverá receber como
   * parâmetro a “agência” e o número da conta e retornar o número de contas
   * ativas para esta agência.
   */
  deleteAccount: async function (branch, account) {
    const acc = await AccountModel.findOne({ branch, accountNumber: account });
    if (!acc) {
      throw new Error('Account and/or branch not found');
    }
    await AccountModel.deleteOne({ branch, accountNumber: account });
    return await AccountModel.countDocuments({ branch });
  },

  /**
   * 8. Crie um endpoint para realizar transferências entre contas. Este endpoint
   * deverá receber como parâmetro o número da “conta” origem, o número da “conta”
   * destino e o valor de transferência. Este endpoint deve validar se as contas
   * são da mesma agência para realizar a transferência, caso seja de agências
   * distintas o valor de tarifa de transferência (8) deve ser debitado na conta
   * origem. O endpoint deverá retornar o saldo da conta origem.
   */
  transferAmount: async function (sourceAccount, destinationAccount, value) {
    const destination = await AccountModel.findOne({
      accountNumber: destinationAccount,
    });

    const transferValue = parseFloat(value);

    if (!transferValue || !(transferValue > 0)) {
      throw new Error('Invalid value');
    }

    if (!destination) {
      throw new Error('Destination Account not found');
    }
    const source = await AccountModel.findOne({ accountNumber: sourceAccount });
    if (!source) {
      throw new Error('Source Account not found');
    }

    if (source.branch !== destination.branch) {
      source.balance -= 8;
    }
    source.balance -= transferValue;
    destination.balance += transferValue;

    await source.save();
    await destination.save();

    return source.balance;
  },

  /**
   * 9. Crie um endpoint para consultar a média do saldo dos clientes de
   * determinada agência. O endpoint deverá receber como parâmetro a “agência” e
   * deverá retornar o balance médio da conta.
   */
  getCustomersBalanceAvg: async function (branch) {
    // Find all balances of this branch
    const branchList = await AccountModel.find(
      { branch },
      { _id: 0, balance: 1 }
    );
    let avg = 0;
    if (branchList.length > 0) {
      avg =
        branchList.map((a) => a.balance).reduce((curr, acc) => curr + acc, 0) /
        branchList.length;
    }
    return { branch, avg };
  },

  /**
   * 10. Crie um endpoint para consultar os clientes com o menor saldo em conta.
   * O endpoint deverá receber como parâmetro um valor numérico para determinar a
   * quantidade de clientes a serem listados, e o endpoint deverá retornar em
   * ordem crescente pelo saldo a lista dos clientes (agência, conta, saldo).
   */
  getLowestBalanceCustomers: async function (qtd) {
    const query = await AccountModel.find()
      .sort({ balance: 1, name: 1 })
      .limit(parseInt(qtd));
    return query;
  },

  /**
   * 11. Crie um endpoint para consultar os clientes mais ricos do banco. O
   * endpoint deverá receber como parâmetro um valor numérico para determinar a
   * quantidade de clientes a serem listados, e o endpoint deverá retornar em
   * ordem decrescente pelo saldo, crescente pelo nome, a lista dos clientes
   * (agência, conta, nome e saldo).
   */
  getHighestBalanceCustomers: async function (qtd) {
    const query = await AccountModel.find()
      .sort({ balance: -1, name: 1 })
      .limit(parseInt(qtd));
    return query;
  },

  /**
   * 12. Crie um endpoint que irá transferir o cliente com maior saldo em conta
   * de cada agência para a agência private agencia=99. O endpoint deverá retornar
   * a lista dos clientes da agencia private.
   */
  upgradeCustomers: async function () {
    const branches = await AccountModel.find().distinct('branch');

    for (const branch of branches) {
      if (branch !== 99) {
        const account = (
          await AccountModel.find({ branch })
            .sort({ balance: -1, name: 1 })
            .limit(1)
        )[0];
        account.oldBranch = account.branch;
        account.branch = 99;
        await account.save();
      }
    }

    const privateAccounts = await AccountModel.find({ branch: 99 });

    return { privateAccounts };
  },

  /**
   * Inicializa o banco de dados.
   */
  reset: async function () {
    await AccountModel.deleteMany({});
    const file = await fs.readFile('src/db/accounts-5.json', {
      encoding: 'utf-8',
    });

    const json = JSON.parse(file);

    for (const account of json) {
      let acc = new AccountModel({
        name: account.name,
        branch: account.agencia,
        accountNumber: account.conta,
        balance: account.balance,
      });
      await acc.save();
    }
  },
};
