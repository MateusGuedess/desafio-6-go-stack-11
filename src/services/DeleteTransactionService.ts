import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    // TODO
    const transactionRepository = getRepository(Transaction);

    const transactionExist = await transactionRepository.findOne(id);

    if (!transactionExist) {
      throw new AppError('Transaction does not exist', 400);
    }

    await transactionRepository.delete(id);

    throw new AppError('', 204);
  }
}

export default DeleteTransactionService;
