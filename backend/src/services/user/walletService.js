
import Wallet from "../../models/walletModel.js";
import WalletTransaction from "../../models/walletTransactionModel.js";



export const getWalletBalanceService = async (userId) => {
    const wallet = await Wallet.findOne({ user: userId });
    
    
    return { balance: wallet ? wallet.balance : 0 };
};

export const getWalletHistoryService = async (userId) => {
    const wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
        return { transactions: [] };
    }
    
    const transactions = await WalletTransaction.find({ walletId: wallet._id })
        .sort({ createdAt: -1 })
        .populate('orderId', 'orderId');
    console.log(transactions)  
    return { transactions };
};
