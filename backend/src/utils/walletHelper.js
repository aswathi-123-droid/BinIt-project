import Wallet from '../models/walletModel.js';
import WalletTransaction from '../models/walletTransactionModel.js';
import { AppError } from './appError.js';
import { STATUS_CODES } from './constants.js';

export const creditWallet = async (userId, amount, reason, description, orderId = null) => {
    // 1. Find the user's wallet (or create one if this is their first refund)
    let wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
        wallet = await Wallet.create({ user: userId, balance: 0 });
    }
    
    // 2. Add the refund amount to their balance
    wallet.balance += amount;
    await wallet.save();
    
    // 3. Create the immutable ledger entry
    await WalletTransaction.create({
        walletId: wallet._id,
        type: 'CREDIT',
        amount: amount,
        transactionReason: reason, // e.g., 'ORDER_CANCEL_REFUND'
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
    
    // 1. Deduct the amount
    wallet.balance -= amount;
    await wallet.save();
    
    // 2. Create the DEBIT transaction ledger entry
    await WalletTransaction.create({
        walletId: wallet._id,
        type: 'DEBIT',
        amount: amount,
        transactionReason: reason, // e.g., 'ORDER_PURCHASE'
        description: description,
        orderId: orderId
    });

    return wallet;
};

