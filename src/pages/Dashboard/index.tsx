import React, { useState, useEffect } from 'react';

import { promises } from 'dns';
import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get('/transactions');
      const {
        transactions: getTransactions,
        balance: getBalance,
      } = response.data;
      const tmpTransactions: Transaction[] = [];

      getTransactions.forEach((a: Transaction) => {
        const transactionFormacted: Transaction = {
          id: a.id,
          title: a.title,
          value: a.value,
          formattedValue: formatValue(a.value),
          formattedDate: new Date(a.created_at).toLocaleDateString('pt-BR'),
          type: a.type,
          category: a.category,
          created_at: a.created_at, // eslint-disable-line
        };

        tmpTransactions.push(transactionFormacted);
        // setTransactions([...transactions, transactionFormacted]);
      });

      setTransactions([...transactions, ...tmpTransactions]);

      const updatedBalance: Balance = {
        income: formatValue(getBalance.income),
        outcome: formatValue(getBalance.outcome),
        total: formatValue(getBalance.total),
      };

      setBalance(updatedBalance);
    }

    loadTransactions();
  }, []); // eslint-disable-line

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const isIncome = transaction.type === 'income';

                return (
                  <tr key={transaction.id}>
                    <td className="title">{transaction.title}</td>
                    <td className={`${isIncome ? 'income' : 'outcome'}`}>
                      {!isIncome && '- '}
                      {transaction.formattedValue}
                    </td>
                    <td className="title">{transaction.category.title}</td>
                    <td>{transaction.formattedDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
