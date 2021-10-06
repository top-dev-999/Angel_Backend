const Subscription = require('../../../models/subscription');
const Payment = require('../../../models/payment');
const Product = require('../../../models/product');

const dbMap = require('../../../utilities/db-map');
const HttpUtil = require('../../../utilities/http-util');

module.exports = class ProfileService {

    constructor() { }

    async getSubscriptions(accountId) {
        let subscriptionsDb = await Subscription.findByAccountId(accountId);
        let subscriptionPaymentIds = subscriptionsDb.map(x => x.subscriptionPaymentId);
        let subscriptionPayments = await Payment.findByIds(subscriptionPaymentIds);
        let paymentAmounts = subscriptionPayments.map(x => x.amountGross);  
        let productIds = subscriptionsDb.map(x => x.productId)
        let products = await Product.findByIds(productIds);
        
        let subscriptions = [];
        for (let i = 0; i < subscriptionsDb.length; i++) {
            let subscription = {};
            subscription.id = subscriptionsDb[i].id;            
            subscription.amount = paymentAmounts[i];
            subscription.dateCreated = subscriptionsDb[i].createdAt;
            subscription.productType = products[i].name;
            subscription.productImageUrl = products[i].imageUrl;
            subscriptions.push(subscription);
        }
        return subscriptions;
    }

    async getSubscriptionInfo(accountId, subscriptionId) {
        let subscription = await this.getBySubscriptionId(accountId, subscriptionId);
        let subscriptionPayments = await this.getSubscriptionPayments(subscription.Id);
        let product = await this.getProduct(subscription.productId);
        let subscriptionInfo = {
            id: subscription.id,
            amount: subscriptionPayments[0].amountGross,
            productName: product.name,
            dateCreated: subscription.createdAt
        }
        return subscriptionInfo;
    }

    async getBySubscriptionId(accountId, subscriptionId) {
        let subscriptionDb = await Subscription.findById(subscriptionId);
        if (!subscriptionDb || subscriptionDb.accountId != accountId) {
            HttpUtil.throw400Error('Invalid Request, subscription may not exist or account-product mismatch');
        }
        return dbMap(subscriptionDb);
    }

    async getSubscriptionPayments(subscriptionId) {
        let subscriptionPaymentDb = await Payment.findBySubscriptionId(subscriptionId);
        return subscriptionPaymentDb.map(x => dbMap(x));
    }

    async getProduct(subscriptionId) {
        let product = await Product.findById(subscriptionId);
        return dbMap(device);
    }

    async createSubscription(productId, accountId) {

        let subscription = new Subscription({
            productId: productId,
            accountId: accountId,
            status: ''
        });
        await subscription.save();

        return dbMap(subscription);
    }

    async cancelSubscription(accountId, productId) {
        let subscriptionDb = await Subscription.findByProductId(productId);
        if (!subscriptionDb || subscriptionDb.accountId != accountId) {
            HttpUtil.throw400Error('Invalid Request, subscription may not exist or account-product mismatch');
        }
        subscriptionDb.status = 'cancelled';
        await subscriptionDb.save();

        return dbMap(subscriptionDb);
    }
};