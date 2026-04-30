import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT'], 
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1 
  },
  transactionReason: {
    type: String,
    enum: ['ORDER_CANCEL_REFUND', 'ORDER_RETURN_REFUND', 'ORDER_PURCHASE', 'ADMIN_ADJUSTMENT','REFERRAL_BONUS','WELCOME_BONUS',"ORDER_CANCEL_DEBIT"],
    required: true
  },
  description: {
    type: String, 
    required: true,
    trim: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', 
    default: null 
  }
}, { timestamps: true });

export default mongoose.model('WalletTransaction', walletTransactionSchema);
