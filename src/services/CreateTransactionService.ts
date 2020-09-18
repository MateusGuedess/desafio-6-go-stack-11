import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    let existCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!existCategory) {
      existCategory = await categoriesRepository.create({ title: category });
      await categoriesRepository.save(existCategory);
    }

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Saldo inválido', 400);
    }

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category_id: existCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
