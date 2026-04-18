import Wallet from '../models/walletModel.js';
import WalletTransaction from '../models/walletTransactionModel.js';
import { AppError } from './appError.js';
import { STATUS_CODES } from './constants.js';

export const creditWallet = async (userId, amount, reason, description, orderId = null) => {
    let wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
        wallet = await Wallet.create({ user: userId, balance: 0 });
    }
    
    wallet.balance += amount;
    await wallet.save();
    
    await WalletTransaction.create({
        walletId: wallet._id,
        type: 'CREDIT',
        amount: amount,
        transactionReason: reason, 
        description: description,
        orderId: orderId
    });

    return wallet;
};


export const debitWallet = async (userId, amount, reason, description, orderId = null) => {
    let wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet || wallet.balance < amount) {
        throw new AppError(
            STATUS_CODES.BAD_REQUEST, 
            "INSUFFICIENT_BALANCE", 
            "You do not have enough wallet balance for this transaction."
        );
    }
    

    wallet.balance -= amount;
    await wallet.save();
    

    await WalletTransaction.create({
        walletId: wallet._id,
        type: 'DEBIT',
        amount: amount,
        transactionReason: reason, 
        description: description,
        orderId: orderId
    });

    return wallet;
};

