const Subscription = require('../../../models/subscription');
const Payment = require('../../../models/payment');
const Product = require('../../../models/product');

module.exports = class ProfileService {

    constructor() { }

    async getInvoices(accountId) {
        let invoicesDb = await Invoice.findByAccountId(accountId); 
        let subscriptionPaymentIds = invoicesDb.map(x => x.subscriptionPaymentId);
        let subscriptionPayments = await Payment.findByIds(subscriptionPaymentIds);
        let paymentAmounts = subscriptionPayments.map(x => x.amountGross);  
        let subscriptionIds = subscriptionPayments.map(x => x.subscriptionId);  
        let subscriptions = await Subscription.findByIds(subscriptionIds);
        let productIds = subscriptions.map(x => x.productId)
        let products = await Product.findByIds(productIds);
        
        let invoices = [];
        for (let i = 0; i < invoicesDb.length; i++) {
            let invoice = {};
            invoice.id = invoicesDb[i].id;            
            invoice.amount = paymentAmounts[i];
            invoice.dateCreated = invoicesDb[i].createdAt;
            for (let j = 0; j < subscriptions.length; j++) {
                if (subscriptions[j].id == subscriptionIds[i]) {
                    invoice.productType = products[j].name;
                    invoice.productImageUrl = products[j].imageUrl;
                }
            }
            invoices.push(invoice);
        }
        return invoices;
    }

    async getById(invoiceId) {
        let invoice = await Invoice.findById(invoiceId); 
        let subscriptionPayment = await Payment.findById(invoiceId);
        let subscription = await Subscription.findById(subscriptionPayment.id);
        let product = await Product.findById(subscription.id);
        
        invoice = {
            id: invoice.id,
            productType: product.name,
            productImageUrl: product.imageUrl,
            amount: subscriptionPayment.amountGross,
            dateCreated: invoice.createdAt
        }
        return invoice;
    }

};