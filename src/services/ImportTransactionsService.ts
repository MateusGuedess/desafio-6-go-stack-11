import fs from 'fs';
import { getCustomRepository, In, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import upload from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  path: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ path }: Request): Promise<Transaction[]> {
    // TODO
    const transactions: Transaction[] = [];

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoryRepository = getRepository(Category);

    const categoryList: string[] = [];

    const data = fs
      .readFileSync(path)
      .toString()
      .split('\n')
      .map(e => e.trim())
      .map(e => e.split(',').map(e => e.trim()));

    data.map(async (item, index) => {
      if (index === 0) return;

      if (!{ ...item }[0]) return;

      categoryList.push(item[3]);
    });

    const categoryExist = await categoryRepository.find({
      where: { title: In(categoryList) },
    });

    const categoriesInDatabase: string[] = [];

    categoryExist.map(item => {
      categoriesInDatabase.push(item.title);
    });

    const categoryListWithoutDuplicates = [...new Set(categoryList)];

    const categoriesToCreate = categoryListWithoutDuplicates.filter(
      item => !categoriesInDatabase.includes(item),
    );

    categoriesToCreate.map(async categoryTitle => {
      const createCategory = await categoryRepository.create({
        title: categoryTitle,
      });

      await categoryRepository.save(createCategory);
    });

    const mapReturn = await data.forEach(async (item, index) => {
      if (index === 0) return;
      if (!{ ...item }[0]) return;

      const categoryId = await categoryRepository.find({
        where: { title: item[3] },
      });

      const title: string = item[0];

      const transactionCreate = await transactionsRepository.create({
        title,
        value: item[2],
        type: item[1],
        category_id: categoryId[0] && categoryId[0].id,
      });

      await transactionsRepository.save(transactionCreate);
      await transactions.push(transactionCreate);

      return transactions;
    });

    console.log(mapReturn);
    await fs.unlink(path, () => {
      console.log();
    });

    return transactions;
  }
}

export default ImportTransactionsService;
